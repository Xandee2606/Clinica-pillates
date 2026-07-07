import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { validate } from '../middleware/validate'
import { horariosLivresQuerySchema, criarAgendamentoSchema } from '../validators/schemas'
import { gerarSlots, diaSemanaDe, paraInstante, instanteParaDataLocal } from '../lib/horarios'
import { criarEventoCalendar } from '../services/googleCalendar'
import { enviarEmailConfirmacao } from '../services/mailer'

const router = Router()

/**
 * GET /api/agendamentos/horarios-livres?modalidadeId=X&data=YYYY-MM-DD
 * Retorna os horários disponíveis (com vagas restantes) para a modalidade no dia.
 */
router.get('/horarios-livres', validate(horariosLivresQuerySchema, 'query'), async (req, res) => {
  const { modalidadeId, data } = req.validatedQuery as { modalidadeId: string; data: string }

  const modalidade = await prisma.modalidade.findUnique({ where: { id: modalidadeId } })
  if (!modalidade || !modalidade.ativa) {
    return res.status(404).json({ message: 'Modalidade não encontrada' })
  }

  const diaSemana = diaSemanaDe(data)
  const funcionamento = await prisma.horarioFuncionamento.findFirst({
    where: { diaSemana, ativo: true },
  })

  // Sem funcionamento nesse dia (ex.: domingo) → nenhum horário.
  if (!funcionamento) {
    return res.json({ data, horarios: [] })
  }

  const slots = gerarSlots(data, funcionamento.horaInicio, funcionamento.horaFim, modalidade.duracao)

  // Busca agendamentos ativos (confirmados) do dia para essa modalidade.
  const inicioDia = paraInstante(data, '00:00')
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000)

  const ocupados = await prisma.agendamento.findMany({
    where: {
      modalidadeId,
      status: 'confirmado',
      dataHora: { gte: inicioDia, lt: fimDia },
    },
    select: { dataHora: true },
  })

  const contagem = new Map<number, number>()
  for (const a of ocupados) {
    const key = a.dataHora.getTime()
    contagem.set(key, (contagem.get(key) ?? 0) + 1)
  }

  const agora = Date.now()
  const horarios = slots
    .filter((s) => s.inicio.getTime() > agora) // exclui horários passados
    .map((s) => {
      const usadas = contagem.get(s.inicio.getTime()) ?? 0
      const vagasDisponiveis = modalidade.vagas - usadas
      return {
        hora: s.hora,
        dataHora: s.inicio.toISOString(),
        vagasDisponiveis,
      }
    })
    .filter((h) => h.vagasDisponiveis > 0)

  res.json({ data, horarios })
})

/**
 * POST /api/agendamentos — cria (ou reaproveita) o cliente e agenda a aula.
 * Valida capacidade (vagas) e consistência do slot.
 */
