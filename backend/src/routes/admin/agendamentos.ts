import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { validate } from '../../middleware/validate'
import { listaAgendamentosQuerySchema, statusAgendamentoSchema } from '../../validators/schemas'
import { inicioDoDia, adicionarDias, instanteParaDataLocal } from '../../lib/horarios'
import { cancelarEventoCalendar } from '../../services/googleCalendar'

const router = Router()

const POR_PAGINA = 20

/**
 * GET /api/admin/agendamentos?page=1&status=&data=&modalidadeId=&busca=
 * Lista paginada com filtros (data, status, modalidade, busca por cliente).
 */
router.get('/', validate(listaAgendamentosQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as {
    page?: number
    status?: string
    data?: string
    modalidadeId?: string
    busca?: string
  }
  const page = q.page ?? 1

  const where: Prisma.AgendamentoWhereInput = {}
  if (q.status) where.status = q.status
  if (q.modalidadeId) where.modalidadeId = q.modalidadeId
  if (q.data) {
    where.dataHora = { gte: inicioDoDia(q.data), lt: inicioDoDia(adicionarDias(q.data, 1)) }
  }
  if (q.busca) {
    where.cliente = {
      OR: [
        { nome: { contains: q.busca, mode: 'insensitive' } },
        { email: { contains: q.busca, mode: 'insensitive' } },
      ],
    }
  }

  const [total, agendamentos] = await Promise.all([
    prisma.agendamento.count({ where }),
    prisma.agendamento.findMany({
      where,
      orderBy: { dataHora: 'desc' },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: {
        cliente: { select: { id: true, nome: true, telefone: true, email: true } },
        modalidade: { select: { id: true, nome: true } },
      },
    }),
  ])

  res.json({
    page,
    porPagina: POR_PAGINA,
    total,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
    agendamentos: agendamentos.map((a) => ({
      id: a.id,
      dataHora: a.dataHora.toISOString(),
      status: a.status,
      valorCobrado: a.valorCobrado ? Number(a.valorCobrado) : null,
      observacoes: a.observacoes,
      cliente: a.cliente,
      modalidade: a.modalidade,
    })),
  })
})

/**
 * GET /api/admin/agendamentos/exportar — CSV dos últimos 30 dias.
 */
router.get('/exportar', async (_req, res) => {
  const fim = new Date()
  const inicio = new Date(fim.getTime() - 30 * 24 * 60 * 60 * 1000)

  const agendamentos = await prisma.agendamento.findMany({
    where: { dataHora: { gte: inicio, lte: fim } },
    orderBy: { dataHora: 'desc' },
    include: {
      cliente: { select: { nome: true, telefone: true, email: true } },
      modalidade: { select: { nome: true } },
    },
  })

  const escapar = (v: string | number | null) => {
    const s = String(v ?? '')
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const linhas = [
    ['Data', 'Hora', 'Cliente', 'Telefone', 'E-mail', 'Modalidade', 'Status', 'Valor'].join(';'),
  ]
  for (const a of agendamentos) {
    const local = new Date(a.dataHora.getTime() - 3 * 60 * 60 * 1000)
    const data = instanteParaDataLocal(a.dataHora).split('-').reverse().join('/')
    const hora = `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`
    linhas.push(
      [
        data,
        hora,
        escapar(a.cliente.nome),
        escapar(a.cliente.telefone),
        escapar(a.cliente.email),
        escapar(a.modalidade.nome),
        a.status,
        a.valorCobrado ? Number(a.valorCobrado).toFixed(2) : '',
      ].join(';'),
    )
  }

  const csv = '﻿' + linhas.join('\n') // BOM para acentos no Excel
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="agendamentos.csv"')
  res.send(csv)
})

/**
 * PATCH /api/admin/agendamentos/:id/status — cancelar/concluir/marcar falta.
 */
router.patch('/:id/status', validate(statusAgendamentoSchema), async (req, res) => {
  const id = String(req.params.id)
  const { status } = req.body as { status: string }

  const existente = await prisma.agendamento.findUnique({ where: { id } })
  if (!existente) {
    return res.status(404).json({ message: 'Agendamento não encontrado' })
  }

  // Ao cancelar, remove o evento do Google Calendar (best-effort).
  if (status === 'cancelado' && existente.googleEventId) {
    try {
      await cancelarEventoCalendar(existente.googleEventId)
    } catch (calErr) {
      console.error('Falha ao cancelar evento no Google Calendar:', calErr)
    }
  }

  const atualizado = await prisma.agendamento.update({
    where: { id },
    data: {
      status,
      // Limpa a referência ao evento quando cancelado.
      ...(status === 'cancelado' ? { googleEventId: null } : {}),
    },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true, email: true } },
      modalidade: { select: { id: true, nome: true } },
    },
  })

  res.json({
    id: atualizado.id,
    dataHora: atualizado.dataHora.toISOString(),
    status: atualizado.status,
    valorCobrado: atualizado.valorCobrado ? Number(atualizado.valorCobrado) : null,
    cliente: atualizado.cliente,
    modalidade: atualizado.modalidade,
  })
})

export default router
