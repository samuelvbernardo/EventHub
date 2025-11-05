export const API_BASE_URL = import.meta.env.VITE_API_URL

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/token/",
  REFRESH: "/token/refresh/",
  REGISTER: "/v1/auth/register/",
  ME: "/v1/auth/me/",

  // Eventos
  EVENTOS: "/v1/eventos/",
  EVENTO_DETAIL: (id: number) => `/v1/eventos/${id}/`,

  // Inscrições
  INSCRICOES: "/v1/inscricoes/",
  INSCRICAO_DETAIL: (id: number) => `/v1/inscricoes/${id}/`,
  INSCRICAO_CANCEL: (id: number) => `/v1/inscricoes/${id}/cancel/`,
  INSCRICOES_ORGANIZADOR: "/v1/inscricoes/organizador/",

  // Notificações
  NOTIFICACOES: "/v1/notificacoes/",
  NOTIFICACAO_DETAIL: (id: number) => `/v1/notificacoes/${id}/`,

  // Participantes
  PARTICIPANTES: "/v1/participantes/",
  PARTICIPANTE_DETAIL: (id: number) => `/v1/participantes/${id}/`,

  // Organizadores
  ORGANIZADORES: "/v1/organizadores/",
  ORGANIZADOR_DETAIL: (id: number) => `/v1/organizadores/${id}/`,
}
