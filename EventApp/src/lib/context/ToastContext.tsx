"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { Toast, type ToastVariant } from "../../components/atoms/Toast"
import { useNotificationContext, type NotificationType } from "./NotificationContext"

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const notificationContext = useNotificationContext()

  // Mapear variante de toast para tipo de notificação
  const mapVariantToType = (variant: ToastVariant): NotificationType => {
    const map: Record<ToastVariant, NotificationType> = {
      success: "sucesso",
      error: "erro",
      warning: "aviso",
      info: "info"
    }
    return map[variant]
  }

  const addToast = useCallback((message: string, variant: ToastVariant = "info", duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, variant, duration }])
    
    // Adicionar também ao contexto de notificações
    notificationContext.addFrontendNotification(mapVariantToType(variant), message)
  }, [notificationContext])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    addToast(message, "success", duration)
  }, [addToast])

  const error = useCallback((message: string, duration?: number) => {
    addToast(message, "error", duration)
  }, [addToast])

  const warning = useCallback((message: string, duration?: number) => {
    addToast(message, "warning", duration)
  }, [addToast])

  const info = useCallback((message: string, duration?: number) => {
    addToast(message, "info", duration)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container - Fixed top-right */}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
