import { useApi } from "../lib/hooks/useApi"
import type { Participante, ParticipanteDetalhado, PaginatedResponse } from "../lib/types/index"
import { API_ENDPOINTS } from "../lib/constants/api"
import { useMemo } from "react"

export function useParticipantesService() {
  const api = useApi()

  return useMemo(() => ({
    listParticipantes: async (page = 1): Promise<PaginatedResponse<Participante>> => {
      const response = await api.get(API_ENDPOINTS.PARTICIPANTES, { params: { page } })
      return response.data
    },

    getParticipante: async (id: number): Promise<ParticipanteDetalhado> => {
      const response = await api.get(API_ENDPOINTS.PARTICIPANTE_DETAIL(id))
      return response.data
    },
  }), [api])
}
