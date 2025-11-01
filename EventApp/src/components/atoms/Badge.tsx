import type React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "destructive"
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children, className = "", ...props }) => {
  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-500/20 text-green-500",
    warning: "bg-yellow-500/20 text-yellow-500",
    danger: "bg-red-500/20 text-red-500",
    info: "bg-blue-500/20 text-blue-500",
    outline: "border border-border text-foreground",
    destructive: "bg-red-500/20 text-red-500",
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
