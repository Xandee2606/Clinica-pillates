import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/modalidades — lista modalidades ativas (público)
router.get('/', async (_req, res) => {
  const modalidades = await prisma.modalidade.findMany({
    where: { ativa: true },
    orderBy: { valor: 'asc' },
  })

  res.json(
    modalidades.map((m) => ({
      id: m.id,
      nome: m.nome,
      descricao: m.descricao,
      duracao: m.duracao,
      vagas: m.vagas,
      valor: Number(m.valor),
      foto: m.foto,
      ativa: m.ativa,
    })),
  )
})

export default router
