import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware'
import { adminMiddleware } from '../../middleware/adminMiddleware'
import dashboardRouter from './dashboard'
import agendamentosRouter from './agendamentos'
import clientesRouter from './clientes'
import financeiroRouter from './financeiro'
import configuracoesRouter from './configuracoes'
import modalidadesAdminRouter from './modalidades'

const router = Router()

// TODAS as rotas /api/admin/* passam por autenticação + verificação de role.
router.use(authMiddleware, adminMiddleware)

// GET /api/admin/me — dados do usuário logado (validação de sessão no frontend).
router.get('/me', (req, res) => {
  res.json({ usuario: req.usuario })
})

router.use('/dashboard', dashboardRouter)
router.use('/agendamentos', agendamentosRouter)
router.use('/clientes', clientesRouter)
router.use('/financeiro', financeiroRouter)
router.use('/configuracoes', configuracoesRouter)
router.use('/modalidades', modalidadesAdminRouter)

export default router
