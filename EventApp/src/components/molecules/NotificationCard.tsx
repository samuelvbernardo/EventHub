"use client"

import type React from "react"
import { Button } from "../atoms/Button"
import { Badge } from "../atoms/Badge"
import { formatDate } from "../../lib/utils/helpers"
import type { Notificacao } from "../../lib/types/index"

interface NotificationCardProps {
  notificacao: Notificacao
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notificacao, onMarkAsRead, onDelete }) => {
  return (
    <div
      className={`p-4 border rounded-lg transition-all hover:shadow-md ${
        notificacao.is_read ? "bg-card border-border" : "bg-accent/50 border-primary/30"
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {!notificacao.is_read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
            <span className="text-xs text-muted-foreground">{formatDate(notificacao.created_at)}</span>
          </div>

          <p className={`text-foreground ${!notificacao.is_read ? "font-medium" : ""}`}>{notificacao.mensagem}</p>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {notificacao.evento_titulo}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!notificacao.is_read && (
            <Button size="sm" variant="ghost" onClick={() => onMarkAsRead(notificacao.id)}>
              Marcar como lida
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDelete(notificacao.id)}>
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}
