import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { PageHeader } from '../../components/admin/PageHeader'
import {
  RegistrarPagamentoModal,
  type PrefillPagamento,
} from '../../components/admin/RegistrarPagamentoModal'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatarBRL, formatarDataCurta } from '../../lib/format'
import { ymdLocalDe } from '../../lib/datas'
import type { PagamentosResposta, PendenciasResposta } from '../../types'

const periodos = [
  { valor: '7', label: '7 dias' },
  { valor: '30', label: '30 dias' },
  { valor: '90', label: '90 dias' },
]

export default function Financeiro() {
  const [periodo, setPeriodo] = useState('30')
  const [pagamentos, setPagamentos] = useState<PagamentosResposta | null>(null)
  const [pendencias, setPendencias] = useState<PendenciasResposta | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [prefill, setPrefill] = useState<PrefillPagamento | undefined>(undefined)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const [pg, pd] = await Promise.all([
        api.get<PagamentosResposta>(`/admin/financeiro/pagamentos?periodo=${periodo}`),
        api.get<PendenciasResposta>('/admin/financeiro/pendencias'),
      ])
      setPagamentos(pg.data)
      setPendencias(pd.data)
    } finally {
      setCarregando(false)
    }
  }, [periodo])

  useEffect(() => {
    carregar()
  }, [carregar])

  const abrirRegistro = (p?: PrefillPagamento) => {
    setPrefill(p)
    setModalAberto(true)
  }

  const totalPorModalidade = useMemo(() => pagamentos?.porModalidade ?? [], [pagamentos])

  return (
    <div>
      <PageHeader
        titulo="Financeiro"
        descricao="Pagamentos, arrecadação e pendências."
        acao={
          <Button tamanho="sm" onClick={() => abrirRegistro(undefined)}>
            Registrar pagamento
          </Button>
        }
      />

      {/* Cards resumo */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ResumoCard
          rotulo={`Arrecadado (${periodo}d)`}
          valor={formatarBRL(pagamentos?.total ?? 0)}
        />
        <ResumoCard
          rotulo="Pendências"
          valor={formatarBRL(pendencias?.totalPendente ?? 0)}
          sub={`${pendencias?.total ?? 0} aula(s)`}
          alerta={(pendencias?.total ?? 0) > 0}
        />
        {totalPorModalidade.slice(0, 2).map((m) => (
          <ResumoCard key={m.nome} rotulo={m.nome} valor={formatarBRL(m.valor)} />
        ))}
      </div>

      {/* Pendências */}
      {pendencias && pendencias.total > 0 && (
        <Card className="mb-5 p-5">
          <h2 className="font-display text-lg font-medium text-sage-900">
            Aulas concluídas sem pagamento
          </h2>
          <ul className="mt-3 space-y-2">
            {pendencias.pendencias.slice(0, 8).map((p) => (
              <li
                key={p.agendamentoId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-body font-medium text-sage-900">{p.cliente.nome}</p>
                  <p className="font-body text-sm text-sage-500">
                    {formatarDataCurta(ymdLocalDe(p.dataHora))} · {p.modalidade} ·{' '}
                    {p.valorCobrado != null ? formatarBRL(p.valorCobrado) : '—'}
                  </p>
                </div>
                <Button
                  variante="secondary"
                  tamanho="sm"
                  onClick={() =>
                    abrirRegistro({
                      clienteId: p.cliente.id,
                      agendamentoId: p.agendamentoId,
                      valor: p.valorCobrado ?? undefined,
                    })
                  }
                >
                  Registrar
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Histórico */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-medium text-sage-900">Histórico de pagamentos</h2>
          <div className="flex gap-1 rounded-lg bg-sage-50 p-1">
            {periodos.map((p) => (
              <button
                key={p.valor}
                onClick={() => setPeriodo(p.valor)}
                className={`rounded-md px-2.5 py-1 font-body text-xs font-medium transition-colors ${
                  periodo === p.valor ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {carregando && <div className="mt-4 h-40 animate-pulse rounded-xl bg-sage-50" />}

        {!carregando && pagamentos && pagamentos.pagamentos.length === 0 && (
          <p className="mt-6 text-center font-body text-sm text-sage-500">
            Nenhum pagamento registrado neste período.
          </p>
        )}

        {!carregando && pagamentos && pagamentos.pagamentos.length > 0 && (
          <ul className="mt-4 divide-y divide-sage-100">
            {pagamentos.pagamentos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-body font-medium text-sage-900">{p.clienteNome}</p>
                  <p className="font-body text-sm text-sage-500">
                    {formatarDataCurta(ymdLocalDe(p.dataPagamento))}
                    {p.modalidade ? ` · ${p.modalidade}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tom={p.tipo === 'mensalidade' ? 'sage' : p.tipo === 'pacote' ? 'clay' : 'cream'}>
                    {p.tipo}
                  </Badge>
                  <span className="font-body font-semibold text-sage-800">
                    {formatarBRL(p.valor)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <RegistrarPagamentoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSucesso={carregar}
        prefill={prefill}
      />
    </div>
  )
}

function ResumoCard({
  rotulo,
  valor,
  sub,
  alerta,
}: {
  rotulo: string
  valor: string
  sub?: string
  alerta?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        alerta ? 'border-amber-200 bg-amber-50/50' : 'border-sage-100 bg-white'
      }`}
    >
      <p className="truncate font-body text-xs font-medium text-sage-500">{rotulo}</p>
      <p className="mt-1 font-display text-xl font-medium text-sage-900">{valor}</p>
      {sub && <p className="font-body text-xs text-sage-400">{sub}</p>}
    </div>
  )
}
