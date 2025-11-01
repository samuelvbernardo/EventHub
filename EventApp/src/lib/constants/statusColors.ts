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
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
  return `${base} ${STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.pendente}`
}
