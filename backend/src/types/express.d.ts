import 'express'

declare global {
  namespace Express {
    interface Request {
      /** Query string validada/coerida por Zod (Express 5 torna req.query somente-leitura). */
      validatedQuery?: unknown
      /** Params validados/coeridos por Zod. */
      validatedParams?: unknown
      /** Usuário autenticado, preenchido pelo authMiddleware. */
      usuario?: { id: string; email: string; role: string }
    }
  }
}
