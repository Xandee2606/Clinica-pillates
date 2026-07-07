import { useApi } from '../../hooks/useApi'
import { CalendarIcon, CalendarWeekIcon, UsersIcon, WalletIcon } from '../ui/icons'
import { formatarBRL } from '../../lib/format'
import type { ResumoResposta } from '../../types'
import type { ComponentType, SVGProps } from 'react'

export function BlocoResumo() {
  const { data, loading } = useApi<ResumoResposta>('/admin/dashboard/resumo')

  const cards: { label: string; valor: string; icone: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { label: 'Hoje', valor: String(data?.agendamentosHoje ?? 0), icone: CalendarIcon },
    { label: 'Esta semana', valor: String(data?.agendamentosSemana ?? 0), icone: CalendarWeekIcon },
    { label: 'Clientes ativos', valor: String(data?.clientesAtivos ?? 0), icone: UsersIcon },
    { label: 'Receita do mês', valor: formatarBRL(data?.receitaMes ?? 0), icone: WalletIcon },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const Icone = c.icone
        return (
          <div
            key={c.label}
            className="rounded-2xl border border-sage-100 bg-white p-4 shadow-sm shadow-sage-900/[0.03]"
          >
            <div className="flex items-center gap-2 text-sage-500">
              <Icone className="h-4 w-4" />
              <span className="font-body text-xs font-medium">{c.label}</span>
            </div>
            {loading ? (
              <div className="mt-2 h-7 w-16 animate-pulse rounded bg-sage-100" />
            ) : (
              <p className="mt-1 font-display text-2xl font-medium text-sage-900">{c.valor}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
