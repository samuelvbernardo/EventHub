"use client"

import type React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../atoms/Card"
import { Button } from "../atoms/Button"
import { Input } from "../atoms/Input"
import { Textarea } from "../atoms/TextArea"
import { Select } from "../atoms/Select"
import type { Evento } from "../../lib/types/index"

interface EventoFormValues {
  titulo: string
  descricao: string
  local: string
  capacidade: number
  preco: number
  data_inicio: string
  data_fim: string
  tipo: "presencial" | "virtual" | "hibrido"
  is_active: boolean
}

interface EventFormModalProps {
  evento?: Evento | null
  onSave: (data: Partial<Evento>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ evento, onSave, onCancel, loading = false }) => {
  // 1. Schema de validação
  const schema = yup.object().shape({
    titulo: yup.string().required("Título é obrigatório"),
    descricao: yup.string().required("Descrição é obrigatória"),
    local: yup.string().required("Local é obrigatório"),
    capacidade: yup
      .number()
      .typeError("Capacidade deve ser um número")
      .min(1, "Capacidade deve ser maior que zero")
      .max(10000, "Capacidade máxima é 10.000")
      .integer("Capacidade deve ser um número inteiro")
      .required("Capacidade é obrigatória"),
    preco: yup
      .number()
      .typeError("Preço deve ser um número")
      .min(0, "Preço não pode ser negativo")
      .max(99999.99, "Preço máximo é R$ 99.999,99")
      .test("decimal-places", "Preço deve ter no máximo 2 casas decimais", (value) => {
        if (!value) return true
        return /^\d+(\.\d{1,2})?$/.test(value.toString())
      })
      .required("Preço é obrigatório"),
    data_inicio: yup
      .string()
      .required("Data início é obrigatória")
      .test("data-futura", "Data de início deve ser futura", (value) => {
        if (!value) return true
        const now = new Date()
        const dataInicio = new Date(value)
        return dataInicio > now
      }),
    data_fim: yup
      .string()
      .required("Data fim é obrigatória")
      .test("data-fim-maior", "Data de término deve ser posterior à data de início", function (value) {
        const { data_inicio } = this.parent
        if (!data_inicio || !value) return true
        const dataInicio = new Date(data_inicio)
        const dataFim = new Date(value)
        return dataFim > dataInicio
      }),
    tipo: yup
      .string()
      .oneOf(["presencial", "virtual", "hibrido"], "Tipo de evento inválido")
      .required("Tipo é obrigatório"),
    is_active: yup.boolean(),
  })

  // 2. useForm com schema
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventoFormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      titulo: evento?.titulo || "",
      descricao: evento?.descricao || "",
      local: evento?.local || "",
      capacidade: Number(evento?.capacidade) || 0,
      preco: Number(evento?.preco) || 0,
      data_inicio: evento?.data_inicio || "",
      data_fim: evento?.data_fim || "",
      tipo: evento?.tipo || "presencial",
      is_active: evento?.is_active ?? true,
    },
  })

  // Atualiza valores do formulário ao editar
  useEffect(() => {
    if (evento) {
      reset({
        titulo: evento.titulo,
        descricao: evento.descricao,
        local: evento.local,
        capacidade: Number(evento.capacidade) || 0,
        preco: Number(evento.preco) || 0,
        data_inicio: evento.data_inicio,
        data_fim: evento.data_fim,
        tipo: evento.tipo,
        is_active: evento.is_active,
      })
    }
  }, [evento, reset])

  // 3. Função para formatar datas e enviar
  const formatDateForApi = (value?: string) => {
    if (!value) return undefined
    if (value.includes("T")) {
      const [datePart, timePart] = value.split("T")
      const cleanedTime = (timePart || "").replace("Z", "")
      const [hh = "00", mm = "00"] = cleanedTime.split(":")
      return `${datePart} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
    }
    const d = new Date(value)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    const hh = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
  }

  const onSubmit = async (data: EventoFormValues) => {
    // Formata datas e preco
    const payload: Partial<Evento> = {
      ...data,
      data_inicio: formatDateForApi(data.data_inicio),
      data_fim: formatDateForApi(data.data_fim),
      preco: Number(data.preco).toFixed(2),
      capacidade: Number(data.capacidade) || 0,
    }
    console.log("🛰️ Enviando dados ajustados:", payload)
    await onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{evento ? "Editar Evento" : "Criar Novo Evento"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input label="Título" {...register("titulo")} error={errors.titulo?.message} />

            <Textarea label="Descrição" rows={4} {...register("descricao")} error={errors.descricao?.message} />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data Início"
                type="datetime-local"
                {...register("data_inicio")}
                error={errors.data_inicio?.message}
              />
              <Input
                label="Data Fim"
                type="datetime-local"
                {...register("data_fim")}
                error={errors.data_fim?.message}
              />
            </div>

            <Input label="Local" {...register("local")} error={errors.local?.message} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Capacidade" type="number" {...register("capacidade")} error={errors.capacidade?.message} />
              <Input
                label="Preço (R$)"
                type="number"
                step="0.01"
                {...register("preco")}
                error={errors.preco?.message}
              />
            </div>

            <Select
              label="Tipo de Evento"
              {...register("tipo")}
              error={errors.tipo?.message}
              options={[
                { value: "presencial", label: "Presencial" },
                { value: "virtual", label: "Virtual" },
                { value: "hibrido", label: "Híbrido" },
              ]}
            />
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button variant="ghost" onClick={onCancel} type="button" className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {evento ? "Atualizar" : "Criar"} Evento
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
