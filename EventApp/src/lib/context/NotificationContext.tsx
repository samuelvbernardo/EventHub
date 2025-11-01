"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useAuth } from "./AuthContext"

export type NotificationType = "sucesso" | "erro" | "aviso" | "info"
export type NotificationOrigin = "frontend" | "backend"

export interface FrontendNotification {
  id: string
  tipo: NotificationType
  mensagem: string
  origem: NotificationOrigin
  data: Date
  is_read: boolean
}

interface NotificationContextValue {
  frontendNotifications: FrontendNotification[]
  addFrontendNotification: (tipo: NotificationType, mensagem: string) => void
  markFrontendAsRead: (id: string) => void
  markAllFrontendAsRead: () => void
  deleteFrontendNotification: (id: string) => void
  getUnreadFrontendCount: () => number
  clearOldNotifications: () => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

const STORAGE_PREFIX = "eventhub_frontend_notifications"
const MAX_AGE_HOURS = 24

// Monta a chave de storage por usuário
const storageKeyForUser = (userId?: number | null) =>
  userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX

// Carregar notificações do localStorage (por usuário)
const loadFromStorage = (userId?: number | null): FrontendNotification[] => {
  try {
    const stored = localStorage.getItem(storageKeyForUser(userId))
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    // Converter strings de data de volta para Date objects
    return parsed.map((n: any) => ({
      ...n,
      data: new Date(n.data)
    }))
  } catch (error) {
    console.error("Erro ao carregar notificações do localStorage:", error)
    return []
  }
}

// Salvar notificações no localStorage (por usuário)
const saveToStorage = (userId: number, notifications: FrontendNotification[]) => {
  try {
    localStorage.setItem(storageKeyForUser(userId), JSON.stringify(notifications))
  } catch (error) {
    console.error("Erro ao salvar notificações no localStorage:", error)
  }
}

// Limpar notificações antigas (mais de 24h)
const filterOldNotifications = (notifications: FrontendNotification[]): FrontendNotification[] => {
  const now = new Date()
  const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000 // 24 horas em ms
  
  return notifications.filter(notification => {
    const age = now.getTime() - notification.data.getTime()
    return age < maxAge
  })
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [frontendNotifications, setFrontendNotifications] = useState<FrontendNotification[]>([])
  const { state } = useAuth()
  const userId = state.user?.id ?? null

  // Carregar notificações ao trocar de usuário autenticado
  useEffect(() => {
    // Logout ou sem usuário -> limpar tudo (memória + storage)
    if (!userId) {
      setFrontendNotifications([])
      try {
        // Remover chaves antigas e por usuário
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key)
          }
        }
      } catch {}
      // Notificar UI
      window.dispatchEvent(new Event("notificationsUpdated"))
      return
    }

    // Usuário logado -> carregar somente notificações do usuário atual
    const loaded = loadFromStorage(userId)
    const filtered = filterOldNotifications(loaded)
    setFrontendNotifications(filtered)
    // Se houve remoção de notificações antigas, atualizar storage do usuário
    if (filtered.length !== loaded.length) {
      saveToStorage(userId, filtered)
    }
  }, [userId])

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    if (userId) {
      saveToStorage(userId, frontendNotifications)
    }
  }, [frontendNotifications, userId])

  // Limpar notificações antigas periodicamente (a cada hora)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrontendNotifications(prev => {
        const filtered = filterOldNotifications(prev)
        return filtered
      })
    }, 60 * 60 * 1000) // 1 hora

    return () => clearInterval(interval)
  }, [])

  const addFrontendNotification = useCallback((tipo: NotificationType, mensagem: string) => {
    const notification: FrontendNotification = {
      id: `frontend-${Date.now()}-${Math.random()}`,
      tipo,
      mensagem,
      origem: "frontend",
      data: new Date(),
      is_read: false
    }

    setFrontendNotifications(prev => [notification, ...prev])
    
    // Disparar evento para atualizar contador no Header
    window.dispatchEvent(new Event("notificationsUpdated"))
  }, [])

  const markFrontendAsRead = useCallback((id: string) => {
    setFrontendNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    window.dispatchEvent(new Event("notificationsUpdated"))
  }, [])

  const markAllFrontendAsRead = useCallback(() => {
    setFrontendNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    )
    window.dispatchEvent(new Event("notificationsUpdated"))
  }, [])

  const deleteFrontendNotification = useCallback((id: string) => {
    setFrontendNotifications(prev => prev.filter(n => n.id !== id))
    window.dispatchEvent(new Event("notificationsUpdated"))
  }, [])

  const getUnreadFrontendCount = useCallback(() => {
    return frontendNotifications.filter(n => !n.is_read).length
  }, [frontendNotifications])

  const clearOldNotifications = useCallback(() => {
    setFrontendNotifications(prev => filterOldNotifications(prev))
  }, [])

  const clearAll = useCallback(() => {
    setFrontendNotifications([])
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      }
    } catch {}
    window.dispatchEvent(new Event("notificationsUpdated"))
  }, [])

  return (
    <NotificationContext.Provider 
      value={{ 
        frontendNotifications,
        addFrontendNotification,
        markFrontendAsRead,
        markAllFrontendAsRead,
        deleteFrontendNotification,
        getUnreadFrontendCount,
        clearOldNotifications,
        clearAll
      }}
    >
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
