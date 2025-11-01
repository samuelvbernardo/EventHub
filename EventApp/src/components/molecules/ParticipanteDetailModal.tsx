"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "../atoms/Modal"
import type { ParticipanteDetalhado } from "../../lib/types/index"
import { useParticipantesService } from "../../services/participanteService"
import { getInscricaoStatusBadgeClasses } from "../../lib/constants/statusColors"

interface ParticipanteDetailModalProps {
  participanteId: number | null
  isOpen: boolean
  onClose: () => void
}

export const ParticipanteDetailModal: React.FC<ParticipanteDetailModalProps> = ({ 
  participanteId, 
  isOpen, 
  onClose 
}) => {
  const [participante, setParticipante] = useState<ParticipanteDetalhado | null>(null)
  const [loading, setLoading] = useState(false)
  const service = useParticipantesService()

  useEffect(() => {
    if (isOpen && participanteId) {
      setLoading(true)
      service.getParticipante(participanteId)
        .then(data => setParticipante(data))
        .catch(err => console.error("Erro ao carregar participante:", err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, participanteId, service])

  if (!isOpen || !participanteId) return null

  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Detalhes do Participante">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : participante ? (
        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">{participante.nome}</h3>
          </div>

          {/* Informações de Contato */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-muted-foreground font-medium">E-mail</p>
                <p className="text-sm text-foreground font-semibold">{participante.email}</p>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {participante.total_inscricoes || participante.inscricoes?.length || 0}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Inscrições confirmadas
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Inscrições */}
          {participante.inscricoes && participante.inscricoes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Inscrições confirmadas
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {participante.inscricoes.map((inscricao) => (
                  <div key={inscricao.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{inscricao.evento_titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Inscrito em {new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={getInscricaoStatusBadgeClasses(inscricao.status)}>
                        {inscricao.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!participante.inscricoes || participante.inscricoes.length === 0) && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Nenhuma inscrição confirmada para este participante nos seus eventos.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Participante não encontrado
        </div>
      )}
    </Modal>
  )
}
