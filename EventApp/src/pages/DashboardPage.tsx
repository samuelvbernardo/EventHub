"use client"
import { Header } from "../components/organisms/Header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/atoms/Card"
import { Button } from "../components/atoms/Button"
import { Badge } from "../components/atoms/Badge"
import { useFetch } from "../lib/hooks/useFetch"
import { useEventosService } from "../services/eventoService"
import { useInscricoesService } from "../services/inscricaoService"
import type { Evento, Inscricao } from "../lib/types/index"
import { formatDate } from "../lib/utils/helpers"
import { getEventTypeBadgeClasses, getEventTypeLabel } from "../lib/constants/eventColors"

export default function DashboardPage() {
  const eventosService = useEventosService()
  const inscricoesService = useInscricoesService()

  const { data: eventosData, loading: eventosLoading } = useFetch(() => eventosService.listEventos(1), [])

  const { data: inscricoesData, loading: inscricoesLoading } = useFetch(() => inscricoesService.listInscricoes({ page: 1 }), [])

  const recentEventos = eventosData?.results?.slice(0, 3) || []
  const recentInscricoes = inscricoesData?.results?.slice(0, 3) || []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Total de Eventos</p>
                <p className="text-3xl font-bold text-primary">{eventosData?.count || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Minhas Inscrições</p>
                <p className="text-3xl font-bold text-secondary">{inscricoesData?.count || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Confirmadas</p>
                <p className="text-3xl font-bold text-green-500">
                  {inscricoesData?.results?.filter((i) => i.status === "confirmada").length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Eventos Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/eventos")}>
                  Ver Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {eventosLoading ? (
                <p className="text-muted-foreground">Carregando eventos...</p>
              ) : recentEventos.length > 0 ? (
                <div className="space-y-4">
                  {recentEventos.map((evento: Evento) => (
                    <div key={evento.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">{evento.titulo}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getEventTypeBadgeClasses(evento.tipo)}`}>
                          {getEventTypeLabel(evento.tipo)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(evento.data_inicio)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum evento disponível</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Inscriptions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inscrições Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/inscricoes")}>
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inscricoesLoading ? (
                <p className="text-muted-foreground">Carregando inscrições...</p>
              ) : recentInscricoes.length > 0 ? (
                <div className="space-y-4">
                  {recentInscricoes.map((inscricao: Inscricao) => (
                    <div key={inscricao.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h3 className="font-medium text-foreground truncate">{inscricao.evento_titulo}</h3>
                          <p className="text-xs text-muted-foreground">{inscricao.participante_nome}</p>
                        </div>
                        <Badge
                          variant={
                            inscricao.status === "confirmada"
                              ? "success"
                              : inscricao.status === "pendente"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {inscricao.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma inscrição</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
