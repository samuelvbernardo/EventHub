"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "../atoms/Modal"
import type { OrganizadorDetalhado } from "../../lib/types/index"
import { useOrganizadoresService } from "../../services/organizadorService"
import { getEventTypeBadgeClasses, getEventTypeLabel } from "../../lib/constants/eventColors"

interface OrganizadorDetailModalProps {
  organizadorId: number | null
  isOpen: boolean
  onClose: () => void
}

export const OrganizadorDetailModal: React.FC<OrganizadorDetailModalProps> = ({ 
  organizadorId, 
  isOpen, 
  onClose 
}) => {
  const [organizador, setOrganizador] = useState<OrganizadorDetalhado | null>(null)
  const [loading, setLoading] = useState(false)
  const service = useOrganizadoresService()

  useEffect(() => {
    if (isOpen && organizadorId) {
      setLoading(true)
      service.getOrganizador(organizadorId)
        .then(data => setOrganizador(data))
        .catch(err => console.error("Erro ao carregar organizador:", err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, organizadorId, service])

  if (!isOpen || !organizadorId) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Detalhes do Organizador">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : organizador ? (
        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">{organizador.nome}</h3>
            {organizador.empresa && (
              <p className="text-sm text-muted-foreground">{organizador.empresa}</p>
            )}
          </div>

          {/* Informações de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-muted-foreground font-medium">E-mail</p>
                <p className="text-sm text-foreground font-semibold">{organizador.email}</p>
              </div>
            </div>

            {organizador.telefone && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Telefone</p>
                  <p className="text-sm text-foreground font-semibold">{organizador.telefone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {organizador.total_eventos || organizador.eventos?.length || 0}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {organizador.total_eventos === 1 ? "Evento organizado" : "Eventos organizados"}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Eventos */}
          {organizador.eventos && organizador.eventos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Eventos Organizados
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {organizador.eventos.map((evento) => (
                  <div key={evento.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{evento.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{evento.local}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getEventTypeBadgeClasses(evento.tipo)}`}>
                        {getEventTypeLabel(evento.tipo)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Organizador não encontrado
        </div>
      )}
    </Modal>
  )
}
