import type { ReactNode } from 'react'

interface Props {
  titulo: string
  descricao?: string
  acao?: ReactNode
}

export function PageHeader({ titulo, descricao, acao }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-sage-900">{titulo}</h1>
        {descricao && <p className="mt-1 font-body text-sm text-sage-600">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}
