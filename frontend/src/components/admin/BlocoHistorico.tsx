import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useApi } from '../../hooks/useApi'
import { Card } from '../ui/Card'
import { formatarDataCurta } from '../../lib/format'
import { CORES_GRAFICO } from '../../lib/charts'
import type { HistoricoResposta } from '../../types'

const filtros = [7, 15, 30]

const NOMES_MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function rotuloMes(ym: string): string {
  const [, mes] = ym.split('-').map(Number)
  return NOMES_MES_CURTO[mes - 1] ?? ym
}

export function BlocoHistorico() {
  const [dias, setDias] = useState(30)
  const { data, loading, error } = useApi<HistoricoResposta>(
    `/admin/dashboard/historico?dias=${dias}`,
    [dias],
  )

  const linha = data?.agendamentosPorDia.map((d) => ({ dia: formatarDataCurta(d.data), total: d.total })) ?? []
  const clientes = data?.novosClientesPorMes.map((m) => ({ mes: rotuloMes(m.mes), total: m.total })) ?? []

  return (
    <Card className="p-5">
      <h2 className="font-display text-lg font-medium text-sage-900">Histórico</h2>

      {loading && <div className="mt-4 h-64 animate-pulse rounded-xl bg-sage-50" />}
      {error && <p className="mt-4 font-body text-sm text-rose-600">{error}</p>}

      {data && (
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="font-body text-xs font-medium uppercase tracking-wider text-sage-400">
                Agendamentos por dia
              </p>
              <div className="flex gap-1 rounded-lg bg-sage-50 p-1">
                {filtros.map((f) => (
                  <button
                    key={f}
                    onClick={() => setDias(f)}
                    className={`rounded-md px-2.5 py-1 font-body text-xs font-medium transition-colors ${
                      dias === f ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500'
                    }`}
                  >
                    {f}d
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={linha} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CORES_GRAFICO.grade} vertical={false} />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 10, fill: CORES_GRAFICO.texto }}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={{ stroke: CORES_GRAFICO.grade }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: CORES_GRAFICO.texto }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [Number(v ?? 0), 'Agendamentos']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e6ede4', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={CORES_GRAFICO.sage}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="font-body text-xs font-medium uppercase tracking-wider text-sage-400">
              Novos clientes / mês
            </p>
            <div className="mt-2 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientes} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CORES_GRAFICO.grade} vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: CORES_GRAFICO.texto }}
                    tickLine={false}
                    axisLine={{ stroke: CORES_GRAFICO.grade }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: CORES_GRAFICO.texto }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [Number(v ?? 0), 'Novos clientes']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e6ede4', fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill={CORES_GRAFICO.clay} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
