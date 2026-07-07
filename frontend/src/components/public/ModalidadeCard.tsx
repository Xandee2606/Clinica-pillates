import { LinkButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ClockIcon, UsersIcon, LeafIcon, ArrowRightIcon } from '../ui/icons'
import { formatarBRL, formatarDuracao } from '../../lib/format'
import type { Modalidade } from '../../types'

// Gradientes suaves alternados para o "topo" do card (placeholder de foto).
const gradientes = [
  'from-sage-400 to-sage-600',
  'from-clay-400 to-clay-600',
  'from-sage-500 to-sage-700',
]

interface Props {
  modalidade: Modalidade
  index: number
}

export function ModalidadeCard({ modalidade, index }: Props) {
  const gradiente = gradientes[index % gradientes.length]

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md hover:shadow-sage-900/10">
      {/* Foto da modalidade, ou placeholder gradiente quando não houver. */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradiente}`}>
        {modalidade.foto ? (
          <img
            src={modalidade.foto}
            alt={modalidade.nome}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <>
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_75%_25%,white,transparent_50%)]" />
            <LeafIcon className="absolute bottom-4 right-4 h-10 w-10 text-cream-50/40" />
          </>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-body text-sm font-semibold text-sage-800">
          {formatarBRL(modalidade.valor)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-sage-900">{modalidade.nome}</h3>
        {modalidade.descricao && (
          <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-sage-600">
            {modalidade.descricao}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-sm text-sage-600">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-sage-500" />
            {formatarDuracao(modalidade.duracao)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4 text-sage-500" />
            {modalidade.vagas === 1 ? 'Individual' : `Até ${modalidade.vagas} alunos`}
          </span>
        </div>

        <LinkButton
          to={`/agendamento?modalidade=${modalidade.id}`}
          variante="secondary"
          className="mt-6 w-full"
        >
          Agendar esta aula
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </LinkButton>
      </div>
    </Card>
  )
}
