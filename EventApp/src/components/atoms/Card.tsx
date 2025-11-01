import type React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`bg-card rounded-lg border border-border p-6 shadow-sm transition-all ${className}`} {...props}>
    {children}
  </div>
)

export const CardHeader: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`mb-4 pb-4 border-b border-border ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <h2 className={`text-xl font-bold text-foreground ${className}`} {...props}>
    {children}
  </h2>
)

export const CardDescription: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <p className={`text-sm text-muted-foreground mt-1 ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)

export const CardFooter: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`flex gap-4 justify-end mt-4 pt-4 border-t border-border ${className}`} {...props}>
    {children}
  </div>
)
