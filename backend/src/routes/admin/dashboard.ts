import { Router } from 'express'
import { prisma } from '../../lib/prisma'
import { validate } from '../../middleware/validate'
import {
  agendaQuerySchema,
  inativosQuerySchema,
  periodoQuerySchema,
  historicoQuerySchema,
} from '../../validators/schemas'
import {
  hojeClinicaYMD,
  inicioDoDia,
  adicionarDias,
  diaSemanaDe,
  segundaDaSemana,
  partesLocais,
  instanteParaDataLocal,
} from '../../lib/horarios'

const router = Router()

const DIA_MS = 24 * 60 * 60 * 1000

/** Converte um `periodo` (número de dias ou palavra-chave) em nº de dias. */
function diasDoPeriodo(periodo: string | undefined, padrao = 30): number {
  if (!periodo) return padrao
  const num = Number(periodo)
  if (!Number.isNaN(num) && num > 0) return Math.min(Math.floor(num), 365)
  const mapa: Record<string, number> = { semana: 7, mes: 30, trimestre: 90 }
  return mapa[periodo] ?? padrao
}

// =====================================================================
// Bloco 2 — Agenda do dia / próximos dias
// =====================================================================
router.get('/agenda', validate(agendaQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { data?: string; dias?: number }
  const data = q.data ?? hojeClinicaYMD()
  const dias = q.dias ?? 1

  const inicio = inicioDoDia(data)
  const fim = inicioDoDia(adicionarDias(data, dias))

  const agendamentos = await prisma.agendamento.findMany({
    where: { dataHora: { gte: inicio, lt: fim } },
    orderBy: { dataHora: 'asc' },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true } },
      modalidade: { select: { id: true, nome: true, duracao: true } },
    },
  })

  res.json({
    data,
    dias,
    total: agendamentos.length,
    agendamentos: agendamentos.map((a) => ({
      id: a.id,
      dataHora: a.dataHora.toISOString(),
      status: a.status,
      observacoes: a.observacoes,
      cliente: a.cliente,
      modalidade: a.modalidade,
    })),
  })
})

