import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/configuracoes — dados públicos da clínica (nome, contato, endereço).
// Somente leitura e apenas campos seguros para exibição no site.
router.get('/', async (_req, res) => {
  const config = await prisma.configuracao.findFirst()

  if (!config) {
    return res.json({
      nome: process.env.CLINICA_NOME ?? '[NOME DA CLÍNICA]',
      endereco: null,
      whatsapp: null,
      instagram: null,
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
