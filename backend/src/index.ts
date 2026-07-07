import 'dotenv/config'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { loginRateLimit } from './middleware/rateLimit'
import authRouter from './routes/auth'
import modalidadesRouter from './routes/modalidades'
import agendamentosRouter from './routes/agendamentos'
import configuracoesRouter from './routes/configuracoes'
import adminRouter from './routes/admin'

const app = express()

const isProd = process.env.NODE_ENV === 'production'

// Cabeçalhos de segurança HTTP.
app.use(helmet())

app.use(
  cors({
    // Em produção, restringe estritamente ao domínio do frontend.
    // Em desenvolvimento, aceita qualquer origem localhost (portas variam).
    origin: isProd
      ? process.env.FRONTEND_URL
      : (origin, callback) => {
          if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true)
          } else {
            callback(new Error('Origem não permitida pelo CORS'))
          }
        },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Rotas públicas
app.use('/api/auth/login', loginRateLimit)
app.use('/api/auth', authRouter)
app.use('/api/modalidades', modalidadesRouter)
app.use('/api/agendamentos', agendamentosRouter)
app.use('/api/configuracoes', configuracoesRouter)

// Rotas admin (authMiddleware + adminMiddleware aplicados dentro do router)
app.use('/api/admin', adminRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Rota não encontrada' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const isProd = process.env.NODE_ENV === 'production'
  res.status(500).json({ message: isProd ? 'Erro interno do servidor' : err.message })
})

const PORT = process.env.PORT ?? 3333

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