// =====================================================================
// Bloco 3 — Clientes inativos
// =====================================================================
router.get('/inativos', validate(inativosQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { dias?: number }
  const dias = q.dias ?? 15

  const agora = new Date()
  const corte = new Date(agora.getTime() - dias * DIA_MS)

  const clientes = await prisma.cliente.findMany({
    include: {
      agendamentos: {
        where: { status: { not: 'cancelado' } },
        select: { dataHora: true },
        orderBy: { dataHora: 'asc' },
      },
    },
  })

  const inativos = clientes
    .map((c) => {
      const passados = c.agendamentos.filter((a) => a.dataHora < agora)
      const temFuturo = c.agendamentos.some((a) => a.dataHora >= agora)

      if (temFuturo) return null
      if (passados.length < 2) return null

      const ultimo = passados[passados.length - 1].dataHora
      if (ultimo >= corte) return null

      const primeiro = passados[0].dataHora
      const intervaloTotalDias = (ultimo.getTime() - primeiro.getTime()) / DIA_MS
      const frequenciaMediaDias = Math.round(intervaloTotalDias / (passados.length - 1))
      const diasSemVir = Math.floor((agora.getTime() - ultimo.getTime()) / DIA_MS)

      return {
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        ultimoAgendamento: ultimo.toISOString(),
        diasSemVir,
        totalAgendamentos: passados.length,
        frequenciaMediaDias,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.diasSemVir - a.diasSemVir)

  res.json({ dias, total: inativos.length, clientes: inativos })
})

// =====================================================================
// Bloco 1 — Cards de resumo rápido
// =====================================================================
router.get('/resumo', async (_req, res) => {
  const hoje = hojeClinicaYMD()
  const agora = new Date()

  const inicioHoje = inicioDoDia(hoje)
  const fimHoje = inicioDoDia(adicionarDias(hoje, 1))

  const segunda = segundaDaSemana(hoje)
  const proximaSegunda = adicionarDias(segunda, 7)

  const inicioMes = inicioDoDia(`${hoje.slice(0, 7)}-01`)
  const corte30 = new Date(agora.getTime() - 30 * DIA_MS)

  const [agendamentosHoje, agendamentosSemana, ativos, receita] = await Promise.all([
    prisma.agendamento.count({
      where: { dataHora: { gte: inicioHoje, lt: fimHoje }, status: { not: 'cancelado' } },
    }),
    prisma.agendamento.count({
      where: {
        dataHora: { gte: inicioDoDia(segunda), lt: inicioDoDia(proximaSegunda) },
        status: { not: 'cancelado' },
      },
    }),
    prisma.agendamento.findMany({
      where: { status: { not: 'cancelado' }, dataHora: { gte: corte30 } },
      select: { clienteId: true },
      distinct: ['clienteId'],
    }),
    prisma.agendamento.aggregate({
      _sum: { valorCobrado: true },
      where: { status: 'concluido', dataHora: { gte: inicioMes } },
    }),
  ])

  res.json({
    agendamentosHoje,
    agendamentosSemana,
    clientesAtivos: ativos.length,
    receitaMes: Number(receita._sum.valorCobrado ?? 0),
  })
})

// =====================================================================
// Bloco 4 — Horários vagos da semana atual
// =====================================================================
// Capacidade por hora = soma das vagas das modalidades ativas (capacidade
// teórica do estúdio numa hora). Ocupação = confirmados na hora / capacidade.
// Ajustável: os limiares de cor são um heurístico.
router.get('/horarios-vagos', async (_req, res) => {
  const hoje = hojeClinicaYMD()
  const segunda = segundaDaSemana(hoje)
  const fimSemana = adicionarDias(segunda, 7)

  const [modalidades, funcionamentos, confirmados] = await Promise.all([
    prisma.modalidade.findMany({ where: { ativa: true }, select: { vagas: true } }),
    prisma.horarioFuncionamento.findMany({ where: { ativo: true } }),
    prisma.agendamento.findMany({
      where: {
        status: 'confirmado',
        dataHora: { gte: inicioDoDia(segunda), lt: inicioDoDia(fimSemana) },
      },
      select: { dataHora: true },
    }),
  ])

  const capacidadeHora = modalidades.reduce((s, m) => s + m.vagas, 0) || 1

  const funcMap = new Map(funcionamentos.map((f) => [f.diaSemana, f]))
  const horaDe = (hhmm: string) => Number(hhmm.split(':')[0])

  let minHora = 23
  let maxHora = 0
  for (const f of funcionamentos) {
    minHora = Math.min(minHora, horaDe(f.horaInicio))
    maxHora = Math.max(maxHora, horaDe(f.horaFim))
  }
  if (minHora > maxHora) {
    minHora = 7
    maxHora = 20
  }
  const horas: number[] = []
  for (let h = minHora; h < maxHora; h++) horas.push(h)

  // Contagem de confirmados por (dia local, hora local).
  const contagem = new Map<string, number>()
  for (const a of confirmados) {
    const { ymd, hora } = partesLocais(a.dataHora)
    const key = `${ymd}-${hora}`
    contagem.set(key, (contagem.get(key) ?? 0) + 1)
  }

  const dias = []
  for (let i = 0; i < 7; i++) {
    const dataDia = adicionarDias(segunda, i)
    const wd = diaSemanaDe(dataDia)
    const func = funcMap.get(wd)
    if (!func) continue // pula dias fechados (ex.: domingo)

    const iniH = horaDe(func.horaInicio)
    const fimH = horaDe(func.horaFim)

    const celulas = horas.map((h) => {
      const aberto = h >= iniH && h < fimH
      const bookings = contagem.get(`${dataDia}-${h}`) ?? 0
      const percentual = aberto ? Math.round((bookings / capacidadeHora) * 100) : 0
      let status: 'fechado' | 'vago' | 'parcial' | 'ocupado' = 'fechado'
      if (aberto) {
        if (bookings === 0) status = 'vago'
        else if (percentual >= 60) status = 'ocupado'
        else status = 'parcial'
      }
      return { hora: h, aberto, bookings, percentual, status }
    })

    dias.push({ data: dataDia, diaSemana: wd, celulas })
  }

  res.json({ semanaInicio: segunda, capacidadeHora, horas, dias })
})

// =====================================================================
// Bloco 5 — Heatmap de ocupação histórica (dia da semana × hora)
// =====================================================================
router.get('/ocupacao-padrao', validate(periodoQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { periodo?: string }
  const dias = diasDoPeriodo(q.periodo, 30)

  const agora = new Date()
  const corte = new Date(agora.getTime() - dias * DIA_MS)

  const agendamentos = await prisma.agendamento.findMany({
    where: { status: { not: 'cancelado' }, dataHora: { gte: corte, lte: agora } },
    select: { dataHora: true },
  })

  // matriz[diaSemana][hora] = contagem
  const matriz = new Map<string, number>()
  let minHora = 23
  let maxHora = 6
  let max = 0
  for (const a of agendamentos) {
    const { diaSemana, hora } = partesLocais(a.dataHora)
    const key = `${diaSemana}-${hora}`
    const novo = (matriz.get(key) ?? 0) + 1
    matriz.set(key, novo)
    if (novo > max) max = novo
    minHora = Math.min(minHora, hora)
    maxHora = Math.max(maxHora, hora)
  }
  if (minHora > maxHora) {
    minHora = 7
    maxHora = 20
  }

  const horas: number[] = []
  for (let h = minHora; h <= maxHora; h++) horas.push(h)

  const linhas = [0, 1, 2, 3, 4, 5, 6].map((diaSemana) => ({
    diaSemana,
    horas: horas.map((hora) => ({ hora, total: matriz.get(`${diaSemana}-${hora}`) ?? 0 })),
  }))

  res.json({ periodo: dias, horas, max, linhas })
})

// =====================================================================
// Bloco 6 — Receita (por dia + breakdown por modalidade)
// Baseada em agendamentos com status 'concluido' (valorCobrado).
// =====================================================================
router.get('/receita', validate(periodoQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { periodo?: string }
  const dias = diasDoPeriodo(q.periodo, 30)

  const hoje = hojeClinicaYMD()
  const inicio = inicioDoDia(adicionarDias(hoje, -(dias - 1)))
  const fim = inicioDoDia(adicionarDias(hoje, 1))

  const concluidos = await prisma.agendamento.findMany({
    where: { status: 'concluido', dataHora: { gte: inicio, lt: fim } },
    select: { dataHora: true, valorCobrado: true, modalidade: { select: { nome: true } } },
  })

  // Receita por dia (preenche zeros).
  const inicioYMD = instanteParaDataLocal(inicio)
  const porDiaMap = new Map<string, number>()
  for (let i = 0; i < dias; i++) {
    porDiaMap.set(adicionarDias(inicioYMD, i), 0)
  }
  const porModalidadeMap = new Map<string, number>()
  let total = 0

  for (const a of concluidos) {
    const valor = Number(a.valorCobrado ?? 0)
    total += valor
    const dia = instanteParaDataLocal(a.dataHora)
    porDiaMap.set(dia, (porDiaMap.get(dia) ?? 0) + valor)
    const nome = a.modalidade.nome
    porModalidadeMap.set(nome, (porModalidadeMap.get(nome) ?? 0) + valor)
  }

  const porDia = [...porDiaMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, valor]) => ({ data, valor }))

  const porModalidade = [...porModalidadeMap.entries()]
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor)

  res.json({ periodo: dias, total, porDia, porModalidade })
})

