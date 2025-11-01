"use client"

import { useEffect, useState } from "react"
import { useNotificacoesService } from "../services/notifiacaoService"
import { useNotificationContext } from "../lib/context/NotificationContext"
import { useAuth } from "../lib/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/atoms/Card"
import { Button } from "../components/atoms/Button"
import { Badge } from "../components/atoms/Badge"
import { ConfirmModal } from "../components/atoms/ConfirmModal"
import { Header } from "../components/organisms/Header"
import { UnifiedNotificationCard } from "../components/molecules/UnifiedNotificationCard"
import type { Notificacao } from "../lib/types/index"
import type { FrontendNotification, NotificationType } from "../lib/context/NotificationContext"

// Tipo unificado para notificações
interface UnifiedNotification {
  id: string
  tipo: NotificationType
  mensagem: string
  origem: "frontend" | "backend"
  data: Date
  is_read: boolean
  // Campos específicos do backend
  backendId?: number
  evento_titulo?: string
}

export default function NotificacoesPage() {
  const service = useNotificacoesService()
  const { frontendNotifications, markFrontendAsRead, markAllFrontendAsRead, deleteFrontendNotification } = useNotificationContext()
  const { state } = useAuth()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [originFilter, setOriginFilter] = useState<"all" | "frontend" | "backend">("all")
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    notificacaoId: string | null
    origem: "frontend" | "backend"
  }>({
    isOpen: false,
    notificacaoId: null,
    origem: "frontend",
  })

  useEffect(() => {
    let mounted = true
    let timer: number | undefined

    const load = async () => {
      if (!mounted) return
      setLoading(true)
      try {
        const data = await service.listNotificacoes(1)
        if (mounted) setNotificacoes(data.results || data)
      } catch (err) {
        console.error("Erro ao buscar notificações", err)
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

    // Converter notificações do backend para formato unificado
    const backendToUnified = (n: Notificacao): UnifiedNotification => ({
      id: `backend-${n.id}`,
      tipo: "info", // Notificações do backend são geralmente informativas
      mensagem: n.mensagem,
      origem: "backend",
      data: new Date(n.created_at),
      is_read: n.is_read,
      backendId: n.id,
      evento_titulo: n.evento_titulo
    })

    // Converter notificações do frontend para formato unificado
    const frontendToUnified = (n: FrontendNotification): UnifiedNotification => ({
      id: n.id,
      tipo: n.tipo,
      mensagem: n.mensagem,
      origem: n.origem,
      data: n.data,
      is_read: n.is_read
    })

    // Unificar e ordenar notificações
    const unifiedNotifications = [
      ...notificacoes.map(backendToUnified),
      ...frontendNotifications.map(frontendToUnified)
    ].sort((a, b) => b.data.getTime() - a.data.getTime())

    const handleMarkAsRead = async (id: string, origem: "frontend" | "backend") => {
      if (origem === "frontend") {
        markFrontendAsRead(id)
        return
      }

      // Backend
      const backendId = parseInt(id.replace("backend-", ""))
    try {
        await service.markAsRead(backendId)
        setNotificacoes((prev) => prev.map((it) => (it.id === backendId ? { ...it, is_read: true } : it)))
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (err) {
      console.error("Erro marcando como lida", err)
    }
  }

  const handleMarkAllAsRead = async () => {
      // Marcar frontend
      markAllFrontendAsRead()

      // Marcar backend
    try {
      const unreadNotifications = notificacoes.filter((n) => !n.is_read)
      await Promise.all(unreadNotifications.map((n) => service.markAsRead(n.id)))
      setNotificacoes((prev) => prev.map((it) => ({ ...it, is_read: true })))
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (err) {
      console.error("Erro marcando todas como lidas", err)
    }
  }

    const handleDelete = async (id: string, origem: "frontend" | "backend") => {
    setDeleteConfirmState({
      isOpen: true,
      notificacaoId: id,
        origem,
    })
  }

  const executeDelete = async () => {
      const { notificacaoId, origem } = deleteConfirmState
      if (!notificacaoId) return

      if (origem === "frontend") {
        deleteFrontendNotification(notificacaoId)
        setDeleteConfirmState({ isOpen: false, notificacaoId: null, origem: "frontend" })
        return
      }

      // Backend
      const backendId = parseInt(notificacaoId.replace("backend-", ""))
    try {
        await service.deleteNotificacao(backendId)
        setNotificacoes((prev) => prev.filter((it) => it.id !== backendId))
      window.dispatchEvent(new Event("notificationsUpdated"))
    } catch (err) {
      console.error("Erro ao excluir notificação", err)
    } finally {
        setDeleteConfirmState({ isOpen: false, notificacaoId: null, origem: "backend" })
    }
  }

  const closeDeleteConfirm = () => {
      setDeleteConfirmState({ isOpen: false, notificacaoId: null, origem: "frontend" })
  }

    // Aplicar filtros
    const filteredNotificacoes = unifiedNotifications.filter((n) => {
      // Filtro de leitura
    if (filter === "unread") return !n.is_read
    if (filter === "read") return n.is_read
    
      // Filtro de origem
      if (originFilter === "frontend") return n.origem === "frontend"
      if (originFilter === "backend") return n.origem === "backend"
    
    return true
  })

    const unreadCount = unifiedNotifications.filter((n) => !n.is_read).length
    const frontendCount = unifiedNotifications.filter((n) => n.origem === "frontend").length
    const backendCount = unifiedNotifications.filter((n) => n.origem === "backend").length

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
                  Todas ({unifiedNotifications.length})
              </Button>
              <Button variant={filter === "unread" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("unread")}>
                Não lidas ({unreadCount})
              </Button>
              <Button variant={filter === "read" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("read")}>
                  Lidas ({unifiedNotifications.length - unreadCount})
                </Button>
              </div>

              {/* Filtros de origem */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                <Button variant={originFilter === "all" ? "primary" : "ghost"} size="sm" onClick={() => setOriginFilter("all")}>
                  Todas as origens
                </Button>
                <Button variant={originFilter === "frontend" ? "primary" : "ghost"} size="sm" onClick={() => setOriginFilter("frontend")}>
                  Interface ({frontendCount})
                </Button>
                <Button variant={originFilter === "backend" ? "primary" : "ghost"} size="sm" onClick={() => setOriginFilter("backend")}>
                  Sistema ({backendCount})
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
                  onMarkAsRead={(id) => handleMarkAsRead(id, n.origem)}
                  onDelete={(id) => handleDelete(id, n.origem)}
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
