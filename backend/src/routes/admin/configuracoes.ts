import { Router } from 'express'
import { prisma } from '../../lib/prisma'
import { validate } from '../../middleware/validate'
import { configuracaoSchema, funcionamentoSchema } from '../../validators/schemas'

const router = Router()

// =====================================================================
// Dados da clínica
// =====================================================================
router.get('/', async (_req, res) => {
  const config = await prisma.configuracao.findFirst()
  res.json(
    config ?? { nome: process.env.CLINICA_NOME ?? '[NOME DA CLÍNICA]', endereco: null, whatsapp: null, instagram: null },
  )
})

router.put('/', validate(configuracaoSchema), async (req, res) => {
  const dados = req.body as {
    nome: string
    endereco?: string | null
    whatsapp?: string | null
    instagram?: string | null
  }

  const existente = await prisma.configuracao.findFirst()
  const config = existente
    ? await prisma.configuracao.update({ where: { id: existente.id }, data: dados })
    : await prisma.configuracao.create({ data: dados })

  res.json(config)
})

// =====================================================================
// Horários de funcionamento
// =====================================================================
router.get('/funcionamento', async (_req, res) => {
  const horarios = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: 'asc' } })
  res.json(horarios)
})

// Substitui o conjunto de horários pelo enviado.
router.put('/funcionamento', validate(funcionamentoSchema), async (req, res) => {
  const { horarios } = req.body as {
    horarios: { diaSemana: number; horaInicio: string; horaFim: string; ativo?: boolean }[]
  }

  // Valida horaInicio < horaFim.
  for (const h of horarios) {
    if (h.horaInicio >= h.horaFim) {
      return res
        .status(400)
        .json({ message: `Horário inválido no dia ${h.diaSemana}: início deve ser antes do fim` })
    }
  }

  await prisma.$transaction([
    prisma.horarioFuncionamento.deleteMany({}),
    prisma.horarioFuncionamento.createMany({
      data: horarios.map((h) => ({
        diaSemana: h.diaSemana,
        horaInicio: h.horaInicio,
        horaFim: h.horaFim,
        ativo: h.ativo ?? true,
      })),
    }),
  ])

  const atualizados = await prisma.horarioFuncionamento.findMany({ orderBy: { diaSemana: 'asc' } })
  res.json(atualizados)
})

export default router
