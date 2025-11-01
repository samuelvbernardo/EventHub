"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Input } from "../atoms/Input"
import { Button } from "../atoms/Button"
import { RadioGroup } from "../atoms/RadioGroup"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../atoms/Card"

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
    .test("telefone-format", "Formato inválido. Use (XX) XXXXX-XXXX", (value) => {
      if (!value) return true
      return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
    }),
  empresa: yup
    .string()
    .nullable()
    .test("empresa-required", "Empresa é obrigatória para organizadores", function (value) {
      return this.parent.role !== "organizador" || Boolean(value && value.length >= 3)
    }),
})

type FormValues = yup.InferType<typeof schema>

interface RegisterFormProps {
  onSubmit: (data: FormValues) => Promise<void>
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
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
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
