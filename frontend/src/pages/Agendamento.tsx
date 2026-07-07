import { forwardRef, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AxiosError } from 'axios'

import { PublicLayout } from '../components/public/PublicLayout'
import { Stepper } from '../components/public/Stepper'
import { Calendar } from '../components/public/Calendar'
import { Button, LinkButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, UsersIcon, CheckIcon } from '../components/ui/icons'
import { useApi } from '../hooks/useApi'
import { useClinica } from '../hooks/useClinica'
import api from '../services/api'
import { formatarBRL, formatarDuracao, formatarHora, formatarDataExtenso } from '../lib/format'
import { linkGoogleAgenda } from '../lib/calendario'
import { clienteFormSchema, type ClienteForm } from '../validators/agendamento'
import type { Modalidade } from '../types'

interface Horario {
  hora: string
  dataHora: string
  vagasDisponiveis: number
}

export default function Agendamento() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: modalidades, loading: loadingMod } = useApi<Modalidade[]>('/modalidades')
  const { nome: nomeClinica } = useClinica()

  const [passo, setPasso] = useState(1)
  const [modalidadeId, setModalidadeId] = useState<string | null>(null)
  const [data, setData] = useState<string | null>(null)
  const [horario, setHorario] = useState<Horario | null>(null)
  const [dadosCliente, setDadosCliente] = useState<ClienteForm | null>(null)

  const [horarios, setHorarios] = useState<Horario[] | null>(null)
  const [loadingHorarios, setLoadingHorarios] = useState(false)

  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

  const modalidade = useMemo(
    () => modalidades?.find((m) => m.id === modalidadeId) ?? null,
    [modalidades, modalidadeId],
  )

  // Pré-seleção via ?modalidade=ID
  useEffect(() => {
    const pre = searchParams.get('modalidade')
    if (pre && modalidades?.some((m) => m.id === pre)) {
      setModalidadeId(pre)
    }
  }, [searchParams, modalidades])

  // Carrega horários quando data/modalidade mudam.
  useEffect(() => {
    if (!modalidadeId || !data) {
      setHorarios(null)
      return
    }
    let cancelado = false
    setLoadingHorarios(true)
    setHorario(null)
    api
      .get<{ horarios: Horario[] }>('/agendamentos/horarios-livres', {
        params: { modalidadeId, data },
      })
      .then((res) => {
        if (!cancelado) setHorarios(res.data.horarios)
      })
      .catch(() => {
        if (!cancelado) setHorarios([])
      })
      .finally(() => {
        if (!cancelado) setLoadingHorarios(false)
      })
    return () => {
      cancelado = true
    }
  }, [modalidadeId, data])

  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: dadosCliente ?? undefined,
  })

  function irPara(p: number) {
    setPasso(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onSubmitDados(valores: ClienteForm) {
    setDadosCliente(valores)
    irPara(4)
  }

  async function confirmar() {
    if (!modalidade || !horario || !dadosCliente) return

    // Abre uma aba em branco AINDA no gesto do clique (antes do await), para
    // que o navegador não bloqueie como popup. Após o sucesso, redirecionamos
    // essa aba para o Google Agenda do cliente; em caso de falha, fechamos.
    const janelaAgenda = window.open('', '_blank')

    setEnviando(true)
    setErroEnvio(null)
    try {
      const { data: criado } = await api.post('/agendamentos', {
        modalidadeId: modalidade.id,
        dataHora: horario.dataHora,
        cliente: {
          nome: dadosCliente.nome,
          email: dadosCliente.email,
          telefone: dadosCliente.telefone,
        },
        observacoes: dadosCliente.observacoes || undefined,
      })

      // Já leva o cliente para a tela "adicionar evento" do Google Agenda dele.
      const urlAgenda = linkGoogleAgenda(
        `Pilates — ${nomeClinica}`,
        horario.dataHora,
        modalidade.duracao,
        `Modalidade: ${modalidade.nome}`,
      )
      if (janelaAgenda) janelaAgenda.location.href = urlAgenda

      navigate('/confirmacao', {
        state: {
          agendamento: criado,
          modalidadeNome: modalidade.nome,
          duracao: modalidade.duracao,
          data,
        },
      })
    } catch (err) {
      janelaAgenda?.close()
      const msg = (err as AxiosError<{ message?: string }>).response?.data?.message
      setErroEnvio(msg ?? 'Não foi possível concluir o agendamento. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium tracking-tight text-sage-900 sm:text-4xl">
            Agende sua aula
          </h1>
          <p className="mt-2 font-body text-sage-600">
            Leva menos de um minuto. Você recebe a confirmação por e-mail.
          </p>
        </div>

        <div className="mt-10">
          <Stepper passoAtual={passo} />
        </div>

        <div className="mt-10">
          {/* PASSO 1 — Modalidade */}
          {passo === 1 && (
            <div>
              {loadingMod && <p className="font-body text-sage-500">Carregando modalidades...</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                {modalidades?.map((m) => {
                  const sel = m.id === modalidadeId
                  return (
                    <button
                      key={m.id}
                      onClick={() => setModalidadeId(m.id)}
                      className={`rounded-2xl border-2 p-5 text-left transition-all ${
                        sel
                          ? 'border-sage-600 bg-sage-50/60 shadow-sm'
                          : 'border-sage-100 bg-white hover:border-sage-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-medium text-sage-900">{m.nome}</h3>
                        <span
                          className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                            sel ? 'border-sage-600 bg-sage-600' : 'border-sage-300'
                          }`}
                        >
                          {sel && <CheckIcon className="h-3 w-3 text-cream-50" />}
                        </span>
                      </div>
                      {m.descricao && (
                        <p className="mt-1 font-body text-sm text-sage-600">{m.descricao}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-sage-600">
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4 text-sage-500" />
                          {formatarDuracao(m.duracao)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <UsersIcon className="h-4 w-4 text-sage-500" />
                          {m.vagas === 1 ? 'Individual' : `Até ${m.vagas}`}
                        </span>
                        <span className="font-semibold text-sage-800">{formatarBRL(m.valor)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <LinkButton to="/" variante="ghost">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Início
                </LinkButton>
                <Button onClick={() => irPara(2)} disabled={!modalidadeId}>
                  Continuar
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 2 — Data e horário */}
          {passo === 2 && (
            <div>
              <div className="grid gap-6 md:grid-cols-2">
                <Calendar selecionada={data} onSelecionar={setData} />

                <div>
                  <h3 className="font-display text-lg font-medium text-sage-900">
                    {data ? formatarDataExtenso(data) : 'Escolha uma data'}
                  </h3>
                  <div className="mt-4">
                    {!data && (
                      <p className="font-body text-sm text-sage-500">
                        Selecione um dia no calendário para ver os horários livres.
                      </p>
                    )}
                    {data && loadingHorarios && (
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-11 animate-pulse rounded-lg bg-sage-100" />
                        ))}
                      </div>
                    )}
                    {data && !loadingHorarios && horarios && horarios.length === 0 && (
                      <p className="rounded-xl bg-cream-100 p-4 font-body text-sm text-sage-600">
                        Nenhum horário disponível nesse dia. Tente outra data. 🌿
                      </p>
                    )}
                    {data && !loadingHorarios && horarios && horarios.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {horarios.map((h) => {
                          const sel = horario?.dataHora === h.dataHora
                          return (
                            <button
                              key={h.dataHora}
                              onClick={() => setHorario(h)}
                              className={`rounded-lg border py-2.5 font-body text-sm font-medium transition-colors ${
                                sel
                                  ? 'border-sage-600 bg-sage-600 text-cream-50'
                                  : 'border-sage-200 bg-white text-sage-700 hover:border-sage-400'
                              }`}
                            >
                              {formatarHora(h.dataHora)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variante="ghost" onClick={() => irPara(1)}>
                  <ArrowLeftIcon className="h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={() => irPara(3)} disabled={!horario}>
                  Continuar
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 3 — Dados pessoais */}
          {passo === 3 && (
            <form onSubmit={form.handleSubmit(onSubmitDados)} className="mx-auto max-w-lg">
              <div className="space-y-4">
                <Campo
                  label="Nome completo"
                  erro={form.formState.errors.nome?.message}
                  {...form.register('nome')}
                />
                <Campo
                  label="E-mail"
                  type="email"
                  erro={form.formState.errors.email?.message}
                  {...form.register('email')}
                />
                <Campo
                  label="Telefone / WhatsApp"
                  placeholder="(11) 99999-8888"
                  erro={form.formState.errors.telefone?.message}
                  {...form.register('telefone')}
                />
                <div>
                  <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">
                    Observações <span className="text-sage-400">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    {...form.register('observacoes')}
                    className="w-full rounded-xl border border-sage-200 bg-white px-4 py-2.5 font-body text-sage-800 outline-none transition-colors focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                    placeholder="Alguma preferência ou informação importante?"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button type="button" variante="ghost" onClick={() => irPara(2)}>
                  <ArrowLeftIcon className="h-4 w-4" />
                  Voltar
                </Button>
                <Button type="submit">
                  Revisar
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* PASSO 4 — Confirmação */}
          {passo === 4 && modalidade && horario && data && dadosCliente && (
            <div className="mx-auto max-w-lg">
              <Card className="p-6">
                <h3 className="font-display text-xl font-medium text-sage-900">
                  Confira seu agendamento
                </h3>
                <dl className="mt-5 space-y-3 font-body text-sm">
                  <Resumo termo="Modalidade" valor={modalidade.nome} />
                  <Resumo termo="Data" valor={formatarDataExtenso(data)} />
                  <Resumo termo="Horário" valor={formatarHora(horario.dataHora)} />
                  <Resumo termo="Duração" valor={formatarDuracao(modalidade.duracao)} />
                  <Resumo termo="Valor" valor={formatarBRL(modalidade.valor)} />
                  <div className="my-3 border-t border-sage-100" />
                  <Resumo termo="Nome" valor={dadosCliente.nome} />
                  <Resumo termo="E-mail" valor={dadosCliente.email} />
                  <Resumo termo="Telefone" valor={dadosCliente.telefone} />
                </dl>
              </Card>

              {erroEnvio && (
                <p className="mt-4 rounded-xl bg-rose-50 p-3 font-body text-sm text-rose-700">
                  {erroEnvio}
                </p>
              )}

              <div className="mt-8 flex justify-between">
                <Button variante="ghost" onClick={() => irPara(3)} disabled={enviando}>
                  <ArrowLeftIcon className="h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={confirmar} disabled={enviando}>
                  {enviando ? 'Confirmando...' : 'Confirmar agendamento'}
                  {!enviando && <CheckIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

function Resumo({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sage-500">{termo}</dt>
      <dd className="text-right font-medium text-sage-800">{valor}</dd>
    </div>
  )
}

interface CampoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
}

const Campo = forwardRef<HTMLInputElement, CampoProps>(({ label, erro, ...props }, ref) => (
  <div>
    <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">{label}</label>
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-xl border bg-white px-4 py-2.5 font-body text-sage-800 outline-none transition-colors focus:ring-2 ${
        erro
          ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
          : 'border-sage-200 focus:border-sage-500 focus:ring-sage-200'
      }`}
    />
    {erro && <p className="mt-1 font-body text-xs text-rose-600">{erro}</p>}
  </div>
))
Campo.displayName = 'Campo'
