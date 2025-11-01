"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../lib/context/AuthContext"

interface PrivateRouteProps {
  children: React.ReactNode
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { state } = useAuth()

  if (state.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
