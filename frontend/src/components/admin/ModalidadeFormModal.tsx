import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import api from '../../services/api'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Modalidade } from '../../types'

interface Props {
  aberto: boolean
  modalidade: Modalidade | null // null = criar
  onFechar: () => void
  onSucesso: () => void
}

const inputCls =
  'w-full rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200'

const vazio = { nome: '', descricao: '', duracao: '50', vagas: '1', valor: '', foto: '', ativa: true }

export function ModalidadeFormModal({ aberto, modalidade, onFechar, onSucesso }: Props) {
  const [form, setForm] = useState(vazio)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    if (modalidade) {
      setForm({
        nome: modalidade.nome,
        descricao: modalidade.descricao ?? '',
        duracao: String(modalidade.duracao),
        vagas: String(modalidade.vagas),
        valor: String(modalidade.valor),
        foto: modalidade.foto ?? '',
        ativa: modalidade.ativa,
      })
    } else {
      setForm(vazio)
    }
  }, [aberto, modalidade])

  const set = (campo: keyof typeof form, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }))

  async function salvar() {
    setErro(null)
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      duracao: Number(form.duracao),
      vagas: Number(form.vagas),
      valor: Number(String(form.valor).replace(',', '.')),
      foto: form.foto.trim() || null,
      ativa: form.ativa,
    }
    if (payload.nome.length < 2) return setErro('Informe o nome.')
    if (!payload.duracao || payload.duracao <= 0) return setErro('Duração inválida.')
    if (!payload.vagas || payload.vagas <= 0) return setErro('Vagas inválidas.')
    if (Number.isNaN(payload.valor) || payload.valor < 0) return setErro('Valor inválido.')

    setEnviando(true)
    try {
      if (modalidade) {
        await api.put(`/admin/modalidades/${modalidade.id}`, payload)
      } else {
        await api.post('/admin/modalidades', payload)
      }
      onSucesso()
      onFechar()
    } catch (err) {
      setErro(
        (err as AxiosError<{ message?: string }>).response?.data?.message ??
          'Não foi possível salvar a modalidade.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={modalidade ? 'Editar modalidade' : 'Nova modalidade'}>
      <div className="space-y-4">
        <Campo label="Nome">
          <input value={form.nome} onChange={(e) => set('nome', e.target.value)} className={inputCls} />
        </Campo>

        <Campo label="Descrição">
          <textarea
            rows={2}
            value={form.descricao}
            onChange={(e) => set('descricao', e.target.value)}
            className={inputCls}
          />
        </Campo>

        <div className="grid grid-cols-3 gap-3">
          <Campo label="Duração (min)">
            <input
              inputMode="numeric"
              value={form.duracao}
              onChange={(e) => set('duracao', e.target.value)}
              className={inputCls}
            />
          </Campo>
          <Campo label="Vagas">
            <input
              inputMode="numeric"
              value={form.vagas}
              onChange={(e) => set('vagas', e.target.value)}
              className={inputCls}
            />
          </Campo>
          <Campo label="Valor (R$)">
            <input
              inputMode="decimal"
              value={form.valor}
              onChange={(e) => set('valor', e.target.value)}
              className={inputCls}
            />
          </Campo>
        </div>

        <Campo label="Foto (URL)">
          <input
            value={form.foto}
            onChange={(e) => set('foto', e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        </Campo>

        <label className="flex items-center gap-2 font-body text-sm text-sage-700">
          <input
            type="checkbox"
            checked={form.ativa}
            onChange={(e) => set('ativa', e.target.checked)}
            className="h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-400"
          />
          Ativa (aparece no site e para agendamento)
        </label>

        {erro && <p className="rounded-xl bg-rose-50 p-3 font-body text-sm text-rose-700">{erro}</p>}

        <div className="flex justify-end gap-2">
          <Button variante="ghost" onClick={onFechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">{label}</label>
      {children}
    </div>
  )
}
