"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../atoms/Card"
import { Button } from "../atoms/Button"
import type { Evento } from "../../lib/types/index"
import { formatDate } from "../../lib/utils/helpers"
import { getEventTypeBadgeClasses, getEventTypeLabel } from "../../lib/constants/eventColors"
import { getInscricaoStatusBadgeClasses } from "../../lib/constants/statusColors"
import { EventDetailModal } from "./EventDetailModal"
import { StatusIcon } from "../atoms/StatusIcon"

interface EventCardProps {
  evento: Evento
  onInscribe?: (eventoId: number) => void
  onEdit?: (evento: Evento) => void
  onDelete?: (eventoId: number) => void
  canEdit?: boolean
}

export const EventCard: React.FC<EventCardProps> = ({ evento, onInscribe, onEdit, onDelete, canEdit = false }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Determina se o botão de inscrição deve estar habilitado
  // Só habilita se NÃO houver nenhuma inscrição (status null/undefined)
  const isSubscribeButtonEnabled = !evento.inscricaoStatus

  // Define a cor da borda baseada no status da inscrição
  const getBorderColor = () => {
    if (!evento.inscricaoStatus) return ""
    
    switch (evento.inscricaoStatus) {
      case "confirmada":
        return "border border-green-300 shadow-green-200"
      case "pendente":
        return "border border-amber-300 shadow-amber-200"
      case "cancelada":
        return "border border-red-300 shadow-red-200"
      default:
        return ""
    }
  }

  // Define o label do status para exibição
  const getStatusLabel = (status: "confirmada" | "pendente" | "cancelada") => {
    switch (status) {
      case "confirmada":
        return "Inscrição confirmada"
      case "pendente":
        return "Inscrição pendente de confirmação"
      case "cancelada":
        return "Inscrição cancelada"
      default:
        return ""
    }
  }

  // Define o texto do botão baseado no status
  const getButtonText = () => {
    if (!evento.inscricaoStatus) return "Inscrever-se"
    
    switch (evento.inscricaoStatus) {
      case "confirmada":
        return "Inscrição confirmada"
      case "pendente":
        return "Aguardando confirmação"
      case "cancelada":
        return "Inscrição cancelada"
      default:
        return "Inscrever-se"
    }
  }

  return (
    <>
      <Card className={`transition-shadow hover:shadow-lg ${getBorderColor()}`}>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">{evento.titulo}</CardTitle>
              <div className="flex items-center gap-1.5 mt-2">
                {/* Ícone de organizador */}
                <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm text-muted-foreground truncate">
                  {evento.organizer_nome || "Organizador não identificado"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {/* Ícone de localização */}
                <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-muted-foreground truncate">{evento.local}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEventTypeBadgeClasses(evento.tipo)}`}>
              {getEventTypeLabel(evento.tipo)}
            </span>
          </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{evento.descricao}</p>

          {evento.inscricaoStatus && (
            <div className={`flex items-center gap-2 mt-2 text-sm font-medium ${getInscricaoStatusBadgeClasses(evento.inscricaoStatus)}`}>
              <StatusIcon status={evento.inscricaoStatus} />
              <span>{getStatusLabel(evento.inscricaoStatus)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              {/* Ícone de calendário início */}
              <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-muted-foreground">Início</p>
                <p className="text-foreground font-medium">{formatDate(evento.data_inicio)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {/* Ícone de calendário fim */}
              <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-muted-foreground">Término</p>
                <p className="text-foreground font-medium">{formatDate(evento.data_fim)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {/* Ícone de pessoas */}
              <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-muted-foreground">Capacidade</p>
                <p className="text-foreground font-medium">{evento.capacidade} pessoas</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {/* Ícone de dinheiro */}
              <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-muted-foreground">Preço</p>
                <p className="text-foreground font-medium">
                  {evento.preco === "0.00" ? "Gratuito" : `R$ ${Number(evento.preco).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {/* Botão Ver Detalhes - sempre visível */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsDetailModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver detalhes
        </Button>

        {onInscribe && !canEdit && (
          <Button 
            onClick={() => onInscribe(evento.id)} 
            className="flex-1" 
            disabled={!isSubscribeButtonEnabled}
          >
            {getButtonText()}
          </Button>
        )}
        {canEdit && (
          <>
            {onEdit && (
              <Button variant="secondary" onClick={() => onEdit(evento)} className="flex-1">
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" onClick={() => onDelete(evento.id)} className="flex-1">
                Excluir
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>

    {/* Modal de Detalhes */}
    <EventDetailModal 
      evento={evento}
      isOpen={isDetailModalOpen}
      onClose={() => setIsDetailModalOpen(false)}
    />
  </>
  )
}
