import * as yup from "yup"

export const loginSchema = yup.object().shape({
  username: yup.string().min(3, "Usuário deve ter no mínimo 3 caracteres").required("Usuário é obrigatório"),
  password: yup.string().min(6, "Senha deve ter no mínimo 6 caracteres").required("Senha é obrigatória"),
})

export const eventSchema = yup.object().shape({
  titulo: yup
    .string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(255, "Título não pode exceder 255 caracteres")
    .required("Título é obrigatório"),
  descricao: yup.string().min(10, "Descrição deve ter no mínimo 10 caracteres").required("Descrição é obrigatória"),
  data_inicio: yup.string().required("Data de início é obrigatória"),
  data_fim: yup
    .string()
    .required("Data de término é obrigatória")
    .test("data-fim-maior", "Data de término deve ser posterior à data de início", function (value) {
      const { data_inicio } = this.parent
      if (!data_inicio || !value) return true
      return new Date(value) > new Date(data_inicio)
    }),
  local: yup.string().min(3, "Local deve ter no mínimo 3 caracteres").required("Local é obrigatório"),
  capacidade: yup.number().min(1, "Capacidade deve ser no mínimo 1").required("Capacidade é obrigatória"),
  preco: yup.number().min(0, "Preço não pode ser negativo").typeError("Preço deve ser um número"),
  tipo: yup
    .string()
    .oneOf(["presencial", "virtual", "hibrido"], "Tipo de evento inválido")
    .required("Tipo de evento é obrigatório"),
})

export type LoginFormData = yup.InferType<typeof loginSchema>
export type EventFormData = yup.InferType<typeof eventSchema>
