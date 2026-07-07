import { Router } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma'
import { validate } from '../middleware/validate'
import { loginSchema, refreshSchema } from '../validators/schemas'

const router = Router()

function gerarTokens(usuario: { id: string; email: string; role: string }) {
  const payload = { sub: usuario.id, email: usuario.email, role: usuario.role }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as SignOptions['expiresIn'],
  })

  return { token, refreshToken }
}

/**
 * POST /api/auth/login
 * Mensagem de erro genérica de propósito: não revelar se o e-mail existe.
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, senha } = req.body as { email: string; senha: string }

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos' })
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senha)
  if (!senhaOk) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos' })
  }

  const { token, refreshToken } = gerarTokens(usuario)

  res.json({
    token,
    refreshToken,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      criadoEm: usuario.criadoEm,
    },
  })
})

/**
 * POST /api/auth/refresh
 * Emite um novo par de tokens a partir de um refresh token válido.
 */
router.post('/refresh', validate(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      sub: string
    }

    // Confirma que o usuário ainda existe (pode ter sido removido).
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.sub } })
    if (!usuario) {
      return res.status(401).json({ message: 'Sessão inválida' })
    }

    const tokens = gerarTokens(usuario)
    return res.json(tokens)
  } catch {
    return res.status(401).json({ message: 'Sessão expirada. Faça login novamente' })
  }
})

export default router
