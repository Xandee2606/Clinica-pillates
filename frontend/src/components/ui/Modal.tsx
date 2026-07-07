import { useEffect, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface Props {
  aberto: boolean
  onFechar: () => void
  titulo?: string
  children: ReactNode
  className?: string
}

export function Modal({ aberto, onFechar, titulo, children, className = '' }: Props) {
  useEffect(() => {
    if (!aberto) return
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-sage-950/40 backdrop-blur-sm"
        onClick={onFechar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-cream-50 shadow-xl sm:max-w-lg sm:rounded-3xl ${className}`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-sage-100 bg-cream-50/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-lg font-medium text-sage-900">{titulo}</h2>
          <button
            onClick={onFechar}
            className="grid h-9 w-9 place-items-center rounded-full text-sage-500 hover:bg-sage-100"
            aria-label="Fechar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
