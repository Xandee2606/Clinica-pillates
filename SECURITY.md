# Auditoria de Segurança

Resultado dos testes manuais de segurança (Passo 12). Todos verificados com testes
reais, não apenas inspeção de código.

## Checklist

| # | Item | Status | Como foi verificado |
|---|------|--------|---------------------|
| 1 | `.env` no `.gitignore` e nunca commitado | ✅ | `git ls-files` não lista nenhum `.env`; `git check-ignore` confirma ignorados |
| 2 | `SUPABASE_SERVICE_ROLE_KEY` só no backend | ✅ | Sem referência no frontend; não é usada no código (acesso é via Prisma/pooler, não supabase-js) |
| 3 | Frontend sem referência ao Supabase | ✅ | `grep` no frontend: só `VITE_API_URL` |
| 4 | RLS habilitado em todas as tabelas | ✅ | `pg_class.relrowsecurity` = ON nas 7 tabelas |
| 5 | Rotas `/api/admin/*` com auth + admin | ✅ | 15 rotas + POST/PUT retornam 401 sem token; role≠admin → 403 |
| 6 | Inputs validados com Zod | ✅ | Payloads maliciosos (SQLi, JSON quebrado) → 400 |
| 7 | Senhas com bcrypt | ✅ | Hash `$2b$12$...` no banco |
| 8 | JWT com expiração de 8h | ✅ | `JWT_EXPIRES_IN=8h`; token expirado → 401 |
| 9 | CORS restrito ao domínio do frontend | ✅ | Em produção, `origin` = `FRONTEND_URL` |
| 10 | Sem stack traces em produção | ✅ | Com `NODE_ENV=production`, erro 500 retorna "Erro interno do servidor" |
| 11 | `DATABASE_URL` via Transaction Pooler (6543) | ✅* | Porta 6543 + `pgbouncer=true`; ver nota sobre `connection_limit` |
| 12 | `DIRECT_URL` para migrations | ✅ | Session Pooler porta 5432 |

## Testes de autenticação/autorização

- Token ausente → **401** em todas as rotas admin
- Token adulterado / assinado com secret errado → **401**
- Token expirado → **401**
- Token válido mas `role != admin` → **403**
- Login não revela se o e-mail existe (mensagem genérica "E-mail ou senha incorretos")

## Nota sobre `connection_limit`

O checklist original pedia `connection_limit=1`. Esse valor é a recomendação para
ambientes **serverless** (cada invocação isolada). Como o backend roda em um
**servidor persistente** (Railway), usamos `connection_limit=5&pool_timeout=20`,
senão o pool de 1 conexão estoura sob requisições concorrentes (o dashboard dispara
~7 chamadas simultâneas). O pgbouncer do Supabase multiplexa as conexões, então o
valor maior é seguro.

## Recomendações adicionais (não no checklist original)

- **Rate limiting** no `POST /api/auth/login` (ex.: `express-rate-limit`) para
  mitigar força bruta.
- **`helmet`** para cabeçalhos de segurança HTTP.
- O JWT é guardado em `localStorage` (exposto a XSS). É o padrão definido no projeto;
  para segurança máxima, considerar cookies `httpOnly`.
