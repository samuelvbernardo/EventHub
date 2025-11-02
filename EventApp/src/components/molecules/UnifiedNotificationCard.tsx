import type React from "react"
import { Button } from "../atoms/Button"
import type { NotificationType } from "../../lib/context/NotificationContext"


interface SystemNotificationCardProps {
  notification: {
    id: string
    tipo: NotificationType
    mensagem: string
    data: Date
    is_read: boolean
    evento_titulo?: string
  }
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export const UnifiedNotificationCard: React.FC<SystemNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  // Ícones e cores por tipo
  const getTypeConfig = (tipo: string) => {
    switch (tipo) {
      case "sucesso":
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800"
        }
      case "erro":
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800"
        }
      case "aviso":
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800"
        }
      case "info":
      default:
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800"
        }
    }
  }

  const config = getTypeConfig(notification.tipo)
  const timeAgo = getTimeAgo(notification.data)

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all duration-200
        ${notification.is_read ? 'bg-background/50' : config.bgColor}
        ${config.borderColor}
        ${!notification.is_read ? 'shadow-sm' : ''}
        hover:shadow-md
      `}
    >
      <div className="flex gap-3">
        {/* Ícone do tipo */}
        <div className={`flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.mensagem}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            
            <div className="flex gap-2">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-7 text-xs"
                >
                  Marcar como lida
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para calcular tempo decorrido
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d atrás`
  if (hours > 0) return `${hours}h atrás`
  if (minutes > 0) return `${minutes}min atrás`
  return "Agora"
}
