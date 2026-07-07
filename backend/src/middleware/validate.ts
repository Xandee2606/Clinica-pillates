import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodTypeAny } from 'zod'

type Alvo = 'body' | 'query' | 'params'

/**
 * Valida e sanitiza (via parse) a parte indicada da requisição com um schema Zod.
 * Em caso de erro, responde 400 com a lista de problemas — sem vazar stack trace.
 */
export function validate(schema: ZodTypeAny, alvo: Alvo = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = schema.parse(req[alvo])
      // req.body é gravável; req.query/req.params são somente-leitura no Express 5,
      // então guardamos o resultado validado em propriedades próprias.
      if (alvo === 'body') {
        req.body = resultado
      } else if (alvo === 'query') {
        req.validatedQuery = resultado
      } else {
        req.validatedParams = resultado
      }
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          erros: err.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
        })
      }
      next(err)
    }
  }
}
