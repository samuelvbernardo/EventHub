"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Input } from "../atoms/Input"
import { Button } from "../atoms/Button"
import { RadioGroup } from "../atoms/RadioGroup"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../atoms/Card"
import { registerSchema, type RegisterFormData } from "../../lib/validators/validationSchema"

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  globalError?: string | null
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onCancel, isSubmitting, globalError }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: {
      role: "participante",
    },
  })

  const selectedRole = watch("role")

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {globalError}
            </div>
          )}

          <Input label="Usuário" {...register("username")} error={errors.username?.message} />

          <Input label="Senha" type="password" {...register("password")} error={errors.password?.message} />

          <Input
            label="Confirmar Senha"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <RadioGroup
            label="Você é"
            name="role"
            options={[
              { value: "participante", label: "Participante" },
              { value: "organizador", label: "Organizador" },
            ]}
            value={selectedRole}
            onChange={(value) => setValue("role", value as "participante" | "organizador")}
            error={errors.role?.message}
          />

          <Input label="Nome Completo" {...register("nome")} error={errors.nome?.message} />

          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />

          {selectedRole === "organizador" && (
            <>
              <Input
                label="Telefone"
                {...register("telefone")}
                error={errors.telefone?.message}
                placeholder="(XX) XXXXX-XXXX"
                helperText="Formato: (XX) XXXXX-XXXX"
              />
              <Input
                label="Empresa"
                {...register("empresa")}
                error={errors.empresa?.message}
                placeholder="Nome da sua empresa"
              />
            </>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            Cadastrar
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
