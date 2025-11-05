"use client"

import type React from "react"
import { useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNotificacoesService } from "../../services"
import { useAuth } from "../../lib/context/AuthContext"
import { Button } from "../atoms/Button"
import { ConfirmModal } from "../atoms/ConfirmModal"


export const Header: React.FC = () => {
  const navigate = useNavigate()
  const { state, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notificacoesService = useNotificacoesService()

  useEffect(() => {
    let mounted = true

    const fetchCount = async () => {
      if (!state.user) {
        if (mounted) setUnreadCount(0)
        return
      }
      try {
        const count = await notificacoesService.getUnreadCount()
        if (mounted) setUnreadCount(count)
      } catch (err) {
        if (mounted) setUnreadCount(0)
      }
    }

    fetchCount()

    const handler = () => fetchCount()
    window.addEventListener("notificationsUpdated", handler)

    return () => {
      mounted = false
      window.removeEventListener("notificationsUpdated", handler)
    }
  }, [state.user, notificacoesService])

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
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
            {/* Menu Desktop */}
            <nav className="hidden md:flex gap-6">
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/eventos" className="text-foreground hover:text-primary transition-colors">Eventos</Link>
              <Link to="/inscricoes" className="text-foreground hover:text-primary transition-colors">Inscrições</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Menu Hambúrguer - Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Username - Hidden on mobile */}
            {state.user && <span className="hidden sm:block text-sm text-muted-foreground">Olá, {state.user.username}</span>}
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
            <Button variant="ghost" size="sm" onClick={handleLogoutClick} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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

        {/* Menu Mobile - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="py-4 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-foreground hover:bg-accent hover:text-primary transition-colors rounded-md"
              >
                Home
              </Link>
              <Link
                to="/eventos"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-foreground hover:bg-accent hover:text-primary transition-colors rounded-md"
              >
                Eventos
              </Link>
              <Link
                to="/inscricoes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-foreground hover:bg-accent hover:text-primary transition-colors rounded-md"
              >
                Inscrições
              </Link>
              <Link
                to="/notificacoes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-foreground hover:bg-accent hover:text-primary transition-colors rounded-md"
              >
                Notificações {unreadCount > 0 && `(${unreadCount})`}
              </Link>
              {state.user && (
                <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border mt-2 pt-4">
                  Olá, {state.user.username}
                </div>
              )}
            </nav>
          </div>
        )}
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

