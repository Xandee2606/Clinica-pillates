import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/configuracoes — dados públicos da clínica (nome, contato, endereço).
// Somente leitura e apenas campos seguros para exibição no site.
router.get('/', async (_req, res) => {
  const config = await prisma.configuracao.findFirst()

  if (!config) {
    return res.json({
      nome: process.env.CLINICA_NOME ?? 'Serrão Santos Fisioterapia',
      endereco: null,
      whatsapp: process.env.CLINICA_WHATSAPP ?? '5561991678065',
      instagram: process.env.CLINICA_INSTAGRAM ?? null,
    })
  }

  res.json({
    nome: config.nome,
    endereco: config.endereco,
    whatsapp: config.whatsapp,
    instagram: config.instagram,
  })
})

export default router
