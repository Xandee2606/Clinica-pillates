import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useApi } from '../../hooks/useApi'
import { Card } from '../ui/Card'
import { formatarBRL, formatarDataCurta } from '../../lib/format'
import { CORES_GRAFICO, PALETA_SERIES } from '../../lib/charts'
import type { ReceitaResposta } from '../../types'

export function BlocoReceita() {
  const { data, loading, error } = useApi<ReceitaResposta>('/admin/dashboard/receita?periodo=mes')

  const barras = data?.porDia.map((d) => ({ dia: formatarDataCurta(d.data), valor: d.valor })) ?? []

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-medium text-sage-900">Receita</h2>
        {data && (
          <span className="font-body text-sm text-sage-500">
            Últimos 30 dias:{' '}
            <span className="font-semibold text-sage-800">{formatarBRL(data.total)}</span>
          </span>
        )}
      </div>

      {loading && <div className="mt-4 h-64 animate-pulse rounded-xl bg-sage-50" />}
      {error && <p className="mt-4 font-body text-sm text-rose-600">{error}</p>}

      {data && (
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {/* Barras: receita por dia */}
          <div className="lg:col-span-2">
            <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-sage-400">
              Por dia
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barras} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CORES_GRAFICO.grade} vertical={false} />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 10, fill: CORES_GRAFICO.texto }}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={{ stroke: CORES_GRAFICO.grade }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: CORES_GRAFICO.texto }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [formatarBRL(Number(v ?? 0)), 'Receita']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e6ede4', fontSize: 12 }}
                  />
                  <Bar dataKey="valor" fill={CORES_GRAFICO.sage} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pizza: por modalidade */}
          <div>
            <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-sage-400">
              Por modalidade
            </p>
            {data.porModalidade.length === 0 ? (
              <p className="font-body text-sm text-sage-500">Sem receita no período.</p>
            ) : (
              <>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.porModalidade}
                        dataKey="valor"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={64}
                        paddingAngle={2}
                      >
                        {data.porModalidade.map((_, i) => (
                          <Cell key={i} fill={PALETA_SERIES[i % PALETA_SERIES.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatarBRL(Number(v ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1">
                  {data.porModalidade.map((m, i) => (
                    <li key={m.nome} className="flex items-center justify-between font-body text-xs">
                      <span className="flex items-center gap-1.5 text-sage-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: PALETA_SERIES[i % PALETA_SERIES.length] }}
                        />
                        {m.nome}
                      </span>
                      <span className="font-medium text-sage-800">{formatarBRL(m.valor)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
