import { useApi } from "../lib/hooks/useApi"
import type { Participante, ParticipanteDetalhado, PaginatedResponse } from "../lib/types/index"
import { useMemo } from "react"

export function useParticipantesService() {
  const api = useApi()

  return useMemo(() => ({
    listParticipantes: async (page = 1): Promise<PaginatedResponse<Participante>> => {
      const response = await api.get(`/v1/participantes/`, { params: { page } })
      return response.data
    },

    getParticipante: async (id: number): Promise<ParticipanteDetalhado> => {
      const response = await api.get(`/v1/participantes/${id}/`)
      return response.data
    },
  }), [api])
}
