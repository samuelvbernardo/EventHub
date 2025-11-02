import type React from "react"
import type { InscricaoStatus } from "../../lib/constants/statusColors"
import { statusIcons } from "../../lib/constants/statusColors"

interface StatusIconProps {
  status: InscricaoStatus
  className?: string
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, className = "w-3 h-3" }) => {
  const icon = statusIcons[status]
  
  if (!icon) return null

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox={icon.viewBox}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
    </svg>
  )
}
