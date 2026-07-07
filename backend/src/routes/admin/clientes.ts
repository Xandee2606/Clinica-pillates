import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { validate } from '../../middleware/validate'
import { listaClientesQuerySchema } from '../../validators/schemas'

const router = Router()

const DIA_MS = 24 * 60 * 60 * 1000
const JANELA_ATIVO_DIAS = 30

/**
 * GET /api/admin/clientes?busca=&filtro=ativas|inativas|todas
 * Lista clientes com última visita e status de atividade.
 */
router.get('/', validate(listaClientesQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { busca?: string; filtro?: 'ativas' | 'inativas' | 'todas' }
  const filtro = q.filtro ?? 'todas'

  const where: Prisma.ClienteWhereInput = {}
  if (q.busca) {
    where.OR = [
      { nome: { contains: q.busca, mode: 'insensitive' } },
      { email: { contains: q.busca, mode: 'insensitive' } },
    ]
  }

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { nome: 'asc' },
    include: {
      agendamentos: {
        where: { status: { not: 'cancelado' } },
        select: { dataHora: true },
        orderBy: { dataHora: 'desc' },
      },
    },
  })

  const agora = Date.now()
  const corteAtivo = agora - JANELA_ATIVO_DIAS * DIA_MS

  const lista = clientes.map((c) => {
    const ultima = c.agendamentos[0]?.dataHora ?? null
    // Ativo = tem agendamento (passado recente ou futuro) na janela.
    const ativo = c.agendamentos.some((a) => a.dataHora.getTime() >= corteAtivo)
    return {
      id: c.id,
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      totalAgendamentos: c.agendamentos.length,
      ultimaVisita: ultima ? ultima.toISOString() : null,
      ativo,
    }
  })

  const filtrada =
    filtro === 'ativas'
      ? lista.filter((c) => c.ativo)
      : filtro === 'inativas'
        ? lista.filter((c) => !c.ativo)
        : lista

  res.json({ filtro, total: filtrada.length, clientes: filtrada })
})

/**
 * GET /api/admin/clientes/:id — perfil detalhado do cliente.
 */
router.get('/:id', async (req, res) => {
  const id = String(req.params.id)

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      agendamentos: {
        orderBy: { dataHora: 'desc' },
        include: { modalidade: { select: { id: true, nome: true } } },
      },
    },
  })

  if (!cliente) {
    return res.status(404).json({ message: 'Cliente não encontrado' })
  }

  const pagamentos = await prisma.pagamento.findMany({
    where: { clienteId: id },
    orderBy: { dataPagamento: 'desc' },
  })

  const agora = Date.now()
  const naoCancelados = cliente.agendamentos.filter((a) => a.status !== 'cancelado')
  const passados = naoCancelados
    .filter((a) => a.dataHora.getTime() < agora)
    .sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime())

  const concluidos = cliente.agendamentos.filter((a) => a.status === 'concluido')
  const faltas = cliente.agendamentos.filter((a) => a.status === 'falta').length
  const cancelados = cliente.agendamentos.filter((a) => a.status === 'cancelado').length

  const ultimaVisita = passados.length ? passados[passados.length - 1].dataHora.toISOString() : null

  let frequenciaMediaDias: number | null = null
  if (passados.length >= 2) {
    const total = passados[passados.length - 1].dataHora.getTime() - passados[0].dataHora.getTime()
    frequenciaMediaDias = Math.round(total / DIA_MS / (passados.length - 1))
  }

  const totalPago = pagamentos
    .filter((p) => p.status === 'pago')
    .reduce((s, p) => s + Number(p.valor), 0)

  const totalEmAulas = concluidos.reduce((s, a) => s + Number(a.valorCobrado ?? 0), 0)

  res.json({
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      dataNasc: cliente.dataNasc,
      observacoes: cliente.observacoes,
      criadoEm: cliente.criadoEm,
    },
    estatisticas: {
      totalAgendamentos: naoCancelados.length,
      concluidos: concluidos.length,
      faltas,
      cancelados,
      ultimaVisita,
      frequenciaMediaDias,
      totalPago,
      totalEmAulas,
    },
    historico: cliente.agendamentos.map((a) => ({
      id: a.id,
      dataHora: a.dataHora.toISOString(),
      status: a.status,
      valorCobrado: a.valorCobrado ? Number(a.valorCobrado) : null,
      modalidade: a.modalidade,
    })),
    pagamentos: pagamentos.map((p) => ({
      id: p.id,
      valor: Number(p.valor),
      tipo: p.tipo,
      status: p.status,
      dataPagamento: p.dataPagamento.toISOString(),
      observacoes: p.observacoes,
    })),
  })
})

export default router
