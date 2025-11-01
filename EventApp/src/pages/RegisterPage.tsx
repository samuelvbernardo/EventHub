"use client"

import { useState } from "react"
import * as yup from "yup"
import { useNavigate } from "react-router-dom"
import { useApi } from "../lib/hooks/useApi"
import { useAuth } from "../lib/context/AuthContext"
import { API_ENDPOINTS } from "../lib/constants/api"
import { RegisterForm } from "../components/molecules/RegisterForm"

const schema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Usuário deve ter no mínimo 3 caracteres")
    .max(30, "Usuário deve ter no máximo 30 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/, "Usuário deve conter apenas letras, números e _")
    .required("Usuário é obrigatório"),
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .matches(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .matches(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .matches(/[0-9]/, "Senha deve conter pelo menos um número")
    .required("Senha é obrigatória"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não conferem")
    .required("Confirmação de senha é obrigatória"),
  role: yup.string().oneOf(["participante", "organizador"], "Papel inválido").required("Papel é obrigatório"),
  nome: yup
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(150, "Nome deve ter no máximo 150 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras")
    .required("Nome é obrigatório"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  telefone: yup
    .string()
    .nullable()
    .matches(/^(\(\d{2}\)\s\d{4,5}-\d{4})?$/, "Formato inválido. Use (XX) XXXXX-XXXX"),
  empresa: yup
    .string()
    .nullable()
    .test("empresa-required", "Empresa é obrigatória para organizadores", function (value) {
      return this.parent.role !== "organizador" || Boolean(value && value.length >= 3)
    }),
})

type FormValues = yup.InferType<typeof schema>

export default function RegisterPage() {
  const api = useApi()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: FormValues) => {
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
