import rateLimit from 'express-rate-limit'

/**
 * Limitador para o login: mitiga ataques de força bruta.
 * 10 tentativas por IP a cada 15 minutos.
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
})
