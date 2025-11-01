"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "../atoms/Button"
import { Input } from "../atoms/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../atoms/Card"
import { useAuth } from "../../lib/context/AuthContext"
import { useApi, setDefaultAuthorization } from "../../lib/hooks/useApi"
import { API_ENDPOINTS } from "../../lib/constants/api"
import type { User, AuthTokens } from "../../lib/types/index"
import { storage } from "../../lib/utils/storage"

interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const api = useApi()

  const schema = yup.object().shape({
    username: yup.string()
      .min(3, "Usuário deve ter no mínimo 3 caracteres")
      .max(30, "Usuário deve ter no máximo 30 caracteres")
      .matches(/^[a-zA-Z0-9_]+$/, "Usuário deve conter apenas letras, números e _")
      .required("Por favor, insira seu usuário"),
    password: yup.string()
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(50, "Senha muito longa")
      .matches(/\S/, "A senha não pode conter apenas espaços em branco")
      .required("Por favor, insira sua senha"),
  })

  interface LoginFormValues {
    username: string
    password: string
  }

  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormValues>({ 
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  // Limpar mensagem de erro ao digitar novamente
  const usernameValue = watch('username')
  const passwordValue = watch('password')
  useEffect(() => {
    if (error) setError("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameValue, passwordValue])

  const onSubmit = async (values: LoginFormValues) => {
    setError("")
    setLoading(true)
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, values)
      const { access, refresh } = response.data

      // Salva tokens temporariamente para buscar /me
      const tokens: AuthTokens = { access, refresh }
      storage.setToken(access)
      storage.setRefreshToken(refresh)
      setDefaultAuthorization(access)

      // Busca dados atuais do usuário autenticado
      const meResp = await api.get(API_ENDPOINTS.ME)
      const meUser = meResp.data?.user || {}

      const user: User = {
        id: meUser.id,
        username: meUser.username,
        email: meUser.email,
        role: meUser.role,
        participante_id: meUser.participante_id,
      }

      // Finaliza ciclo de login populando contexto/armazenamento
      storage.setUser(user)
      login(user, tokens)
      onSuccess?.()
    } catch (err: any) {
      let message = "Erro ao fazer login. Por favor, tente novamente."
      
      if (err.response?.status === 401) {
        message = "Usuário ou senha incorretos."
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail
      } else if (!navigator.onLine) {
        message = "Sem conexão com a internet. Por favor, verifique sua conexão."
      }
      
      setError(message)
      console.error("Erro no login:", err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Bem-vindo ao EventHub</CardTitle>
        <CardDescription>Faça login para acessar seus eventos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-500 text-sm">{error}</div>
          )}

          <Input label="Usuário" type="text" placeholder="Seu usuário" {...register('username')} error={errors.username?.message as string} />

          <Input label="Senha" type="password" placeholder="Sua senha" {...register('password')} error={errors.password?.message as string} />

          <Button type="submit" fullWidth loading={loading}>
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
