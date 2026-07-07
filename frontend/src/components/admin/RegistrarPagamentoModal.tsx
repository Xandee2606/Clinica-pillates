import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import api from '../../services/api'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { ClientesResposta, ClienteLista } from '../../types'

export interface PrefillPagamento {
  clienteId?: string
  agendamentoId?: string
  valor?: number
}

interface Props {
  aberto: boolean
  onFechar: () => void
  onSucesso: () => void
  prefill?: PrefillPagamento
}

const tipos = [
  { valor: 'avulso', label: 'Avulso' },
  { valor: 'mensalidade', label: 'Mensalidade' },
  { valor: 'pacote', label: 'Pacote' },
]

const inputCls =
  'w-full rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200'

export function RegistrarPagamentoModal({ aberto, onFechar, onSucesso, prefill }: Props) {
  const [clientes, setClientes] = useState<ClienteLista[]>([])
  const [clienteId, setClienteId] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('avulso')
  const [observacoes, setObservacoes] = useState('')
  const [agendamentoId, setAgendamentoId] = useState<string | undefined>(undefined)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return
    api.get<ClientesResposta>('/admin/clientes').then((res) => setClientes(res.data.clientes))
  }, [aberto])

  // Aplica prefill ao abrir.
  useEffect(() => {
    if (aberto) {
      setClienteId(prefill?.clienteId ?? '')
      setValor(prefill?.valor != null ? String(prefill.valor) : '')
      setAgendamentoId(prefill?.agendamentoId)
      setTipo('avulso')
      setObservacoes('')
      setErro(null)
    }
  }, [aberto, prefill])

  async function salvar() {
    setErro(null)
    const valorNum = Number(valor.replace(',', '.'))
    if (!clienteId) return setErro('Selecione um cliente.')
    if (!valorNum || valorNum <= 0) return setErro('Informe um valor válido.')

    setEnviando(true)
    try {
      await api.post('/admin/financeiro/pagamentos', {
        clienteId,
        agendamentoId,
        valor: valorNum,
        tipo,
        observacoes: observacoes || undefined,
      })
      onSucesso()
      onFechar()
    } catch (err) {
      setErro(
        (err as AxiosError<{ message?: string }>).response?.data?.message ??
          'Não foi possível registrar o pagamento.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Registrar pagamento">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className={inputCls}
          >
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">
              Valor (R$)
            </label>
            <input
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
              {tipos.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">
            Observações <span className="text-sage-400">(opcional)</span>
          </label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className={inputCls}
          />
        </div>

        {agendamentoId && (
          <p className="rounded-lg bg-sage-50 px-3 py-2 font-body text-xs text-sage-600">
            Vinculado a um agendamento concluído.
          </p>
        )}

        {erro && (
          <p className="rounded-xl bg-rose-50 p-3 font-body text-sm text-rose-700">{erro}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={onFechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={enviando}>
            {enviando ? 'Salvando...' : 'Registrar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
