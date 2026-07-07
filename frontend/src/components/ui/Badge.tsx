import type { ReactNode } from 'react'

type Tom = 'sage' | 'cream' | 'clay' | 'success' | 'warning' | 'danger' | 'neutral'

const tons: Record<Tom, string> = {
  sage: 'bg-sage-100 text-sage-700',
  cream: 'bg-cream-200 text-clay-700',
  clay: 'bg-clay-500/15 text-clay-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  neutral: 'bg-sage-50 text-sage-500',
}

interface BadgeProps {
  children: ReactNode
  tom?: Tom
  className?: string
}

export function Badge({ children, tom = 'sage', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${tons[tom]} ${className}`}
    >
      {children}
    </span>
  )
}
