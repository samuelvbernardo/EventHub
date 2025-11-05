"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApi } from "../lib/hooks/useApi"
import { useAuth } from "../lib/context/AuthContext"
import { API_ENDPOINTS } from "../lib/constants/api"
import { RegisterForm } from "../components/molecules/RegisterForm"
import type { RegisterFormData } from "../lib/validators/validationSchema"

export default function RegisterPage() {
  const api = useApi()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: RegisterFormData) => {
    setGlobalError(null)
    setIsSubmitting(true)

    try {
      const payload: any = {
        username: data.username,
        password: data.password,
        role: data.role,
        nome: data.nome,
        email: data.email,
      }

      if (data.role === "organizador") {
        payload.empresa = data.empresa
        if (data.telefone) {
          payload.telefone = data.telefone
        }
      }

      const response = await api.post(API_ENDPOINTS.REGISTER, payload)
      const { access, refresh, user } = response.data

      login(
        {
          id: user.id,
          username: user.username,
          email: data.email,
          role: data.role,
          participante_id: user.participante_id
        },
        { access, refresh },
      )

      navigate("/dashboard")
    } catch (err: any) {
      console.error("Erro no registro:", err)
      
      if (err.response?.status === 500) {
        // Verificar se é um erro de unicidade
        if (err.response.data && err.response.data.includes("UNIQUE constraint failed")) {
          if (err.response.data.includes("core_participante.email")) {
            setGlobalError("Este e-mail já está em uso. Por favor, utilize outro e-mail.")
          } else if (err.response.data.includes("auth_user.username")) {
            setGlobalError("Este nome de usuário já está em uso. Por favor, escolha outro.")
          } else {
            setGlobalError("Erro de duplicidade nos dados. Por favor, verifique as informações.")
          }
        } else {
          setGlobalError("Erro interno do servidor. Por favor, tente novamente mais tarde.")
        }
      } else if (err.response?.data) {
        // Trata erros de validação da API
        if (typeof err.response.data === 'object') {
          if (err.response.data.username) {
            setGlobalError(err.response.data.username[0])
          } else if (err.response.data.email) {
            setGlobalError(err.response.data.email[0])
          } else if (err.response.data.detail) {
            setGlobalError(err.response.data.detail)
          } else {
            const firstError = Object.values(err.response.data)[0]
            if (Array.isArray(firstError)) {
              setGlobalError(firstError[0])
            } else {
              setGlobalError("Erro ao registrar usuário. Verifique os dados informados.")
            }
          }
        } else {
          setGlobalError("Erro ao registrar usuário. Tente novamente mais tarde.")
        }
      } else if (!navigator.onLine) {
        setGlobalError("Sem conexão com a internet. Verifique sua conexão e tente novamente.")
      } else {
        setGlobalError("Erro ao registrar usuário. Por favor, tente novamente.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <RegisterForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/login")}
        isSubmitting={isSubmitting}
        globalError={globalError}
      />
    </div>
  )
}
