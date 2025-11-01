import type { Evento } from "../types/index"

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numPrice)
}

export const getEventoTypeLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrido: "Híbrido",
  }
  return labels[tipo] || tipo
}

export const getEventoTypeColor = (tipo: string): string => {
  const colors: Record<string, string> = {
    presencial: "bg-blue-500",
    virtual: "bg-purple-500",
    hibrido: "bg-cyan-500",
  }
  return colors[tipo] || "bg-gray-500"
}

export const getInscricaoStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    confirmada: "Confirmada",
    cancelada: "Cancelada",
  }
  return labels[status] || status
}

export const getInscricaoStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pendente: "bg-yellow-500",
    confirmada: "bg-green-500",
    cancelada: "bg-red-500",
  }
  return colors[status] || "bg-gray-500"
}

export const getCapacidadeText = (evento: Evento): string => {
  return `${evento.capacidade} lugares disponíveis`
}

export const formatEventoData = (evento: Evento): Evento => {
  return {
    ...evento,
    data_inicio: formatDate(evento.data_inicio),
    data_fim: formatDate(evento.data_fim),
  }
}
