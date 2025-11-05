import * as yup from "yup"

// Schema de Login
export const loginSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, "Usuário deve ter no mínimo 3 caracteres")
    .max(30, "Usuário deve ter no máximo 30 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/, "Usuário deve conter apenas letras, números e _")
    .required("Por favor, insira seu usuário"),
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(50, "Senha muito longa")
    .matches(/\S/, "A senha não pode conter apenas espaços em branco")
    .required("Por favor, insira sua senha"),
})

// Schema de Registro (Participante ou Organizador)
export const registerSchema = yup.object().shape({
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

// Schema de Organizador (cadastro direto)
export const organizadorSchema = yup.object().shape({
  nome: yup
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(150, "Nome deve ter no máximo 150 caracteres")
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
    .min(3, "Empresa deve ter no mínimo 3 caracteres"),
})

// Schema de Evento
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

// Types
export type LoginFormData = yup.InferType<typeof loginSchema>
export type RegisterFormData = yup.InferType<typeof registerSchema>
export type OrganizadorFormData = yup.InferType<typeof organizadorSchema>
export type EventFormData = yup.InferType<typeof eventSchema>
