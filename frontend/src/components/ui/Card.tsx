import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-sage-100 bg-white shadow-sm shadow-sage-900/[0.03] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
