"use client"

import { useState, useCallback } from "react"
import { Header } from "../components/organisms/Header"
import { InscricaoCard } from "../components/molecules/InscricaoCard"
import { Input } from "../components/atoms/Input"
import { Button } from "../components/atoms/Button"
import { ConfirmModal } from "../components/atoms/ConfirmModal"
import { useFetch } from "../lib/hooks/useFetch"
import { useInscricoesService } from "../services/inscricaoService"
import { useAuth } from "../lib/context/AuthContext"
import { useToast } from "../lib/context/ToastContext"
import type { Inscricao } from "../lib/types/index"
import { ParticipanteDetailModal } from "../components/molecules/ParticipanteDetailModal"
import { getInscricaoStatusBadgeClasses } from "../lib/constants/statusColors"

export default function InscricoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean
    action: "cancel" | "delete" | null
    inscricaoId: number | null
  }>({
    isOpen: false,
    action: null,
    inscricaoId: null,
  })

  const inscricoesService = useInscricoesService()
  const { isOrganizador } = useAuth()
  const toast = useToast()

  const { data: inscricoesData, loading, refetch } = useFetch(
    () => (isOrganizador() ? inscricoesService.listInscricoesOrganizador(page) : inscricoesService.listInscricoes(page)),
    [page, isOrganizador]
  )

  const handleCancel = useCallback(
    async (inscricaoId: number) => {
      setConfirmModalState({
        isOpen: true,
        action: "cancel",
        inscricaoId,
      })
    },
    [],
  )

  const handleDelete = useCallback(
    async (inscricaoId: number) => {
      setConfirmModalState({
        isOpen: true,
        action: "delete",
        inscricaoId,
      })
    },
    [],
  )

  const executeAction = useCallback(async () => {
    const { action, inscricaoId } = confirmModalState
    if (!inscricaoId) return

    try {
      if (action === "cancel") {
        await inscricoesService.cancelInscricao(inscricaoId)
        toast.success("Inscrição cancelada com sucesso!")
      } else if (action === "delete") {
        await inscricoesService.deleteInscricao(inscricaoId)
        toast.success("Inscrição removida com sucesso!")
      }
      refetch()
    } catch (error) {
      console.error(`Erro ao ${action === "cancel" ? "cancelar" : "remover"} inscrição:`, error)
      toast.error(`Erro ao ${action === "cancel" ? "cancelar" : "remover"} inscrição. Tente novamente.`)
    } finally {
      setConfirmModalState({ isOpen: false, action: null, inscricaoId: null })
    }
  }, [confirmModalState, inscricoesService, refetch, toast])

  const closeConfirmModal = useCallback(() => {
    setConfirmModalState({ isOpen: false, action: null, inscricaoId: null })
  }, [])

  const inscricoes = inscricoesData?.results || []
  const filteredInscricoes = inscricoes.filter(
    (inscricao: Inscricao) =>
      inscricao.evento_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inscricao.participante_nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estado para modal de participante (contexto organizador)
  const [participanteModalOpen, setParticipanteModalOpen] = useState(false)
  const [selectedParticipanteId, setSelectedParticipanteId] = useState<number | null>(null)

  const openParticipanteModal = (participanteId: number) => {
    setSelectedParticipanteId(participanteId)
    setParticipanteModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {isOrganizador() ? "Inscrições dos meus eventos" : "Minhas Inscrições"}
          </h1>

          <div className="flex gap-4">
            <Input
              placeholder="Buscar inscrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando inscrições...</p>
          </div>
        ) : filteredInscricoes.length > 0 ? (
          isOrganizador() ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Participante</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Evento</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {filteredInscricoes.map((inscricao: Inscricao) => (
                    <tr key={inscricao.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-foreground">
                        <button
                          type="button"
                          onClick={() => openParticipanteModal(inscricao.participante)}
                          className="hover:text-primary underline decoration-dotted underline-offset-2"
                          aria-label={`Ver detalhes de ${inscricao.participante_nome}`}
                        >
                          {inscricao.participante_nome}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{inscricao.evento_titulo}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={getInscricaoStatusBadgeClasses(inscricao.status)}>
                          {inscricao.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(inscricao.data_inscricao).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInscricoes.map((inscricao: Inscricao) => (
                <InscricaoCard key={inscricao.id} inscricao={inscricao} onCancel={handleCancel} onDelete={handleDelete} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhuma inscrição encontrada</p>
          </div>
        )}

        {/* Modal de detalhes do participante (somente organizador) */}
        {isOrganizador() && selectedParticipanteId && (
          <ParticipanteDetailModal
            participanteId={selectedParticipanteId}
            isOpen={participanteModalOpen}
            onClose={() => {
              setParticipanteModalOpen(false)
              setSelectedParticipanteId(null)
            }}
          />
        )}

        {/* Paginação */}
        {inscricoesData && (
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="ghost" disabled={!inscricoesData.previous} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <span className="text-muted-foreground py-2">
              Página {page} de {Math.ceil((inscricoesData.count || 0) / 10)}
            </span>
            <Button variant="ghost" disabled={!inscricoesData.next} onClick={() => setPage(page + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </main>

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.action === "cancel" ? "Cancelar Inscrição" : "Remover Inscrição"}
        message={
          confirmModalState.action === "cancel"
            ? "Tem certeza que deseja cancelar esta inscrição?"
            : "Tem certeza que deseja remover esta inscrição permanentemente?"
        }
        confirmText={confirmModalState.action === "cancel" ? "Cancelar Inscrição" : "Remover"}
        cancelText="Voltar"
        variant={confirmModalState.action === "delete" ? "danger" : "warning"}
        onConfirm={executeAction}
        onCancel={closeConfirmModal}
      />
    </div>
  )
}
