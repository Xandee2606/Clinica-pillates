import { useLocation, Link } from 'react-router-dom'
import { PublicLayout } from '../components/public/PublicLayout'
import { Card } from '../components/ui/Card'
import { LinkButton } from '../components/ui/Button'
import { CheckIcon, CalendarIcon, WhatsAppIcon, ArrowLeftIcon } from '../components/ui/icons'
import { useClinica } from '../hooks/useClinica'
import { linkWhatsApp } from '../config/clinica'
import { linkGoogleAgenda } from '../lib/calendario'
import { formatarBRL, formatarDuracao, formatarHora, formatarDataExtenso } from '../lib/format'

interface EstadoConfirmacao {
  agendamento: {
    id: string
    dataHora: string
    valorCobrado: number | null
    cliente: { nome: string; email: string }
    modalidade: { nome: string; duracao: number; valor: number }
  }
  modalidadeNome: string
  duracao: number
  data: string
}

export default function Confirmacao() {
  const location = useLocation()
  const estado = location.state as EstadoConfirmacao | null
  const { nome: nomeClinica, whatsapp } = useClinica()

  if (!estado?.agendamento) {
    return (
      <PublicLayout>
        <section className="mx-auto max-w-lg px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-medium text-sage-900">
            Nenhum agendamento encontrado
          </h1>
          <p className="mt-2 font-body text-sage-600">
            Talvez você tenha chegado aqui por engano. Que tal agendar uma aula?
          </p>
          <LinkButton to="/agendamento" className="mt-6">
            Agendar aula
          </LinkButton>
        </section>
      </PublicLayout>
    )
  }

  const { agendamento, data } = estado
  const titulo = `Pilates — ${nomeClinica}`
  const detalhes = `Modalidade: ${agendamento.modalidade.nome}`
  const valor = agendamento.valorCobrado ?? agendamento.modalidade.valor

  return (
    <PublicLayout>
      <section className="mx-auto max-w-lg px-5 py-14">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-100 text-sage-600 animate-fade-up">
            <CheckIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-medium tracking-tight text-sage-900">
            Agendamento confirmado!
          </h1>
          <p className="mt-2 font-body text-sage-600">
            Enviamos os detalhes para <span className="font-medium">{agendamento.cliente.email}</span>.
          </p>
        </div>

        <Card className="mt-8 p-6">
          <p className="font-display text-lg font-medium text-sage-900">
            Olá, {agendamento.cliente.nome.split(' ')[0]}! 🌿
          </p>
          <dl className="mt-4 space-y-3 font-body text-sm">
            <Linha termo="Modalidade" valor={agendamento.modalidade.nome} />
            <Linha termo="Data" valor={formatarDataExtenso(data)} />
            <Linha termo="Horário" valor={formatarHora(agendamento.dataHora)} />
            <Linha termo="Duração" valor={formatarDuracao(agendamento.modalidade.duracao)} />
            <Linha termo="Valor" valor={formatarBRL(valor)} />
          </dl>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <LinkButton
            href={linkGoogleAgenda(titulo, agendamento.dataHora, agendamento.modalidade.duracao, detalhes)}
            target="_blank"
            rel="noopener noreferrer"
            variante="secondary"
          >
            <CalendarIcon className="h-5 w-5" />
            Adicionar ao meu Google Agenda
          </LinkButton>

          <LinkButton
            href={linkWhatsApp(
              whatsapp,
              `Olá! Acabei de agendar uma aula de ${agendamento.modalidade.nome} e gostaria de confirmar.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            variante="whatsapp"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Falar com a clínica no WhatsApp
          </LinkButton>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-body text-sm text-sage-600 hover:text-sage-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar para o início
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}

function Linha({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sage-500">{termo}</dt>
      <dd className="text-right font-medium text-sage-800">{valor}</dd>
    </div>
  )
}
