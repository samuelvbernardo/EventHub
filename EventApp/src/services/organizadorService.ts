import { useApi } from "../lib/hooks/useApi"
import type { Organizador, OrganizadorDetalhado, PaginatedResponse } from "../lib/types/index"
import { API_ENDPOINTS } from "../lib/constants/api"
import { useMemo } from "react"

export function useOrganizadoresService() {
  const api = useApi()

  return useMemo(() => ({
    createOrganizador: async (data: { nome: string; email: string; telefone?: string; empresa?: string }) => {
      const response = await api.post(API_ENDPOINTS.ORGANIZADORES, data)
      return response.data
    },

    listOrganizadores: async (page = 1): Promise<PaginatedResponse<Organizador>> => {
      const response = await api.get(API_ENDPOINTS.ORGANIZADORES, { params: { page } })
      return response.data
    },

    getOrganizador: async (id: number): Promise<OrganizadorDetalhado> => {
      const response = await api.get(API_ENDPOINTS.ORGANIZADOR_DETAIL(id))
      return response.data
    },
  }), [api])
}
