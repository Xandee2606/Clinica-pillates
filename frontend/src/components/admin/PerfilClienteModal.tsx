import { useEffect, useState } from 'react'
import api from '../../services/api'
import { Modal } from '../ui/Modal'
import { LinkButton } from '../ui/Button'
import { StatusBadge } from './StatusBadge'
import { WhatsAppIcon } from '../ui/icons'
import { linkWhatsApp } from '../../config/clinica'
import { formatarBRL, formatarHora, formatarDataExtenso } from '../../lib/format'
import { ymdLocalDe } from '../../lib/datas'
import type { PerfilCliente } from '../../types'

export function PerfilClienteModal({
  clienteId,
  onFechar,
}: {
  clienteId: string | null
  onFechar: () => void
}) {
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!clienteId) {
      setPerfil(null)
      return
    }
    let cancelado = false
    setCarregando(true)
    api
      .get<PerfilCliente>(`/admin/clientes/${clienteId}`)
      .then((res) => !cancelado && setPerfil(res.data))
      .finally(() => !cancelado && setCarregando(false))
    return () => {
      cancelado = true
    }
  }, [clienteId])

  return (
    <Modal aberto={!!clienteId} onFechar={onFechar} titulo={perfil?.cliente.nome ?? 'Cliente'}>
      {carregando && <div className="h-40 animate-pulse rounded-xl bg-sage-100" />}

      {perfil && (
        <div className="space-y-5">
          {/* Contato */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-body text-sm text-sage-600">
              <p>{perfil.cliente.email}</p>
              <p>{perfil.cliente.telefone}</p>
            </div>
            <LinkButton
              href={linkWhatsApp(perfil.cliente.telefone, `Olá, ${perfil.cliente.nome.split(' ')[0]}!`)}
              target="_blank"
              rel="noopener noreferrer"
              variante="whatsapp"
              tamanho="sm"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </LinkButton>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Estat rotulo="Aulas" valor={String(perfil.estatisticas.totalAgendamentos)} />
            <Estat rotulo="Concluídas" valor={String(perfil.estatisticas.concluidos)} />
            <Estat
              rotulo="Total pago"
              valor={formatarBRL(perfil.estatisticas.totalPago)}
            />
            <Estat
              rotulo="Frequência"
              valor={
                perfil.estatisticas.frequenciaMediaDias != null
                  ? `${perfil.estatisticas.frequenciaMediaDias}d`
                  : '—'
              }
            />
          </div>

          {perfil.estatisticas.ultimaVisita && (
            <p className="font-body text-sm text-sage-500">
              Última visita: {formatarDataExtenso(ymdLocalDe(perfil.estatisticas.ultimaVisita))}
            </p>
          )}

          {/* Histórico */}
          <div>
            <h3 className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-sage-400">
              Histórico de aulas
            </h3>
            {perfil.historico.length === 0 ? (
              <p className="font-body text-sm text-sage-500">Sem agendamentos.</p>
            ) : (
              <ul className="space-y-1.5">
                {perfil.historico.slice(0, 12).map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-lg border border-sage-100 px-3 py-2 font-body text-sm"
                  >
                    <span className="text-sage-700">
                      {ymdLocalDe(h.dataHora).split('-').reverse().join('/')} · {formatarHora(h.dataHora)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-sage-500">{h.modalidade.nome}</span>
                      <StatusBadge status={h.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function Estat({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-sage-100 bg-white p-3 text-center">
      <p className="font-display text-lg font-medium text-sage-900">{valor}</p>
      <p className="font-body text-xs text-sage-500">{rotulo}</p>
    </div>
  )
}
