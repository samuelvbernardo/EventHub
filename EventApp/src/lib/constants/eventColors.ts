/**
 * Paleta de cores padronizada para tipos de evento.
 * Garante consistência visual em toda a aplicação.
 * Cores modernas e sofisticadas com alto contraste para tema dark.
 */

export const EVENT_TYPE_COLORS = {
  presencial: {
    badge: "bg-slate-200 text-slate-900 border-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    hover: "hover:bg-slate-100",
  },
  virtual: {
    badge: "bg-blue-200 text-blue-900 border-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    hover: "hover:bg-blue-100",
  },
  hibrido: {
    badge: "bg-cyan-200 text-cyan-900 border-cyan-400",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    hover: "hover:bg-cyan-100",
  },
} as const

export type EventoTipo = keyof typeof EVENT_TYPE_COLORS

/**
 * Retorna as classes CSS para o badge de um tipo de evento.
 */
export function getEventTypeBadgeClasses(tipo: EventoTipo): string {
  return EVENT_TYPE_COLORS[tipo]?.badge || EVENT_TYPE_COLORS.presencial.badge
}

/**
 * Retorna o label formatado para exibição.
 */
export function getEventTypeLabel(tipo: EventoTipo): string {
  const labels: Record<EventoTipo, string> = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrido: "Híbrido",
  }
  return labels[tipo] || tipo
}
