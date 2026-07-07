# [NOME DA CLÍNICA] — Site + Sistema de Gestão

Monorepo com site público (agendamento de aulas de pilates) e painel administrativo.

## Estrutura

- `frontend/` — React 18 + Vite + TypeScript + Tailwind CSS
- `backend/` — Node.js + Express + TypeScript + Prisma

## Como rodar localmente

### Backend

```bash
cd backend
cp .env.example .env   # preencha com suas credenciais
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Configuração do banco (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com).
2. Em **Project Settings → Database**, copie a connection string do **Transaction Pooler** (porta `6543`) para `DATABASE_URL` e a conexão direta (porta `5432`) para `DIRECT_URL`.
3. Rode `npm run prisma:migrate` (usa `DIRECT_URL`) para aplicar o schema.
4. No painel do Supabase, habilite **Row Level Security (RLS)** em todas as tabelas.

## Configuração do Google Calendar

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie um projeto.
2. Ative a **Google Calendar API**.
3. Crie credenciais OAuth2 (tipo: Web application) e adicione `http://localhost:3000` como redirect URI.
4. Preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI` no `.env` do backend.
5. Rode o script de autorização para obter o Refresh Token:
   ```bash
   npm run google:auth              # imprime a URL de autorização
   # abra a URL, autorize e copie o parâmetro `code=` da URL de redirecionamento
   npm run google:auth -- <code>    # imprime GOOGLE_REFRESH_TOKEN para o .env
   ```
6. Preencha `GOOGLE_REFRESH_TOKEN` e `GOOGLE_CALENDAR_ID` (ex.: `primary`) no `.env`.

> A integração é **opcional e resiliente**: se as credenciais não estiverem
> configuradas, os agendamentos continuam funcionando normalmente (sem evento no
> calendário). Nenhuma falha do Google Calendar impede a criação de um agendamento.

## Configuração de e-mail (Nodemailer + Gmail)

1. Ative a verificação em duas etapas na conta Gmail que enviará os e-mails.
2. Gere uma [senha de app](https://myaccount.google.com/apppasswords).
3. Preencha `SMTP_USER` (e-mail) e `SMTP_PASS` (senha de app) no `.env` do backend.

## Segurança

Veja o checklist de segurança no planejamento do projeto antes de considerar qualquer etapa pronta. Pontos inegociáveis:

- A `SUPABASE_SERVICE_ROLE_KEY` só existe no `.env` do backend, nunca no frontend.
- O frontend nunca acessa o Supabase diretamente — tudo passa pela API REST do backend.
- RLS habilitado em todas as tabelas do Supabase.
- Todas as rotas `/api/admin/*` protegidas por `authMiddleware` + `adminMiddleware`.

## Deploy

- Frontend: [Vercel](https://vercel.com)
- Backend: [Railway](https://railway.app)
