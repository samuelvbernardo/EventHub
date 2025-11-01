"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "../atoms/Modal"
import type { Evento, Inscricao } from "../../lib/types/index"
import { formatDate } from "../../lib/utils/helpers"
import { getEventTypeBadgeClasses, getEventTypeLabel } from "../../lib/constants/eventColors"
import { OrganizadorDetailModal } from "./OrganizadorDetailModal"
import { ParticipanteDetailModal } from "./ParticipanteDetailModal"
import { useEventosService } from "../../services/eventoService"
import { getInscricaoStatusBadgeClasses } from "../../lib/constants/statusColors"

interface EventDetailModalProps {
  evento: Evento | null
  isOpen: boolean
  onClose: () => void
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ evento, isOpen, onClose }) => {
  const [organizadorModalOpen, setOrganizadorModalOpen] = useState(false)
  const [participanteModalOpen, setParticipanteModalOpen] = useState(false)
  const [selectedParticipanteId, setSelectedParticipanteId] = useState<number | null>(null)
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loadingInscricoes, setLoadingInscricoes] = useState(false)

  const eventosService = useEventosService()

  useEffect(() => {
    if (isOpen && evento) {
      loadInscricoes()
    }
  }, [isOpen, evento?.id])

  const loadInscricoes = async () => {
    if (!evento) return
    
    setLoadingInscricoes(true)
    try {
      // Buscar detalhes do evento com inscrições relacionadas (backend atualizado)
      const ev = await eventosService.getEvento(evento.id)
      const eventoInscricoes = (ev as any).inscricoes || []
      setInscricoes(eventoInscricoes.filter((i: any) => i.status !== "cancelada"))
    } catch (error) {
      console.error("Erro ao carregar inscrições:", error)
    } finally {
      setLoadingInscricoes(false)
    }
  }

  if (!evento) return null

  const handleOrganizadorClick = () => {
    if (evento.organizer) {
      setOrganizadorModalOpen(true)
    }
  }

  const handleParticipanteClick = (participanteId: number) => {
    setSelectedParticipanteId(participanteId)
    setParticipanteModalOpen(true)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Detalhes do Evento">
      <div className="space-y-6">
        {/* Título e Tipo */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">{evento.titulo}</h3>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEventTypeBadgeClasses(evento.tipo)}`}>
              {getEventTypeLabel(evento.tipo)}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              evento.is_active 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-red-100 text-red-800 border-red-200"
            }`}>
              {evento.is_active ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descrição
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{evento.descricao}</p>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organizador */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium">Organizador</p>
              <button
                type="button"
                onClick={handleOrganizadorClick}
                className="text-sm text-foreground font-semibold hover:text-primary transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
              >
                {evento.organizer_nome}
              </button>
            </div>
          </div>

          {/* Local */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Local</p>
              <p className="text-sm text-foreground font-semibold">{evento.local}</p>
            </div>
          </div>

          {/* Data de Início */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Data de Início</p>
              <p className="text-sm text-foreground font-semibold">{formatDate(evento.data_inicio)}</p>
            </div>
          </div>

          {/* Data de Término */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Data de Término</p>
              <p className="text-sm text-foreground font-semibold">{formatDate(evento.data_fim)}</p>
            </div>
          </div>

          {/* Capacidade */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Capacidade</p>
              <p className="text-sm text-foreground font-semibold">{evento.capacidade} pessoas</p>
            </div>
          </div>

          {/* Preço */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Preço</p>
              <p className="text-sm text-foreground font-semibold">
                {evento.preco === "0.00" ? (
                  <span className="text-green-600">Gratuito</span>
                ) : (
                  `R$ ${Number(evento.preco).toFixed(2)}`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Informações Importantes</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Para se inscrever neste evento, utilize o botão "Inscrever-se" na lista de eventos.
                {evento.preco !== "0.00" && " Este é um evento pago - confirme o valor antes de se inscrever."}
              </p>
            </div>
          </div>
        </div>

        {/* Participantes Inscritos */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Participantes Inscritos
            </h3>
            <span className="text-sm text-muted-foreground">
              {inscricoes.length} / {evento.capacidade}
            </span>
          </div>

          {loadingInscricoes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : inscricoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Nenhum participante inscrito ainda</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inscricoes.map((inscricao) => (
                <button
                  key={inscricao.id}
                  type="button"
                  onClick={() => handleParticipanteClick(inscricao.participante)}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {inscricao.participante_nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Inscrito em {formatDate(inscricao.data_inscricao)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={getInscricaoStatusBadgeClasses(inscricao.status)}>
                      {inscricao.status}
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>

    {/* Modal de Organizador */}
    {evento.organizer && (
      <OrganizadorDetailModal
        organizadorId={evento.organizer}
        isOpen={organizadorModalOpen}
        onClose={() => setOrganizadorModalOpen(false)}
      />
    )}

    {/* Modal de Participante */}
    {selectedParticipanteId && (
      <ParticipanteDetailModal
        participanteId={selectedParticipanteId}
        isOpen={participanteModalOpen}
        onClose={() => {
          setParticipanteModalOpen(false)
          setSelectedParticipanteId(null)
        }}
      />
    )}
    </>
  )
}
