import { API_ENDPOINTS } from "../lib/constants/api"
import type { Notificacao, PaginatedResponse } from "../lib/types/index"
import { useApi } from "../lib/hooks/useApi"
import { useMemo } from "react"

export const useNotificacoesService = () => {
  const api = useApi()

  return useMemo(() => ({
    listNotificacoes: async (page = 1): Promise<PaginatedResponse<Notificacao>> => {
      const response = await api.get(API_ENDPOINTS.NOTIFICACOES, {
        params: { page },
      })
      return response.data
    },

    getNotificacao: async (id: number): Promise<Notificacao> => {
      const response = await api.get(API_ENDPOINTS.NOTIFICACAO_DETAIL(id))
      return response.data
    },

    createNotificacao: async (data: Partial<Notificacao>): Promise<Notificacao> => {
      const response = await api.post(API_ENDPOINTS.NOTIFICACOES, data)
      return response.data
    },

    markAsRead: async (id: number): Promise<void> => {
      await api.post(`${API_ENDPOINTS.NOTIFICACAO_DETAIL(id)}mark_read/`)
    },

    getUnreadCount: async (): Promise<number> => {
      const response = await api.get(`${API_ENDPOINTS.NOTIFICACOES}unread_count/`)
      return response.data?.unread ?? 0
    },

    deleteNotificacao: async (id: number): Promise<void> => {
      await api.delete(API_ENDPOINTS.NOTIFICACAO_DETAIL(id))
    },
  }), [api])
}
