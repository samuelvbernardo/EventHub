"use client"

import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./routes/routes"
import { AuthProvider, useAuth } from "./lib/context/AuthContext"
import { NotificationProvider } from "./lib/context/NotificationContext"
import { ToastProvider } from "./lib/context/ToastContext"

function AppContent() {
  const { restoreSession } = useAuth()

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
        <NotificationProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
        </NotificationProvider>
    </AuthProvider>
  )
}
