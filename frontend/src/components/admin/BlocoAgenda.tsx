import { useMemo, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { Card } from '../ui/Card'
import { StatusBadge } from './StatusBadge'
import { WhatsAppIcon, ClockIcon } from '../ui/icons'
import { linkWhatsApp } from '../../config/clinica'
import { hojeYMD, adicionarDias, ymdLocalDe } from '../../lib/datas'
import { formatarHora, formatarDataExtenso } from '../../lib/format'
import type { AgendaResposta, AgendaItem } from '../../types'

type Aba = 'hoje' | 'amanha' | 'semana'

const abas: { id: Aba; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'amanha', label: 'Amanhã' },
  { id: 'semana', label: 'Próximos 7 dias' },
]

const vazio: Record<Aba, string> = {
  hoje: 'Nenhum agendamento para hoje. Hora de divulgar! 🌿',
  amanha: 'Nenhum agendamento para amanhã ainda.',
  semana: 'Nenhum agendamento nos próximos 7 dias.',
}

export function BlocoAgenda() {
  const [aba, setAba] = useState<Aba>('hoje')
  const hoje = hojeYMD()

  const url = useMemo(() => {
    if (aba === 'amanha') return `/admin/dashboard/agenda?data=${adicionarDias(hoje, 1)}`
    if (aba === 'semana') return `/admin/dashboard/agenda?data=${hoje}&dias=7`
    return `/admin/dashboard/agenda?data=${hoje}`
  }, [aba, hoje])

  const { data, loading, error } = useApi<AgendaResposta>(url)

  // Agrupa por dia (relevante na aba "7 dias").
  const grupos = useMemo(() => {
    if (!data) return []
    const mapa = new Map<string, AgendaItem[]>()
    for (const item of data.agendamentos) {
      const dia = ymdLocalDe(item.dataHora)
      const lista = mapa.get(dia) ?? []
      lista.push(item)
      mapa.set(dia, lista)
    }
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [data])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium text-sage-900">Agenda</h2>
      </div>

      {/* Abas */}
      <div className="mt-4 flex gap-1 rounded-xl bg-sage-50 p-1">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex-1 rounded-lg px-3 py-2 font-body text-sm font-medium transition-colors ${
              aba === a.id ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-sage-50" />
            ))}
          </div>
        )}

        {error && <p className="font-body text-sm text-rose-600">{error}</p>}

        {data && data.total === 0 && (
          <p className="rounded-xl bg-cream-100 p-6 text-center font-body text-sm text-sage-600">
            {vazio[aba]}
          </p>
        )}

        {data && data.total > 0 && (
          <div className="space-y-5">
            {grupos.map(([dia, itens]) => (
              <div key={dia}>
                {aba === 'semana' && (
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-sage-400">
                    {formatarDataExtenso(dia)}
                  </p>
                )}
                <ul className="space-y-2">
                  {itens.map((item) => (
                    <AgendaLinha key={item.id} item={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function AgendaLinha({ item }: { item: AgendaItem }) {
  const cancelado = item.status === 'cancelado'
  const primeiroNome = item.cliente.nome.split(' ')[0]

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border border-sage-100 p-3 ${
        cancelado ? 'opacity-60' : ''
      }`}
    >
      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-sage-50 py-1.5">
        <ClockIcon className="h-3.5 w-3.5 text-sage-400" />
        <span className="font-body text-sm font-semibold text-sage-800">
          {formatarHora(item.dataHora)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-body font-medium text-sage-900">{item.cliente.nome}</p>
        <p className="truncate font-body text-sm text-sage-500">{item.modalidade.nome}</p>
      </div>

      <StatusBadge status={item.status} />

      <a
        href={linkWhatsApp(item.cliente.telefone, `Olá, ${primeiroNome}!`)}
        target="_blank"
        rel="noopener noreferrer"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366]/10 text-[#1eb457] transition-colors hover:bg-[#25D366]/20"
        aria-label={`WhatsApp de ${item.cliente.nome}`}
      >
        <WhatsAppIcon className="h-4 w-4" />
      </a>
    </li>
  )
}
