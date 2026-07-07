import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variante = 'primary' | 'secondary' | 'ghost' | 'whatsapp'
type Tamanho = 'sm' | 'md' | 'lg'

const variantes: Record<Variante, string> = {
  primary:
    'bg-sage-600 text-cream-50 hover:bg-sage-700 shadow-sm shadow-sage-900/10 focus-visible:ring-sage-500',
  secondary:
    'bg-cream-100 text-sage-800 border border-sage-200 hover:bg-cream-200 focus-visible:ring-sage-400',
  ghost: 'bg-transparent text-sage-700 hover:bg-sage-50 focus-visible:ring-sage-400',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1eb457] focus-visible:ring-[#25D366]',
}

const tamanhos: Record<Tamanho, string> = {
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-base px-5 py-2.5 gap-2',
  lg: 'text-lg px-7 py-3.5 gap-2.5',
}

const baseClasses =
  'inline-flex items-center justify-center rounded-full font-body font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

interface CommonProps {
  variante?: Variante
  tamanho?: Tamanho
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variante = 'primary',
  tamanho = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantes[variante]} ${tamanhos[tamanho]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface LinkButtonProps extends CommonProps {
  to?: string
  href?: string
  target?: string
  rel?: string
  onClick?: () => void
}

export function LinkButton({
  variante = 'primary',
  tamanho = 'md',
  className = '',
  children,
  to,
  href,
  ...props
}: LinkButtonProps) {
  const cls = `${baseClasses} ${variantes[variante]} ${tamanhos[tamanho]} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={cls} {...props}>
      {children}
    </a>
  )
}
