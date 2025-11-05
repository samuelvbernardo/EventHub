"use client"

import { useState, useCallback } from "react"
import { Header } from "../components/organisms/Header"
import { EventCard } from "../components/molecules/EventCard"
import { EventFormModal } from "../components/molecules/EventFormModal"
import { Button } from "../components/atoms/Button"
import { Input } from "../components/atoms/Input"
import { ConfirmModal } from "../components/atoms/ConfirmModal"
import { useFetch } from "../lib/hooks/useFetch"
import { useEventosService } from "../services/eventoService"
import { useInscricoesService } from "../services/inscricaoService"
import { useAuth } from "../lib/context/AuthContext"
import { useToast } from "../lib/context/ToastContext"
import type { Evento } from "../lib/types/index"
import { PAGE_SIZE } from "../lib/constants/api"

export default function EventosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null)
  const [page, setPage] = useState(1)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean
    eventoId: number | null
  }>({
    isOpen: false,
    eventoId: null,
  })

  const eventosService = useEventosService()
  const inscricoesService = useInscricoesService()
  const { isOrganizador } = useAuth()
  const toast = useToast()

  const { data: eventosData, loading, refetch } = useFetch(() => eventosService.listEventos(page), [page])

  const handleInscribe = useCallback(
    async (eventoId: number) => {
      try {
        const result = await inscricoesService.createInscricaoByEventoId(eventoId)
        
        // Exibir mensagem do backend
        const backendMessage = result?.message || "Inscrição realizada com sucesso"
        
        // Escolher tipo de toast baseado no status
        if (result?.status === 'pendente') {
          toast.info(backendMessage)
        } else {
          toast.success(backendMessage)
        }
        
        // Auto-atualizar lista de eventos para refletir isInscrito
        await refetch()
      } catch (error: any) {
        // Exibir erro do backend
        const errorDetail = error?.response?.data?.detail || 
                           error?.response?.data?.message || 
                           "Não foi possível realizar a inscrição. Tente novamente."
        toast.error(errorDetail)
      }
    },
    [inscricoesService, refetch, toast],
  )

  const handleCreateOrUpdate = useCallback(
    async (data: Partial<Evento>) => {
      try {
        if (editingEvent) {
          await eventosService.updateEvento(editingEvent.id, data)
          toast.success("Evento atualizado com sucesso!")
        } else {
          await eventosService.createEvento(data)
          toast.success("Evento criado com sucesso!")
        }
        setShowForm(false)
        setEditingEvent(null)
        refetch()
      } catch (error) {
        toast.error("Erro ao salvar evento")
      }
    },
    [eventosService, editingEvent, refetch, toast],
  )

  const handleDelete = useCallback(
    async (eventoId: number) => {
      setDeleteConfirmState({
        isOpen: true,
        eventoId,
      })
    },
    [],
  )

  const executeDelete = useCallback(async () => {
    if (!deleteConfirmState.eventoId) return

    try {
      await eventosService.deleteEvento(deleteConfirmState.eventoId)
      toast.success("Evento deletado com sucesso!")
      refetch()
    } catch (error) {
      toast.error("Erro ao deletar evento")
    } finally {
      setDeleteConfirmState({ isOpen: false, eventoId: null })
    }
  }, [deleteConfirmState.eventoId, eventosService, refetch, toast])

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmState({ isOpen: false, eventoId: null })
  }, [])

  const eventos = eventosData?.results || []
  const filteredEventos = eventos.filter(
    (evento: Evento) =>
      evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evento.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
            {isOrganizador() && (
              <Button onClick={() => setShowForm(true)}>
                <span className="mr-2">+</span>
                Criar Novo Evento
              </Button>
            )}
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando eventos...</p>
          </div>
        ) : filteredEventos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEventos.map((evento: Evento) => (
              <EventCard
                key={evento.id}
                evento={evento}
                onInscribe={handleInscribe}
                onEdit={() => {
                  setEditingEvent(evento)
                  setShowForm(true)
                }}
                onDelete={handleDelete}
                canEdit={isOrganizador()}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum evento encontrado</p>
          </div>
        )}

        {/* Pagination */}
        {eventosData && (
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="ghost" disabled={!eventosData.previous} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <span className="text-muted-foreground py-2">
              Página {page} de {Math.ceil((eventosData.count || 0) / PAGE_SIZE)}
            </span>
            <Button variant="ghost" disabled={!eventosData.next} onClick={() => setPage(page + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </main>

      {showForm && isOrganizador() && (
        <EventFormModal
          evento={editingEvent}
          onSave={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false)
            setEditingEvent(null)
          }}
        />
      )}

      {/* Modal de confirmação de deleção */}
      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        title="Deletar Evento"
        message="Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>
  )
}
