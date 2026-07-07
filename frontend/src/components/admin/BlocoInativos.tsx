import { useApi } from '../../hooks/useApi'
import { Card } from '../ui/Card'
import { LinkButton } from '../ui/Button'
import { WhatsAppIcon } from '../ui/icons'
import { linkWhatsApp } from '../../config/clinica'
import { formatarDataExtenso } from '../../lib/format'
import { ymdLocalDe } from '../../lib/datas'
import type { InativosResposta, ClienteInativo } from '../../types'

export function BlocoInativos() {
  const { data, loading, error } = useApi<InativosResposta>('/admin/dashboard/inativos')

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-medium text-sage-900">Clientes que sumiram</h2>
        {data && data.total > 0 && (
          <span className="font-body text-sm text-sage-400">{data.total}</span>
        )}
      </div>
      <p className="mt-1 font-body text-sm text-sage-500">
        Agendavam com frequência e não voltam há mais de {data?.dias ?? 15} dias.
      </p>

      <div className="mt-4">
        {loading && (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-sage-50" />
            ))}
          </div>
        )}

        {error && <p className="font-body text-sm text-rose-600">{error}</p>}

        {data && data.total === 0 && (
          <p className="rounded-xl bg-cream-100 p-6 text-center font-body text-sm text-sage-600">
            Ninguém sumiu por aqui. Todas as clientes estão em dia! 💚
          </p>
        )}

        {data && data.total > 0 && (
          <ul className="space-y-3">
            {data.clientes.map((c) => (
              <InativoLinha key={c.id} cliente={c} />
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

function InativoLinha({ cliente }: { cliente: ClienteInativo }) {
  const primeiroNome = cliente.nome.split(' ')[0]
  const mensagem = `Oi ${primeiroNome}, sentimos sua falta! 🌿`

  return (
    <li className="rounded-xl border border-sage-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-body font-medium text-sage-900">{cliente.nome}</p>
          <p className="mt-0.5 font-body text-sm text-sage-500">
            Última visita: {formatarDataExtenso(ymdLocalDe(cliente.ultimoAgendamento))}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-body text-xs text-sage-400">
            <span>há {cliente.diasSemVir} dias</span>
            <span>·</span>
            <span>{cliente.totalAgendamentos} aulas</span>
            <span>·</span>
            <span>vinha a cada ~{cliente.frequenciaMediaDias} dias</span>
          </div>
        </div>
      </div>
      <LinkButton
        href={linkWhatsApp(cliente.telefone, mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        variante="whatsapp"
        tamanho="sm"
        className="mt-3 w-full"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Chamar no WhatsApp
      </LinkButton>
    </li>
  )
}
