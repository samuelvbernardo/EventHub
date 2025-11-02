import { API_ENDPOINTS } from "../lib/constants/api"
import type { Inscricao, PaginatedResponse } from "../lib/types/index"
import { useApi } from "../lib/hooks/useApi"

export interface InscricaoFilters {
  page?: number
  status?: string
  evento?: number
  search?: string
}

export function useInscricoesService() {
  const api = useApi()

  return {
    listInscricoes: async (filters: InscricaoFilters = {}): Promise<PaginatedResponse<Inscricao>> => {
      const { page = 1, status, evento, search } = filters
      const params: Record<string, any> = { page }
      
      if (status) params.status = status
      if (evento) params.evento = evento
      if (search) params.search = search
      
      const response = await api.get(API_ENDPOINTS.INSCRICOES, { params })
      return response.data
    },

    listInscricoesOrganizador: async (filters: InscricaoFilters = {}): Promise<PaginatedResponse<Inscricao>> => {
      const { page = 1, status, evento, search } = filters
      const params: Record<string, any> = { page }
      
      if (status) params.status = status
      if (evento) params.evento = evento
      if (search) params.search = search
      
      const response = await api.get(API_ENDPOINTS.INSCRICOES_ORGANIZADOR, { params })
      return response.data
    },

    getInscricao: async (id: number): Promise<Inscricao> => {
      const response = await api.get(API_ENDPOINTS.INSCRICAO_DETAIL(id))
      return response.data
    },

    createInscricao: async (data: Partial<Inscricao>): Promise<Inscricao> => {
      const response = await api.post(API_ENDPOINTS.INSCRICOES, data)
      return response.data
    },

    createInscricaoByEventoId: async (eventoId: number): Promise<{ 
      message: string; 
      inscricao: Inscricao;
      evento_pago?: boolean;
      status?: string;
    }> => {
      const response = await api.post(API_ENDPOINTS.INSCRICOES, { evento_id: eventoId })
      return response.data
    },

    updateInscricao: async (id: number, data: Partial<Inscricao>): Promise<Inscricao> => {
      const response = await api.put(API_ENDPOINTS.INSCRICAO_DETAIL(id), data)
      return response.data
    },

    deleteInscricao: async (id: number): Promise<void> => {
      await api.delete(API_ENDPOINTS.INSCRICAO_DETAIL(id))
    },

    cancelInscricao: async (id: number): Promise<Inscricao> => {
      const response = await api.post(API_ENDPOINTS.INSCRICAO_CANCEL(id))
      return response.data
    },
  }
}
