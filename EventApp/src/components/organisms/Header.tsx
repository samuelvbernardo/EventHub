"use client"

import type React from "react"
import { useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNotificacoesService } from "../../services"
import { useNotificationContext } from "../../lib/context/NotificationContext"
import { useAuth } from "../../lib/context/AuthContext"
import { Button } from "../atoms/Button"
import { ConfirmModal } from "../atoms/ConfirmModal"


export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { state, logout } = useAuth()
    const [backendUnreadCount, setBackendUnreadCount] = useState<number>(0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const notificacoesService = useNotificacoesService()
    const { getUnreadFrontendCount, clearAll } = useNotificationContext()

    // Contador unificado: backend + frontend
    const unreadCount = backendUnreadCount + getUnreadFrontendCount()

  useEffect(() => {
    let mounted = true

    const fetchCount = async () => {
      if (!state.user) {
          if (mounted) setBackendUnreadCount(0)
        return
      }
      try {
        const count = await notificacoesService.getUnreadCount()
          if (mounted) setBackendUnreadCount(count)
      } catch (err) {
        // ignore
      }
    }

    fetchCount()

    const handler = () => fetchCount()
    window.addEventListener("notificationsUpdated", handler)

    return () => {
      mounted = false
      window.removeEventListener("notificationsUpdated", handler)
    }
    }, [state.user, notificacoesService, getUnreadFrontendCount])

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    // Limpar notificações (frontend + storage) antes de sair
    try { clearAll() } catch {}
    logout()
    setShowLogoutConfirm(false)
    navigate("/login")
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1
              onClick={() => navigate("/dashboard")}
              className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
            >
              EventHub
            </h1>
            <nav className="hidden md:flex gap-6">
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/eventos" className="text-foreground hover:text-primary transition-colors">Eventos</Link>
              <Link to="/inscricoes" className="text-foreground hover:text-primary transition-colors">Inscrições</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {state.user && <span className="text-sm text-muted-foreground">Olá, {state.user.username}</span>}
            {/* Ícone de notificações com badge */}
              <Link to="/notificacoes" className="relative inline-flex items-center">
                <svg 
                  className="w-6 h-6 text-foreground hover:text-primary transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-label="Notificações"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            <Button variant="ghost" size="sm" onClick={handleLogoutClick}>
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de saída */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirmar Saída"
        message="Tem certeza que deseja sair da sua conta?"
        confirmText="Sair"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </header>
  )
}

