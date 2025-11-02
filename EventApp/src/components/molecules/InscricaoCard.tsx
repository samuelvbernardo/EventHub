"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../atoms/Card"
import { getInscricaoStatusBadgeClasses } from "../../lib/constants/statusColors"
import { StatusIcon } from "../atoms/StatusIcon"
import { Button } from "../atoms/Button"
import type { Inscricao } from "../../lib/types/index"
import { formatDate, getInscricaoStatusLabel } from "../../lib/utils/helpers"

interface InscricaoCardProps {
  inscricao: Inscricao
  onCancel?: (inscricaoId: number) => void
  onDelete?: (inscricaoId: number) => void
}

export const InscricaoCard: React.FC<InscricaoCardProps> = ({ inscricao, onCancel, onDelete }) => {
  const canCancel = inscricao.status !== "cancelada"

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{inscricao.evento_titulo}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Participante: {inscricao.participante_nome}</p>
          </div>
          <span className={getInscricaoStatusBadgeClasses(inscricao.status)}>
            <StatusIcon status={inscricao.status} />
            {getInscricaoStatusLabel(inscricao.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Data da Inscrição</p>
              <p className="text-foreground">{formatDate(inscricao.data_inscricao)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="text-foreground font-medium">{getInscricaoStatusLabel(inscricao.status)}</p>
            </div>
          </div>

          {(onCancel || onDelete) && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              {onCancel && canCancel && (
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => onCancel(inscricao.id)} 
                  className="flex-1"
                  title={inscricao.status === "confirmada" ? "Cancelar inscrição confirmada" : "Cancelar inscrição pendente"}
                >
                  Cancelar Inscrição
                </Button>
              )}
              {inscricao.status === "cancelada" && (
                <div className="flex-1 text-center py-2 text-sm text-muted-foreground">
                  Inscrição cancelada - não é possível se inscrever novamente
                </div>
              )}
              {onDelete && (
                <Button size="sm" variant="ghost" onClick={() => onDelete(inscricao.id)}>
                  Remover
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
