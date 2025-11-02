"use client"

import type React from "react"
import { createContext, useContext } from "react"

export type NotificationType = "sucesso" | "erro" | "aviso" | "info"

// Interface mantida para compatibilidade com UnifiedNotificationCard
export interface SystemNotification {
  id: string
  tipo: NotificationType
  mensagem: string
  data: Date
  is_read: boolean
}

interface NotificationContextValue {
  // Context vazio - todas as notificações vêm da API
  // Mantido apenas para estrutura e possível implementação futura de WebSocket
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider")
  }
  return context
}
