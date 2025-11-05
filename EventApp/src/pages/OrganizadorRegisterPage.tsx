"use client"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/atoms/Card"
import { Input } from "../components/atoms/Input"
import { Button } from "../components/atoms/Button"
import { useOrganizadoresService } from "../services/organizadorService"
import { useToast } from "../lib/context/ToastContext"
import { useNavigate } from "react-router-dom"
import { organizadorSchema, type OrganizadorFormData } from "../lib/validators/validationSchema"

export default function OrganizadorRegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OrganizadorFormData>({ 
    resolver: yupResolver(organizadorSchema) as any 
  })
  const service = useOrganizadoresService()
  const navigate = useNavigate()
  const toast = useToast()

  const onSubmit = async (data: OrganizadorFormData) => {
    try {
      // Remove valores null e converte para undefined
      const payload = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || undefined,
        empresa: data.empresa || undefined,
      }
      await service.createOrganizador(payload)
      toast.success('Organizador cadastrado com sucesso!')
      navigate('/login')
    } catch (err: any) {
      console.error('Erro criando organizador:', err.response?.data ?? err.message)
      toast.error('Erro ao cadastrar organizador. Verifique os dados e tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastro de Organizador</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input label="Nome" {...register('nome')} error={errors.nome?.message as string} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message as string} />
            <Input label="Telefone" {...register('telefone')} error={errors.telefone?.message as string} />
            <Input label="Empresa" {...register('empresa')} error={errors.empresa?.message as string} />
          </CardContent>

          <CardFooter>
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Cadastrar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
