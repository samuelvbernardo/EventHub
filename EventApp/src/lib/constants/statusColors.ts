// Cores padronizadas para status de inscrição
// Pendente: âmbar/amarelo | Confirmada: verde | Cancelada: vermelho

export type InscricaoStatus = "pendente" | "confirmada" | "cancelada"

const STATUS_BADGE_CLASSES: Record<InscricaoStatus, string> = {
  pendente:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  confirmada:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelada:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
}

export function getInscricaoStatusBadgeClasses(status: InscricaoStatus): string {
  const base = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
  return `${base} ${STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.pendente}`
}

// Props para os ícones SVG
export const statusIcons = {
  confirmada: {
    path: "M5 13l4 4L19 7",
    viewBox: "0 0 24 24"
  },
  pendente: {
    path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    viewBox: "0 0 24 24"
  },
  cancelada: {
    path: "M6 18L18 6M6 6l12 12",
    viewBox: "0 0 24 24"
  }
}

export function getInscricaoStatusIconPath(status: InscricaoStatus): string {
  return statusIcons[status]?.path || ""
}
