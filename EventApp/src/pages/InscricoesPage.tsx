"use client"

import { useState, useCallback, useEffect } from "react"
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
import { StatusIcon } from "../components/atoms/StatusIcon"
import { getInscricaoStatusLabel } from "../lib/utils/helpers"

export default function InscricoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("")
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

  const fetchInscricoes = useCallback(() => {
    const filters = { page, status: statusFilter, search: searchTerm }
    return isOrganizador() 
      ? inscricoesService.listInscricoesOrganizador(filters)
      : inscricoesService.listInscricoes(filters)
  }, [page, statusFilter, searchTerm, isOrganizador, inscricoesService])

  const { data: inscricoesData, loading, error, refetch } = useFetch(
    fetchInscricoes,
    [page, statusFilter, searchTerm, isOrganizador]
  )

  // Auto-refetch quando filtros mudam
  useEffect(() => {
    setPage(1) // Reset para página 1 quando filtros mudam
  }, [statusFilter, searchTerm])

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
        toast.success("Inscrição cancelada com sucesso! Você não poderá se inscrever novamente neste evento.")
      } else if (action === "delete") {
        await inscricoesService.deleteInscricao(inscricaoId)
        toast.success("Inscrição removida com sucesso!")
      }
      // Auto-atualização sem reload
      await refetch()
    } catch (error: any) {
      console.error(`Erro ao ${action === "cancel" ? "cancelar" : "remover"} inscrição:`, error)
      const errorMessage = error?.response?.data?.detail || error?.message || "Erro desconhecido. Tente novamente."
      toast.error(`Não foi possível ${action === "cancel" ? "cancelar" : "remover"} a inscrição. ${errorMessage}`)
    } finally {
      setConfirmModalState({ isOpen: false, action: null, inscricaoId: null })
    }
  }, [confirmModalState, inscricoesService, refetch, toast])

  const closeConfirmModal = useCallback(() => {
    setConfirmModalState({ isOpen: false, action: null, inscricaoId: null })
  }, [])

  const inscricoes = inscricoesData?.results || []

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

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar inscrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-48 px-3 py-2 rounded-lg bg-background border border-input hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            >
              <option value="">Todos os status</option>
              <option value="confirmada">Confirmadas</option>
              <option value="pendente">Pendentes</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          {/* Indicadores de filtros ativos */}
          {(statusFilter || searchTerm) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Status: {getInscricaoStatusLabel(statusFilter as any)}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Busca: "{searchTerm}"
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando inscrições...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">Não foi possível carregar suas inscrições</p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-2">Tente novamente em alguns instantes.</p>
            <Button variant="primary" onClick={() => refetch()} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        ) : inscricoes.length > 0 ? (
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
                  {inscricoes.map((inscricao: Inscricao) => (
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
                          <StatusIcon status={inscricao.status} />
                          {getInscricaoStatusLabel(inscricao.status)}
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
              {inscricoes.map((inscricao: Inscricao) => (
                <InscricaoCard key={inscricao.id} inscricao={inscricao} onCancel={handleCancel} onDelete={handleDelete} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground text-lg">Nenhuma inscrição encontrada</p>
            {(statusFilter || searchTerm) && (
              <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros ou buscar por outro termo.</p>
            )}
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
        {inscricoesData && inscricoesData.count > 0 && (
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
            ? "Tem certeza que deseja cancelar esta inscrição? Você não poderá se inscrever novamente neste evento."
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
