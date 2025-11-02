"use client"

import { useEffect, useState } from "react"
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

// ✨ Tipo unificado APENAS para notificações do SISTEMA (backend)
// Notificações de UI (toasts) NÃO aparecem mais aqui
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
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    notificacaoId: number | null
  }>({
    isOpen: false,
    notificacaoId: null,
  })

  useEffect(() => {
    let mounted = true
    let timer: number | undefined

    const load = async () => {
      if (!mounted) return
      setLoading(true)
      try {
        // ✨ Carregar TODAS as notificações (não apenas a primeira página)
        let allNotifications: Notificacao[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const data = await service.listNotificacoes(page)
          const results = data.results || data
          
          if (Array.isArray(results)) {
            allNotifications = [...allNotifications, ...results]
            
            // Verificar se há mais páginas
            hasMore = !!data.next
            page++
          } else {
            hasMore = false
          }
        }

        if (mounted) setNotificacoes(allNotifications)
      } catch (err) {
        // Erro silencioso - manter estado anterior
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // primeira carga imediata
    load()
    // polling controlado a cada 30s
    timer = window.setInterval(load, 30000)

    return () => {
      mounted = false
      if (timer) window.clearInterval(timer)
    }
  }, [state.user?.id, service])

  // ✨ Converter notificações do backend para formato de exibição
  const backendToDisplay = (n: Notificacao): SystemNotificationDisplay => ({
    id: `backend-${n.id}`,
    tipo: "info", // Notificações do backend são geralmente informativas
    mensagem: n.mensagem,
    data: new Date(n.created_at),
    is_read: n.is_read,
    evento_titulo: n.evento_titulo
  })

  // ✨ APENAS notificações do backend (sistema) são exibidas
  const systemNotifications = notificacoes
    .map(backendToDisplay)
    .sort((a, b) => b.data.getTime() - a.data.getTime())

  const handleMarkAsRead = async (id: string) => {
    const backendId = parseInt(id.replace("backend-", ""))
    try {
      await service.markAsRead(backendId)
      setNotificacoes((prev) => prev.map((it) => (it.id === backendId ? { ...it, is_read: true } : it)))
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (err) {
      // Erro silencioso
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notificacoes.filter((n) => !n.is_read)
      await Promise.all(unreadNotifications.map((n) => service.markAsRead(n.id)))
      setNotificacoes((prev) => prev.map((it) => ({ ...it, is_read: true })))
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (err) {
      // Erro silencioso
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
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (err) {
      // Erro silencioso
    } finally {
      setDeleteConfirmState({ isOpen: false, notificacaoId: null })
    }
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirmState({ isOpen: false, notificacaoId: null })
  }

  // ✨ Aplicar filtro de leitura
  const filteredNotificacoes = systemNotifications.filter((n) => {
    if (filter === "unread") return !n.is_read
    if (filter === "read") return n.is_read
    return true
  })

  const unreadCount = systemNotifications.filter((n) => !n.is_read).length

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
                Todas ({systemNotifications.length})
              </Button>
              <Button variant={filter === "unread" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("unread")}>
                Não lidas ({unreadCount})
              </Button>
              <Button variant={filter === "read" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("read")}>
                Lidas ({systemNotifications.length - unreadCount})
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
