// Tipos centralizados para toda a aplicação
export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  tokens: AuthTokens | null
  loading: boolean
  error: string | null
}

export interface User {
  id: number
  username: string
  email: string
  role: "participante" | "organizador"
  participante_id: number | null // ID do participante associado ao usuário
}

export interface BaseModel {
  id: number
  created_at: string
  updated_at: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export interface Evento extends BaseModel {
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  capacidade: number
  is_active: boolean
  tipo: "presencial" | "virtual" | "hibrido"
  preco: string
  organizer?: number
  organizer_nome?: string
  // Campo calculado no backend: indica se o usuário autenticado possui inscrição ativa neste evento
  isInscrito?: boolean
  // Status da inscrição do usuário autenticado neste evento
  inscricaoStatus?: "pendente" | "confirmada" | "cancelada" | null
  // Campos adicionais quando recuperado via detalhe
  inscricoes?: Inscricao[]
  total_inscricoes?: number
}

export interface Inscricao extends BaseModel {
  participante: number
  evento: number
  participante_nome: string
  evento_titulo: string
  status: "pendente" | "confirmada" | "cancelada"
  data_inscricao: string
}

export interface Notificacao extends BaseModel {
  participante?: number | null
  organizador?: number | null
  evento: number
  participante_nome?: string | null
  evento_titulo: string
  mensagem: string
  is_read: boolean
}

export interface Participante extends BaseModel {
  nome: string
  email: string
  user: number
}

export interface Organizador extends BaseModel {
  nome: string
  email: string
  telefone?: string
  empresa?: string
  user?: number
}

export interface OrganizadorDetalhado extends Organizador {
  eventos?: Evento[]
  total_eventos?: number
}

export interface ParticipanteDetalhado extends Participante {
  inscricoes?: Inscricao[]
  total_inscricoes?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  detail?: string
  error?: string
  [key: string]: any
}
