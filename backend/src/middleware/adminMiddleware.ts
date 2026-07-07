import type { Request, Response, NextFunction } from 'express'

/**
 * Exige que o usuário autenticado tenha role "admin".
 * Deve ser usado sempre APÓS o authMiddleware.
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.usuario) {
    return res.status(401).json({ message: 'Não autenticado' })
  }

  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' })
  }

  next()
}
