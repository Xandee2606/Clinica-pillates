# Guia de Deploy (Vercel + Railway)

Frontend na **Vercel**, backend na **Railway**, banco no **Supabase** (já configurado).
Fazer deploy **não trava nada**: a cada mudança no código, é só dar `git push` e os dois
serviços refazem o deploy sozinhos.

O que já está pronto no código:
- `frontend/vercel.json` — rewrites de SPA (rotas do React funcionam ao recarregar).
- `backend/railway.json` — usa `npm run start:prod` (aplica migrations + sobe o servidor).
- `backend` `postinstall` gera o Prisma Client automaticamente.

---

## Passo 0 — Subir o código para o GitHub

Vercel e Railway fazem deploy a partir de um repositório Git.

1. Crie um repositório novo (vazio) no [GitHub](https://github.com/new) — pode ser privado.
2. No terminal, na raiz do projeto:
   ```bash
   git add .
   git commit -m "Sistema da clínica de pilates"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```
   > O `.env` **não** vai junto (está no `.gitignore`). As chaves ficam só nos painéis
   > da Vercel/Railway.

---

## Passo 1 — Backend na Railway

1. Acesse [railway.app](https://railway.app) e faça login com o GitHub.
2. **New Project → Deploy from GitHub repo** → selecione o repositório.
3. Em **Settings** do serviço:
   - **Root Directory**: `backend`  ← importante (é um monorepo).
   - O start/build já vêm do `railway.json`.
4. Em **Variables**, adicione (veja a lista completa abaixo). No mínimo, para o preview:
   `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`,
   `JWT_REFRESH_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NODE_ENV=production`.
   - Pode copiar os valores do seu `backend/.env` local (DATABASE_URL, DIRECT_URL e os
     JWT secrets já existem lá).
   - **Não** defina `PORT` — a Railway injeta sozinha.
   - `FRONTEND_URL` você preenche no Passo 3 (depois de ter a URL da Vercel).
5. Deploy. Ao terminar, em **Settings → Networking → Generate Domain**, copie a URL pública
   (ex.: `https://clinica-backend-production.up.railway.app`).
6. Teste: abra `https://SUA-URL-RAILWAY/api/health` → deve responder `{"status":"ok"}`.

---

## Passo 2 — Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com o GitHub.
2. **Add New → Project** → importe o mesmo repositório.
3. Em **Configure Project**:
   - **Root Directory**: `frontend`  ← importante.
   - Framework: **Vite** (detecta sozinho). Build: `npm run build`, Output: `dist`.
4. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = a URL da Railway do Passo 1 **+ `/api`**
     (ex.: `https://clinica-backend-production.up.railway.app/api`).
5. **Deploy**. Ao terminar, copie a URL da Vercel (ex.: `https://clinica.vercel.app`).

---

## Passo 3 — Conectar os dois (CORS)

1. Volte na **Railway → Variables** e defina:
   - `FRONTEND_URL` = a URL da Vercel do Passo 2 (ex.: `https://clinica.vercel.app`).
2. A Railway refaz o deploy sozinha. Pronto — o CORS em produção libera só esse domínio.

---

## Variáveis de ambiente do backend (Railway)

| Variável | Obrigatória | Observação |
|----------|:-----------:|------------|
| `DATABASE_URL` | ✅ | Transaction Pooler (6543) — copie do `.env` local |
| `DIRECT_URL` | ✅ | Session Pooler (5432) — para migrations |
| `JWT_SECRET` | ✅ | Segredo forte (copie do `.env` ou gere um novo) |
| `JWT_REFRESH_SECRET` | ✅ | Idem, diferente do anterior |
| `JWT_EXPIRES_IN` | ✅ | `8h` |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | `30d` |
| `ADMIN_EMAIL` | ✅ | E-mail de login do painel |
| `ADMIN_PASSWORD` | ✅ | **Troque o placeholder antes de produção** |
| `NODE_ENV` | ✅ | `production` |
| `FRONTEND_URL` | ✅ | URL da Vercel (Passo 3) |
| `SUPABASE_SERVICE_ROLE_KEY` | opcional | Só se for usar recursos diretos do Supabase |
| `GOOGLE_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` / `_CALENDAR_ID` | opcional | Ativa o Google Calendar |
| `SMTP_HOST` / `_PORT` / `_USER` / `_PASS` | opcional | Ativa o e-mail de confirmação |
| `CLINICA_NOME` / `_ENDERECO` / `_WHATSAPP` / `_INSTAGRAM` | opcional | Fallback dos dados da clínica |

> Para gerar novos segredos JWT:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Variáveis do frontend (Vercel)

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL da Railway **+ `/api`** |

---

## Observações importantes

- **Mesmo banco:** o preview usa o mesmo Supabase do desenvolvimento. O usuário admin e as
  modalidades já existem. Os dados de teste (`@dev.local`) também — rode
  `npm run seed:dev:limpar` (local) para limpar antes da dona testar, se preferir começar zerado.
- **Trocar senha do admin:** altere `ADMIN_PASSWORD` na Railway e rode o seed de novo, OU
  redefina direto no banco. (O seed atual não sobrescreve a senha de um admin já existente.)
- **A cada mudança:** `git push` → Vercel e Railway refazem o deploy automaticamente.
- **Recarregar página no `/admin/...`:** funciona graças ao `vercel.json` (rewrites de SPA).
