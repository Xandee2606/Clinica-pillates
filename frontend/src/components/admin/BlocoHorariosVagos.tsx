import { useApi } from '../../hooks/useApi'
import { Card } from '../ui/Card'
import { DIAS_CURTOS } from '../../lib/format'
import { diaSemana } from '../../lib/datas'
import type { HorariosVagosResposta, StatusSlot } from '../../types'

const corDoStatus: Record<StatusSlot, string> = {
  ocupado: 'bg-sage-500',
  parcial: 'bg-amber-300',
  vago: 'bg-rose-200',
  fechado: 'bg-sage-50',
}

const legenda: { status: StatusSlot; label: string }[] = [
  { status: 'ocupado', label: 'Cheio' },
  { status: 'parcial', label: 'Parcial' },
  { status: 'vago', label: 'Vago' },
]

export function BlocoHorariosVagos() {
  const { data, loading, error } = useApi<HorariosVagosResposta>('/admin/dashboard/horarios-vagos')

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-medium text-sage-900">Horários da semana</h2>
          <p className="mt-1 font-body text-sm text-sage-500">
            Onde ainda há espaço para encaixar clientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {legenda.map((l) => (
            <span key={l.status} className="flex items-center gap-1.5 font-body text-xs text-sage-500">
              <span className={`h-3 w-3 rounded ${corDoStatus[l.status]}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {loading && <div className="mt-4 h-56 animate-pulse rounded-xl bg-sage-50" />}
      {error && <p className="mt-4 font-body text-sm text-rose-600">{error}</p>}

      {data && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-10" />
                {data.dias.map((d) => (
                  <th
                    key={d.data}
                    className="pb-1 text-center font-body text-xs font-medium text-sage-500"
                  >
                    {DIAS_CURTOS[diaSemana(d.data)]}
                    <span className="block text-[10px] font-normal text-sage-400">
                      {d.data.slice(8)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.horas.map((h, idx) => (
                <tr key={h}>
                  <td className="pr-1 text-right align-middle font-body text-[11px] text-sage-400">
                    {String(h).padStart(2, '0')}h
                  </td>
                  {data.dias.map((d) => {
                    const cel = d.celulas[idx]
                    const titulo = cel.aberto
                      ? `${cel.bookings} agendamento(s) — ${cel.percentual}% de ocupação`
                      : 'Fechado'
                    return (
                      <td key={d.data + h} className="p-0">
                        <div
                          title={titulo}
                          className={`mx-auto h-6 rounded ${corDoStatus[cel.status]} ${
                            cel.status === 'fechado' ? 'opacity-40' : ''
                          }`}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
