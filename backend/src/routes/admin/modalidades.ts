import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { validate } from '../../middleware/validate'
import { modalidadeSchema } from '../../validators/schemas'

const router = Router()

function serializar(m: {
  id: string
  nome: string
  descricao: string | null
  duracao: number
  vagas: number
  valor: Prisma.Decimal
  foto: string | null
  ativa: boolean
}) {
  return {
    id: m.id,
    nome: m.nome,
    descricao: m.descricao,
    duracao: m.duracao,
    vagas: m.vagas,
    valor: Number(m.valor),
    foto: m.foto,
    ativa: m.ativa,
  }
}

// GET /api/admin/modalidades — TODAS (inclusive inativas).
router.get('/', async (_req, res) => {
  const modalidades = await prisma.modalidade.findMany({ orderBy: { nome: 'asc' } })
  res.json(modalidades.map(serializar))
})

// POST /api/admin/modalidades
router.post('/', validate(modalidadeSchema), async (req, res) => {
  const d = req.body as {
    nome: string
    descricao?: string | null
    duracao: number
    vagas: number
    valor: number
    foto?: string | null
    ativa?: boolean
  }

  const modalidade = await prisma.modalidade.create({
    data: {
      nome: d.nome,
      descricao: d.descricao ?? null,
      duracao: d.duracao,
      vagas: d.vagas,
      valor: new Prisma.Decimal(d.valor),
      foto: d.foto || null,
      ativa: d.ativa ?? true,
    },
  })
  res.status(201).json(serializar(modalidade))
})

// PUT /api/admin/modalidades/:id
router.put('/:id', validate(modalidadeSchema), async (req, res) => {
  const id = String(req.params.id)
  const d = req.body as {
    nome: string
    descricao?: string | null
    duracao: number
    vagas: number
    valor: number
    foto?: string | null
    ativa?: boolean
  }

  const existente = await prisma.modalidade.findUnique({ where: { id } })
  if (!existente) return res.status(404).json({ message: 'Modalidade não encontrada' })

  const modalidade = await prisma.modalidade.update({
    where: { id },
    data: {
      nome: d.nome,
      descricao: d.descricao ?? null,
      duracao: d.duracao,
      vagas: d.vagas,
      valor: new Prisma.Decimal(d.valor),
      foto: d.foto || null,
      ativa: d.ativa ?? existente.ativa,
    },
  })
  res.json(serializar(modalidade))
})

export default router
