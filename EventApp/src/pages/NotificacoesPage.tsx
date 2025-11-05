"use client"

import { useEffect, useState, useCallback } from "react"
import { useNotificacoesService } from "../services/notifiacaoService"
import { useAuth } from "../lib/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/atoms/Card"
import { Button } from "../components/atoms/Button"
import { Badge } from "../components/atoms/Badge"
import { ConfirmModal } from "../components/atoms/ConfirmModal"
import { Header } from "../components/organisms/Header"
import { UnifiedNotificationCard } from "../components/molecules/UnifiedNotificationCard"
import type { Notificacao } from "../lib/types/index"
import type { NotificationType } from "../lib/context/NotificationContext"
import { useToast } from "../lib/context/ToastContext"


interface SystemNotificationDisplay {
  id: string
  tipo: NotificationType
  mensagem: string
  data: Date
  is_read: boolean
  evento_titulo?: string
}

export default function NotificacoesPage() {
  const service = useNotificacoesService()
  const { state } = useAuth()
  const toast = useToast()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [unreadCount, setUnreadCount] = useState(0)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    notificacaoId: number | null
  }>({
    isOpen: false,
    notificacaoId: null,
  })

  // Carregar contador de não lidas
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await service.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      // Erro silencioso
    }
  }, [service])

  // Carregar todas as notificações
  const loadNotifications = useCallback(async () => {
    if (!state.user?.id) return
    
    setLoading(true)
    try {
      let allNotifications: Notificacao[] = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const data = await service.listNotificacoes(currentPage)
        allNotifications = [...allNotifications, ...(data.results || [])]
        hasMore = !!data.next
        currentPage++
      }

      setNotificacoes(allNotifications)
    } catch (err) {
      toast.error("Erro ao carregar notificações")
    } finally {
      setLoading(false)
    }
  }, [state.user?.id, service, toast])

  // Carregar dados iniciais
  useEffect(() => {
    loadUnreadCount()
    loadNotifications()
  }, [loadUnreadCount, loadNotifications])

  // Polling
  useEffect(() => {
    const timer = window.setInterval(() => {
      loadUnreadCount()
      loadNotifications()
    }, 30000)

    return () => window.clearInterval(timer)
  }, [loadUnreadCount, loadNotifications])

  // Converter notificações do backend para formato de exibição
  const backendToDisplay = (n: Notificacao): SystemNotificationDisplay => ({
    id: `backend-${n.id}`,
    tipo: "info", // Notificações do backend são geralmente informativas
    mensagem: n.mensagem,
    data: new Date(n.created_at),
    is_read: n.is_read,
    evento_titulo: n.evento_titulo
  })

  const handleMarkAsRead = async (id: string) => {
    const backendId = parseInt(id.replace("backend-", ""))
    try {
      await service.markAsRead(backendId)
      setNotificacoes((prev) => prev.map((it) => (it.id === backendId ? { ...it, is_read: true } : it)))
      await loadUnreadCount()
      window.dispatchEvent(new Event("notificationsUpdated"))
      toast.success("Notificação marcada como lida")
    } catch (err) {
      toast.error("Erro ao marcar como lida")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notificacoes.filter((n) => !n.is_read)
      await Promise.all(unreadNotifications.map((n) => service.markAsRead(n.id)))
      setNotificacoes((prev) => prev.map((it) => ({ ...it, is_read: true })))
      await loadUnreadCount()
      window.dispatchEvent(new Event("notificationsUpdated"))
      toast.success("Todas as notificações foram marcadas como lidas!")
    } catch (err) {
      toast.error("Erro ao marcar todas como lidas")
    }
  }

  const handleDelete = async (id: string) => {
    const backendId = parseInt(id.replace("backend-", ""))
    setDeleteConfirmState({
      isOpen: true,
      notificacaoId: backendId,
    })
  }

  const executeDelete = async () => {
    const { notificacaoId } = deleteConfirmState
    if (!notificacaoId) return

    try {
      await service.deleteNotificacao(notificacaoId)
      setNotificacoes((prev) => prev.filter((it) => it.id !== notificacaoId))
      await loadUnreadCount()
      await loadNotifications()
      window.dispatchEvent(new Event("notificationsUpdated"))
      toast.success("Notificação removida com sucesso!")
    } catch (err) {
      toast.error("Erro ao remover notificação")
    } finally {
      setDeleteConfirmState({ isOpen: false, notificacaoId: null })
    }
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirmState({ isOpen: false, notificacaoId: null })
  }

  const systemNotifications = notificacoes
    .map(backendToDisplay)
    .sort((a, b) => b.data.getTime() - a.data.getTime())

  // Aplicar filtro de leitura
  const filteredNotificacoes = systemNotifications.filter((n) => {
    if (filter === "unread") return !n.is_read
    if (filter === "read") return n.is_read
    return true
  })

  const totalCount = notificacoes.length
  const readCount = notificacoes.filter(n => n.is_read).length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <CardTitle>Notificações</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant={filter === "all" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("all")}>
                Todas ({totalCount})
              </Button>
              <Button variant={filter === "unread" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("unread")}>
                Não lidas ({unreadCount})
              </Button>
              <Button variant={filter === "read" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("read")}>
                Lidas ({readCount})
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando notificações...</p>
              </div>
            )}

            {!loading && filteredNotificacoes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {filter === "all" && "Nenhuma notificação"}
                  {filter === "unread" && "Nenhuma notificação não lida"}
                  {filter === "read" && "Nenhuma notificação lida"}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {filteredNotificacoes.map((n) => (
                <UnifiedNotificationCard
                  key={n.id}
                  notification={n}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Excluir Notificação"
        message="Tem certeza que deseja excluir esta notificação?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>
  )
}
