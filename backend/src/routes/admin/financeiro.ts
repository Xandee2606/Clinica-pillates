import { Router } from 'express'
import { prisma } from '../../lib/prisma'
import { validate } from '../../middleware/validate'
import { listaPagamentosQuerySchema, criarPagamentoSchema } from '../../validators/schemas'

const router = Router()

const DIA_MS = 24 * 60 * 60 * 1000

function diasDoPeriodo(periodo: string | undefined, padrao = 30): number {
  if (!periodo) return padrao
  const num = Number(periodo)
  if (!Number.isNaN(num) && num > 0) return Math.min(Math.floor(num), 365)
  const mapa: Record<string, number> = { semana: 7, mes: 30, trimestre: 90, ano: 365 }
  return mapa[periodo] ?? padrao
}

/**
 * GET /api/admin/financeiro/pagamentos?periodo=30
 * Histórico de pagamentos no período + totais (geral, por tipo, por modalidade).
 */
router.get('/pagamentos', validate(listaPagamentosQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { periodo?: string }
  const dias = diasDoPeriodo(q.periodo, 30)
  const corte = new Date(Date.now() - dias * DIA_MS)

  const pagamentos = await prisma.pagamento.findMany({
    where: { dataPagamento: { gte: corte } },
    orderBy: { dataPagamento: 'desc' },
  })

  // Enriquece com cliente e (quando houver) modalidade via agendamento.
  const clienteIds = [...new Set(pagamentos.map((p) => p.clienteId))]
  const agendamentoIds = pagamentos
    .map((p) => p.agendamentoId)
    .filter((x): x is string => Boolean(x))

  const [clientes, agendamentos] = await Promise.all([
    prisma.cliente.findMany({
      where: { id: { in: clienteIds } },
      select: { id: true, nome: true },
    }),
    prisma.agendamento.findMany({
      where: { id: { in: agendamentoIds } },
      select: { id: true, modalidade: { select: { nome: true } } },
    }),
  ])
  const nomePorCliente = new Map(clientes.map((c) => [c.id, c.nome]))
  const modPorAgendamento = new Map(agendamentos.map((a) => [a.id, a.modalidade.nome]))

  let total = 0
  const porTipo = new Map<string, number>()
  const porModalidade = new Map<string, number>()

  const itens = pagamentos.map((p) => {
    const valor = Number(p.valor)
    if (p.status === 'pago') {
      total += valor
      porTipo.set(p.tipo, (porTipo.get(p.tipo) ?? 0) + valor)
      const mod = p.agendamentoId ? modPorAgendamento.get(p.agendamentoId) : undefined
      const chave = mod ?? 'Sem modalidade'
      porModalidade.set(chave, (porModalidade.get(chave) ?? 0) + valor)
    }
    return {
      id: p.id,
      clienteId: p.clienteId,
      clienteNome: nomePorCliente.get(p.clienteId) ?? '—',
      agendamentoId: p.agendamentoId,
      modalidade: p.agendamentoId ? (modPorAgendamento.get(p.agendamentoId) ?? null) : null,
      valor,
      tipo: p.tipo,
      status: p.status,
      dataPagamento: p.dataPagamento.toISOString(),
      observacoes: p.observacoes,
    }
  })

  res.json({
    periodo: dias,
    total,
    porTipo: [...porTipo.entries()].map(([tipo, valor]) => ({ tipo, valor })),
    porModalidade: [...porModalidade.entries()]
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor),
    pagamentos: itens,
  })
})

/**
 * POST /api/admin/financeiro/pagamentos — registra um pagamento manual.
 */
router.post('/pagamentos', validate(criarPagamentoSchema), async (req, res) => {
  const dados = req.body as {
    clienteId: string
    agendamentoId?: string
    valor: number
    tipo: string
    status?: string
    observacoes?: string
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: dados.clienteId } })
  if (!cliente) {
    return res.status(404).json({ message: 'Cliente não encontrado' })
  }

  if (dados.agendamentoId) {
    const ag = await prisma.agendamento.findUnique({ where: { id: dados.agendamentoId } })
    if (!ag) {
      return res.status(404).json({ message: 'Agendamento não encontrado' })
    }
  }

  const pagamento = await prisma.pagamento.create({
    data: {
      clienteId: dados.clienteId,
      agendamentoId: dados.agendamentoId ?? null,
      valor: dados.valor,
      tipo: dados.tipo,
      status: dados.status ?? 'pago',
      observacoes: dados.observacoes ?? null,
    },
  })

  res.status(201).json({
    id: pagamento.id,
    clienteId: pagamento.clienteId,
    valor: Number(pagamento.valor),
    tipo: pagamento.tipo,
    status: pagamento.status,
    dataPagamento: pagamento.dataPagamento.toISOString(),
  })
})

/**
 * GET /api/admin/financeiro/pendencias
 * Agendamentos concluídos sem nenhum pagamento (status pago) registrado.
 */
router.get('/pendencias', async (_req, res) => {
  const concluidos = await prisma.agendamento.findMany({
    where: { status: 'concluido' },
    orderBy: { dataHora: 'desc' },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      modalidade: { select: { nome: true } },
    },
  })

  const pagos = await prisma.pagamento.findMany({
    where: { agendamentoId: { in: concluidos.map((a) => a.id) }, status: 'pago' },
    select: { agendamentoId: true },
  })
  const pagosSet = new Set(pagos.map((p) => p.agendamentoId))

  const pendencias = concluidos
    .filter((a) => !pagosSet.has(a.id))
    .map((a) => ({
      agendamentoId: a.id,
      dataHora: a.dataHora.toISOString(),
      cliente: a.cliente,
      modalidade: a.modalidade.nome,
      valorCobrado: a.valorCobrado ? Number(a.valorCobrado) : null,
    }))

  const totalPendente = pendencias.reduce((s, p) => s + (p.valorCobrado ?? 0), 0)

  res.json({ total: pendencias.length, totalPendente, pendencias })
})

export default router
