import { useEffect, useMemo, useState } from 'react'
import type { AxiosError } from 'axios'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'
import { PageHeader } from '../../components/admin/PageHeader'
import { StatusBadge } from '../../components/admin/StatusBadge'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons'
import { formatarHora, formatarDataExtenso, formatarBRL } from '../../lib/format'
import { ymdLocalDe } from '../../lib/datas'
import type { AgendamentosPagina, Modalidade, StatusAgendamento } from '../../types'

const statusOpcoes: { valor: StatusAgendamento; label: string }[] = [
  { valor: 'confirmado', label: 'Confirmado' },
  { valor: 'concluido', label: 'Concluído' },
  { valor: 'falta', label: 'Falta' },
  { valor: 'cancelado', label: 'Cancelado' },
]

export default function Agendamentos() {
  const { data: modalidades } = useApi<Modalidade[]>('/modalidades')

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [data, setData] = useState('')
  const [modalidadeId, setModalidadeId] = useState('')
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')

  const [pagina, setPagina] = useState<AgendamentosPagina | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [exportando, setExportando] = useState(false)

  // Debounce da busca.
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 400)
    return () => clearTimeout(t)
  }, [busca])

  // Volta à página 1 quando um filtro muda.
  useEffect(() => {
    setPage(1)
  }, [status, data, modalidadeId, buscaDebounced])

  const url = useMemo(() => {
    const p = new URLSearchParams({ page: String(page) })
    if (status) p.set('status', status)
    if (data) p.set('data', data)
    if (modalidadeId) p.set('modalidadeId', modalidadeId)
    if (buscaDebounced) p.set('busca', buscaDebounced)
    return `/admin/agendamentos?${p.toString()}`
  }, [page, status, data, modalidadeId, buscaDebounced])

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    setErro(null)
    api
      .get<AgendamentosPagina>(url)
      .then((res) => {
        if (!cancelado) setPagina(res.data)
      })
      .catch((err) => {
        if (!cancelado)
          setErro(
            (err as AxiosError<{ message?: string }>).response?.data?.message ??
              'Erro ao carregar agendamentos',
          )
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [url])

  async function mudarStatus(id: string, novo: string) {
    try {
      await api.patch(`/admin/agendamentos/${id}/status`, { status: novo })
      setPagina((prev) =>
        prev
          ? {
              ...prev,
              agendamentos: prev.agendamentos.map((a) =>
                a.id === id ? { ...a, status: novo as StatusAgendamento } : a,
              ),
            }
          : prev,
      )
    } catch {
      setErro('Não foi possível atualizar o status.')
    }
  }

  async function exportarCSV() {
    setExportando(true)
    try {
      const res = await api.get('/admin/agendamentos/exportar', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'agendamentos.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setErro('Não foi possível exportar o CSV.')
    } finally {
      setExportando(false)
    }
  }

  const limparFiltros = () => {
    setStatus('')
    setData('')
    setModalidadeId('')
    setBusca('')
  }

  const temFiltro = status || data || modalidadeId || busca

  return (
    <div>
      <PageHeader
        titulo="Agendamentos"
        descricao="Gerencie, filtre e atualize o status das aulas."
        acao={
          <Button variante="secondary" tamanho="sm" onClick={exportarCSV} disabled={exportando}>
            {exportando ? 'Exportando...' : 'Exportar CSV (30d)'}
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          />
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          >
            <option value="">Todos os status</option>
            {statusOpcoes.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={modalidadeId}
            onChange={(e) => setModalidadeId(e.target.value)}
            className="rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          >
            <option value="">Todas as modalidades</option>
            {modalidades?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        {temFiltro && (
          <button
            onClick={limparFiltros}
            className="mt-3 font-body text-sm text-sage-500 hover:text-sage-700"
          >
            Limpar filtros
          </button>
        )}
      </Card>

      {erro && (
        <p className="mb-4 rounded-xl bg-rose-50 p-3 font-body text-sm text-rose-700">{erro}</p>
      )}

      {carregando && <div className="h-64 animate-pulse rounded-2xl bg-white" />}

      {!carregando && pagina && pagina.total === 0 && (
        <Card className="p-10 text-center">
          <p className="font-body text-sage-600">Nenhum agendamento encontrado com esses filtros.</p>
        </Card>
      )}

      {!carregando && pagina && pagina.total > 0 && (
        <>
          {/* Lista (cards no mobile, tabela no desktop) */}
          <div className="space-y-2 lg:hidden">
            {pagina.agendamentos.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-body font-medium text-sage-900">{a.cliente.nome}</p>
                    <p className="font-body text-sm text-sage-500">
                      {formatarDataExtenso(ymdLocalDe(a.dataHora))} · {formatarHora(a.dataHora)}
                    </p>
                    <p className="font-body text-sm text-sage-500">{a.modalidade.nome}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-body text-sm text-sage-600">
                    {a.valorCobrado != null ? formatarBRL(a.valorCobrado) : '—'}
                  </span>
                  <SelectStatus valor={a.status} onChange={(v) => mudarStatus(a.id, v)} />
                </div>
              </Card>
            ))}
          </div>

          <Card className="hidden overflow-hidden lg:block">
            <table className="w-full">
              <thead className="border-b border-sage-100 bg-sage-50/50">
                <tr className="text-left font-body text-xs font-medium uppercase tracking-wider text-sage-500">
                  <th className="px-4 py-3">Data / hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Modalidade</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {pagina.agendamentos.map((a) => (
                  <tr key={a.id} className="font-body text-sm">
                    <td className="whitespace-nowrap px-4 py-3 text-sage-700">
                      {ymdLocalDe(a.dataHora).split('-').reverse().join('/')} · {formatarHora(a.dataHora)}
                    </td>
                    <td className="px-4 py-3 text-sage-900">{a.cliente.nome}</td>
                    <td className="px-4 py-3 text-sage-600">{a.modalidade.nome}</td>
                    <td className="px-4 py-3 text-sage-600">
                      {a.valorCobrado != null ? formatarBRL(a.valorCobrado) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <SelectStatus valor={a.status} onChange={(v) => mudarStatus(a.id, v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Paginação */}
          <div className="mt-4 flex items-center justify-between">
            <p className="font-body text-sm text-sage-500">
              {pagina.total} agendamento(s) · página {pagina.page} de {pagina.totalPaginas}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagina.page <= 1}
                className="grid h-9 w-9 place-items-center rounded-full border border-sage-200 text-sage-600 disabled:opacity-30"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagina.page >= pagina.totalPaginas}
                className="grid h-9 w-9 place-items-center rounded-full border border-sage-200 text-sage-600 disabled:opacity-30"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SelectStatus({
  valor,
  onChange,
}: {
  valor: StatusAgendamento
  onChange: (v: string) => void
}) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-sage-200 bg-white px-2 py-1.5 font-body text-xs text-sage-700 outline-none focus:border-sage-500"
      aria-label="Alterar status"
    >
      {statusOpcoes.map((s) => (
        <option key={s.valor} value={s.valor}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
