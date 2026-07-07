import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { PageHeader } from '../../components/admin/PageHeader'
import { PerfilClienteModal } from '../../components/admin/PerfilClienteModal'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatarDataCurta } from '../../lib/format'
import { ymdLocalDe } from '../../lib/datas'
import type { ClientesResposta } from '../../types'

const filtros = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'ativas', label: 'Ativas' },
  { valor: 'inativas', label: 'Inativas' },
]

export default function Clientes() {
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [dados, setDados] = useState<ClientesResposta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [selecionado, setSelecionado] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 400)
    return () => clearTimeout(t)
  }, [busca])

  const url = useMemo(() => {
    const p = new URLSearchParams({ filtro })
    if (buscaDebounced) p.set('busca', buscaDebounced)
    return `/admin/clientes?${p.toString()}`
  }, [filtro, buscaDebounced])

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    api
      .get<ClientesResposta>(url)
      .then((res) => !cancelado && setDados(res.data))
      .finally(() => !cancelado && setCarregando(false))
    return () => {
      cancelado = true
    }
  }, [url])

  return (
    <div>
      <PageHeader titulo="Clientes" descricao="Busque, filtre e veja o histórico de cada cliente." />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="flex-1 rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
          />
          <div className="flex gap-1 rounded-xl bg-sage-50 p-1">
            {filtros.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`rounded-lg px-3 py-1.5 font-body text-sm font-medium transition-colors ${
                  filtro === f.valor ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {carregando && <div className="h-64 animate-pulse rounded-2xl bg-white" />}

      {!carregando && dados && dados.total === 0 && (
        <Card className="p-10 text-center">
          <p className="font-body text-sage-600">Nenhum cliente encontrado.</p>
        </Card>
      )}

      {!carregando && dados && dados.total > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-sage-100">
            {dados.clientes.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelecionado(c.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-sage-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-body font-medium text-sage-900">{c.nome}</p>
                      {c.ativo ? (
                        <Badge tom="success">Ativa</Badge>
                      ) : (
                        <Badge tom="neutral">Inativa</Badge>
                      )}
                    </div>
                    <p className="truncate font-body text-sm text-sage-500">{c.email}</p>
                  </div>
                  <div className="shrink-0 text-right font-body text-xs text-sage-500">
                    <p>{c.totalAgendamentos} aula(s)</p>
                    {c.ultimaVisita && (
                      <p>última {formatarDataCurta(ymdLocalDe(c.ultimaVisita))}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <PerfilClienteModal clienteId={selecionado} onFechar={() => setSelecionado(null)} />
    </div>
  )
}
