import { useCallback, useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import api from '../../services/api'
import { PageHeader } from '../../components/admin/PageHeader'
import { ModalidadeFormModal } from '../../components/admin/ModalidadeFormModal'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatarBRL, formatarDuracao } from '../../lib/format'
import type { Modalidade, HorarioFuncionamento, ConfiguracaoClinica } from '../../types'

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const inputCls =
  'rounded-lg border border-sage-200 bg-white px-2.5 py-1.5 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200'

interface LinhaFunc {
  diaSemana: number
  horaInicio: string
  horaFim: string
  ativo: boolean
}

export default function Configuracoes() {
  const [modalidades, setModalidades] = useState<Modalidade[]>([])
  const [funcionamento, setFuncionamento] = useState<LinhaFunc[]>([])
  const [config, setConfig] = useState<ConfiguracaoClinica | null>(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Modalidade | null>(null)

  const [salvandoFunc, setSalvandoFunc] = useState(false)
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const [mods, func, cfg] = await Promise.all([
      api.get<Modalidade[]>('/admin/modalidades'),
      api.get<HorarioFuncionamento[]>('/admin/configuracoes/funcionamento'),
      api.get<ConfiguracaoClinica>('/admin/configuracoes'),
    ])
    setModalidades(mods.data)
    // Monta as 7 linhas, preenchendo dias faltantes com padrão inativo.
    const porDia = new Map(func.data.map((f) => [f.diaSemana, f]))
    setFuncionamento(
      DIAS.map((_, dia) => {
        const f = porDia.get(dia)
        return {
          diaSemana: dia,
          horaInicio: f?.horaInicio ?? '08:00',
          horaFim: f?.horaFim ?? '18:00',
          ativo: f ? f.ativo : false,
        }
      }),
    )
    setConfig(cfg.data)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  function setFunc(dia: number, campo: keyof LinhaFunc, valor: string | boolean) {
    setFuncionamento((prev) =>
      prev.map((l) => (l.diaSemana === dia ? { ...l, [campo]: valor } : l)),
    )
  }

  async function salvarFuncionamento() {
    setSalvandoFunc(true)
    setAviso(null)
    try {
      const horarios = funcionamento.filter((l) => l.ativo)
      await api.put('/admin/configuracoes/funcionamento', { horarios })
      setAviso('Horários salvos!')
    } catch (err) {
      setAviso(
        (err as AxiosError<{ message?: string }>).response?.data?.message ??
          'Erro ao salvar horários.',
      )
    } finally {
      setSalvandoFunc(false)
    }
  }

  async function salvarConfig() {
    if (!config) return
    setSalvandoConfig(true)
    setAviso(null)
    try {
      await api.put('/admin/configuracoes', {
        nome: config.nome,
        endereco: config.endereco || null,
        whatsapp: config.whatsapp || null,
        instagram: config.instagram || null,
      })
      setAviso('Dados da clínica salvos!')
    } catch (err) {
      setAviso(
        (err as AxiosError<{ message?: string }>).response?.data?.message ??
          'Erro ao salvar dados.',
      )
    } finally {
      setSalvandoConfig(false)
    }
  }

  return (
    <div>
      <PageHeader titulo="Configurações" descricao="Modalidades, horários e dados da clínica." />

      {aviso && (
        <p className="mb-4 rounded-xl bg-sage-100 p-3 font-body text-sm text-sage-700">{aviso}</p>
      )}

      {/* Modalidades */}
      <Card className="mb-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-sage-900">Modalidades</h2>
          <Button
            tamanho="sm"
            onClick={() => {
              setEditando(null)
              setModalAberto(true)
            }}
          >
            Nova modalidade
          </Button>
        </div>

        <ul className="mt-4 divide-y divide-sage-100">
          {modalidades.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-body font-medium text-sage-900">{m.nome}</p>
                  {!m.ativa && <Badge tom="neutral">Inativa</Badge>}
                </div>
                <p className="font-body text-sm text-sage-500">
                  {formatarDuracao(m.duracao)} · {m.vagas} vaga(s) · {formatarBRL(m.valor)}
                </p>
              </div>
              <Button
                variante="secondary"
                tamanho="sm"
                onClick={() => {
                  setEditando(m)
                  setModalAberto(true)
                }}
              >
                Editar
              </Button>
            </li>
          ))}
          {modalidades.length === 0 && (
            <p className="py-4 font-body text-sm text-sage-500">Nenhuma modalidade cadastrada.</p>
          )}
        </ul>
      </Card>

      {/* Horários de funcionamento */}
      <Card className="mb-5 p-5">
        <h2 className="font-display text-lg font-medium text-sage-900">Horários de funcionamento</h2>
        <p className="mt-1 font-body text-sm text-sage-500">
          Dias e faixas em que a clínica aceita agendamentos.
        </p>

        <div className="mt-4 space-y-2">
          {funcionamento.map((l) => (
            <div
              key={l.diaSemana}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-sage-100 px-3 py-2"
            >
              <label className="flex w-32 items-center gap-2 font-body text-sm text-sage-700">
                <input
                  type="checkbox"
                  checked={l.ativo}
                  onChange={(e) => setFunc(l.diaSemana, 'ativo', e.target.checked)}
                  className="h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-400"
                />
                {DIAS[l.diaSemana]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={l.horaInicio}
                  disabled={!l.ativo}
                  onChange={(e) => setFunc(l.diaSemana, 'horaInicio', e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
                <span className="text-sage-400">às</span>
                <input
                  type="time"
                  value={l.horaFim}
                  disabled={!l.ativo}
                  onChange={(e) => setFunc(l.diaSemana, 'horaFim', e.target.value)}
                  className={`${inputCls} disabled:opacity-40`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={salvarFuncionamento} disabled={salvandoFunc}>
            {salvandoFunc ? 'Salvando...' : 'Salvar horários'}
          </Button>
        </div>
      </Card>

      {/* Dados da clínica */}
      {config && (
        <Card className="p-5">
          <h2 className="font-display text-lg font-medium text-sage-900">Dados da clínica</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CampoConfig
              label="Nome"
              valor={config.nome}
              onChange={(v) => setConfig({ ...config, nome: v })}
            />
            <CampoConfig
              label="WhatsApp (só números, com DDI)"
              valor={config.whatsapp ?? ''}
              placeholder="5511999998888"
              onChange={(v) => setConfig({ ...config, whatsapp: v })}
            />
            <CampoConfig
              label="Instagram (@)"
              valor={config.instagram ?? ''}
              placeholder="nomedaclinica"
              onChange={(v) => setConfig({ ...config, instagram: v })}
            />
            <CampoConfig
              label="Endereço"
              valor={config.endereco ?? ''}
              onChange={(v) => setConfig({ ...config, endereco: v })}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={salvarConfig} disabled={salvandoConfig}>
              {salvandoConfig ? 'Salvando...' : 'Salvar dados'}
            </Button>
          </div>
        </Card>
      )}

      <ModalidadeFormModal
        aberto={modalAberto}
        modalidade={editando}
        onFechar={() => setModalAberto(false)}
        onSucesso={carregar}
      />
    </div>
  )
}

function CampoConfig({
  label,
  valor,
  placeholder,
  onChange,
}: {
  label: string
  valor: string
  placeholder?: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">{label}</label>
      <input
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-sage-200 bg-white px-3 py-2 font-body text-sm text-sage-800 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
      />
    </div>
  )
}