router.post('/', validate(criarAgendamentoSchema), async (req, res) => {
  const { modalidadeId, dataHora, cliente, observacoes } = req.body as {
    modalidadeId: string
    dataHora: string
    cliente: { nome: string; email: string; telefone: string }
    observacoes?: string
  }

  const modalidade = await prisma.modalidade.findUnique({ where: { id: modalidadeId } })
  if (!modalidade || !modalidade.ativa) {
    return res.status(404).json({ message: 'Modalidade não encontrada' })
  }

  const instante = new Date(dataHora)
  if (Number.isNaN(instante.getTime())) {
    return res.status(400).json({ message: 'dataHora inválida' })
  }
  if (instante.getTime() <= Date.now()) {
    return res.status(400).json({ message: 'Não é possível agendar em um horário passado' })
  }

  // Valida que o instante corresponde a um slot válido do funcionamento do dia.
  const dataYMD = instanteParaDataLocal(instante)
  const diaSemana = diaSemanaDe(dataYMD)
  const funcionamento = await prisma.horarioFuncionamento.findFirst({
    where: { diaSemana, ativo: true },
  })
  if (!funcionamento) {
    return res.status(400).json({ message: 'A clínica não funciona nesse dia' })
  }
  const slots = gerarSlots(dataYMD, funcionamento.horaInicio, funcionamento.horaFim, modalidade.duracao)
  const slotValido = slots.some((s) => s.inicio.getTime() === instante.getTime())
  if (!slotValido) {
    return res.status(400).json({ message: 'Horário indisponível para esta modalidade' })
  }

  try {
    const agendamento = await prisma.$transaction(async (tx) => {
      // Upsert do cliente por e-mail.
      const clienteRegistro = await tx.cliente.upsert({
        where: { email: cliente.email },
        update: { nome: cliente.nome, telefone: cliente.telefone },
        create: { nome: cliente.nome, email: cliente.email, telefone: cliente.telefone },
      })

      // Checa capacidade dentro da transação.
      const usadas = await tx.agendamento.count({
        where: { modalidadeId, dataHora: instante, status: 'confirmado' },
      })
      if (usadas >= modalidade.vagas) {
        throw new HorarioLotadoError()
      }

      return tx.agendamento.create({
        data: {
          clienteId: clienteRegistro.id,
          modalidadeId,
          dataHora: instante,
          status: 'confirmado',
          valorCobrado: modalidade.valor,
          observacoes: observacoes ?? null,
        },
        include: { cliente: true, modalidade: true },
      })
    })

    // Cria o evento no Google Calendar (best-effort: não deve quebrar o agendamento).
    let googleEventId: string | null = null
    try {
      googleEventId = await criarEventoCalendar({
        nomeCliente: agendamento.cliente.nome,
        modalidade: agendamento.modalidade.nome,
        telefone: agendamento.cliente.telefone,
        email: agendamento.cliente.email,
        dataHora: agendamento.dataHora,
        duracaoMin: agendamento.modalidade.duracao,
      })
      if (googleEventId) {
        await prisma.agendamento.update({
          where: { id: agendamento.id },
          data: { googleEventId },
        })
      }
    } catch (calErr) {
      console.error('Falha ao criar evento no Google Calendar:', calErr)
    }

    // Envia e-mail de confirmação (best-effort: não deve quebrar o agendamento).
    try {
      const config = await prisma.configuracao.findFirst()
      await enviarEmailConfirmacao({
        para: agendamento.cliente.email,
        nomeCliente: agendamento.cliente.nome,
        modalidade: agendamento.modalidade.nome,
        dataHora: agendamento.dataHora,
        duracaoMin: agendamento.modalidade.duracao,
        clinica: {
          nome: config?.nome ?? process.env.CLINICA_NOME ?? '[NOME DA CLÍNICA]',
          endereco: config?.endereco ?? null,
          whatsapp: config?.whatsapp ?? null,
        },
      })
    } catch (mailErr) {
      console.error('Falha ao enviar e-mail de confirmação:', mailErr)
    }

    return res.status(201).json({
      id: agendamento.id,
      dataHora: agendamento.dataHora.toISOString(),
      status: agendamento.status,
      valorCobrado: agendamento.valorCobrado ? Number(agendamento.valorCobrado) : null,
      cliente: {
        id: agendamento.cliente.id,
        nome: agendamento.cliente.nome,
        email: agendamento.cliente.email,
      },
      modalidade: {
        id: agendamento.modalidade.id,
        nome: agendamento.modalidade.nome,
        duracao: agendamento.modalidade.duracao,
        valor: Number(agendamento.modalidade.valor),
      },
    })
  } catch (err) {
    if (err instanceof HorarioLotadoError) {
      return res.status(409).json({ message: 'Este horário já está lotado' })
    }
    // Cliente já agendou exatamente este slot nesta modalidade.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ message: 'Você já tem um agendamento neste horário' })
    }
    throw err
  }
})

class HorarioLotadoError extends Error {}

export default router
