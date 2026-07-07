import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { Card } from '../ui/Card'
import { DIAS_CURTOS } from '../../lib/format'
import type { OcupacaoResposta } from '../../types'

const periodos = [30, 60, 90]

/** Intensidade de verde proporcional a total/max. */
function corIntensidade(total: number, max: number): string {
  if (total === 0 || max === 0) return 'transparent'
  const t = total / max
  const alpha = 0.12 + t * 0.78
  return `rgba(75, 111, 71, ${alpha.toFixed(2)})`
}

export function BlocoHeatmap() {
  const [periodo, setPeriodo] = useState(30)
  const { data, loading, error } = useApi<OcupacaoResposta>(
    `/admin/dashboard/ocupacao-padrao?periodo=${periodo}`,
    [periodo],
  )

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-medium text-sage-900">Demanda por horário</h2>
          <p className="mt-1 font-body text-sm text-sage-500">
            Quando seus clientes mais procuram aulas.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-sage-50 p-1">
          {periodos.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`rounded-md px-2.5 py-1 font-body text-xs font-medium transition-colors ${
                periodo === p ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="mt-4 h-48 animate-pulse rounded-xl bg-sage-50" />}
      {error && <p className="mt-4 font-body text-sm text-rose-600">{error}</p>}

      {data && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-10" />
                {data.horas.map((h) => (
                  <th key={h} className="pb-1 text-center font-body text-[10px] text-sage-400">
                    {String(h).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.linhas.map((linha) => (
                <tr key={linha.diaSemana}>
                  <td className="pr-1 text-right font-body text-[11px] font-medium text-sage-500">
                    {DIAS_CURTOS[linha.diaSemana]}
                  </td>
                  {linha.horas.map((c) => (
                    <td key={c.hora} className="p-0">
                      <div
                        title={`${DIAS_CURTOS[linha.diaSemana]} ${String(c.hora).padStart(2, '0')}h — ${c.total} aula(s)`}
                        className="mx-auto grid h-6 place-items-center rounded font-body text-[10px] text-sage-800"
                        style={{ backgroundColor: corIntensidade(c.total, data.max) }}
                      >
                        {c.total > 0 ? c.total : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
