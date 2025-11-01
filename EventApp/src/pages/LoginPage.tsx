"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/context/AuthContext"
import { LoginForm } from "../components/molecules/LoginForm"

export default function LoginPage() {
  const navigate = useNavigate()
  const { state } = useAuth()

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard")
    }
  }, [state.isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">EventHub</h1>
          <p className="text-muted-foreground">Gerenciamento de Eventos</p>
        </div>
        <LoginForm onSuccess={() => navigate("/dashboard")} />
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