// =====================================================================
// Bloco 7 — Histórico (agendamentos por dia + novos clientes por mês)
// =====================================================================
router.get('/historico', validate(historicoQuerySchema, 'query'), async (req, res) => {
  const q = req.validatedQuery as { dias?: number }
  const dias = q.dias ?? 30

  const hoje = hojeClinicaYMD()
  const inicio = inicioDoDia(adicionarDias(hoje, -(dias - 1)))
  const fim = inicioDoDia(adicionarDias(hoje, 1))

  // Últimos 3 meses de clientes.
  const inicioClientes = inicioDoDia(`${adicionarDias(hoje, -92).slice(0, 7)}-01`)

  const [agendamentos, clientes] = await Promise.all([
    prisma.agendamento.findMany({
      where: { status: { not: 'cancelado' }, dataHora: { gte: inicio, lt: fim } },
      select: { dataHora: true },
    }),
    prisma.cliente.findMany({
      where: { criadoEm: { gte: inicioClientes } },
      select: { criadoEm: true },
    }),
  ])

  // Agendamentos por dia (preenche zeros).
  const porDiaMap = new Map<string, number>()
  for (let i = 0; i < dias; i++) {
    porDiaMap.set(adicionarDias(instanteParaDataLocal(inicio), i), 0)
  }
  for (const a of agendamentos) {
    const dia = instanteParaDataLocal(a.dataHora)
    porDiaMap.set(dia, (porDiaMap.get(dia) ?? 0) + 1)
  }
  const agendamentosPorDia = [...porDiaMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, total]) => ({ data, total }))

  // Novos clientes por mês (últimos 3 meses).
  const [anoHoje, mesHoje] = hoje.split('-').map(Number)
  const porMesMap = new Map<string, number>()
  for (let i = 2; i >= 0; i--) {
    const d = new Date(Date.UTC(anoHoje, mesHoje - 1 - i, 1))
    const chave = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    porMesMap.set(chave, 0)
  }
  for (const c of clientes) {
    const chave = instanteParaDataLocal(c.criadoEm).slice(0, 7)
    if (porMesMap.has(chave)) porMesMap.set(chave, (porMesMap.get(chave) ?? 0) + 1)
  }
  const novosClientesPorMes = [...porMesMap.entries()].map(([mes, total]) => ({ mes, total }))

  res.json({ dias, agendamentosPorDia, novosClientesPorMes })
})

export default router
