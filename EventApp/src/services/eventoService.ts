import { API_ENDPOINTS } from "../lib/constants/api"
import type { Evento, PaginatedResponse } from "../lib/types/index"
import { useApi } from "../lib/hooks/useApi"

export function useEventosService() {
  const api = useApi()

  return {
    listEventos: async (page = 1): Promise<PaginatedResponse<Evento>> => {
      const response = await api.get(API_ENDPOINTS.EVENTOS, {
        params: { page },
      })
      return response.data
    },

    getEvento: async (id: number): Promise<Evento> => {
      const response = await api.get(API_ENDPOINTS.EVENTO_DETAIL(id))
      return response.data
    },

    createEvento: async (data: Partial<Evento>): Promise<Evento> => {
      console.log("🛰️ Enviando dados do evento:", data)
      try {
        const response = await api.post(API_ENDPOINTS.EVENTOS, data)
        return response.data
      } catch (err: any) {
        // Log mais detalhado para debugar 400s do DRF
        console.error("🛑 Erro criando evento:", err.response?.data ?? err.message)
        // Re-throw para que o caller possa tratar (UI, toast, etc.)
        throw err
      }
    },

    updateEvento: async (id: number, data: Partial<Evento>): Promise<Evento> => {
      const response = await api.put(API_ENDPOINTS.EVENTO_DETAIL(id), data)
      return response.data
    },

    deleteEvento: async (id: number): Promise<void> => {
      await api.delete(API_ENDPOINTS.EVENTO_DETAIL(id))
    },
  }
}
