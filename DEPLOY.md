# Guia de Deploy

**Frontend:** Vercel (já no ar) · **Backend:** Render · **Banco:** Supabase

Estado atual:
- Frontend: <https://clinica-pilates-frontend.vercel.app> — no ar, deploy automático a cada `git push`.
- Banco: Supabase (plano gratuito) — funcionando.
- Backend: migrando do Railway para o Render (o trial do Railway expirou).

---

## Backend no Render (plano gratuito)

O arquivo `render.yaml` na raiz já descreve o serviço. Os segredos **não** estão nele —
o Render pede os valores na criação.

### Passo a passo

1. Acesse <https://dashboard.render.com> e entre com o GitHub.
2. **New → Blueprint** e selecione o repositório `Clinica-pillates`.
3. O Render lê o `render.yaml` e pede as variáveis marcadas como "sync: false".
   Preencha com os valores do seu `backend/.env` local:

   | Variável | Onde encontrar |
   |---|---|
   | `DATABASE_URL` | `backend/.env` (pooler, porta 6543) |
   | `DIRECT_URL` | `backend/.env` (porta 5432) |
   | `ADMIN_EMAIL` | e-mail de login do painel |
   | `ADMIN_PASSWORD` | senha do painel (**troque a padrão**) |
   | `CLINICA_NOME` | nome da clínica |
   | `GOOGLE_*` / `SMTP_*` | opcionais — deixe em branco se não for usar agora |

   > `JWT_SECRET` e `JWT_REFRESH_SECRET` são gerados automaticamente pelo Render.

4. **Apply**. O primeiro build leva alguns minutos.
5. Copie a URL gerada (algo como `https://clinica-pilates-backend.onrender.com`).

### Passo final — conectar o frontend ao novo backend

Na Vercel, atualize a variável do frontend para a URL do Render **+ `/api`**:

```bash
vercel env rm VITE_API_URL production --yes
echo "https://SUA-URL.onrender.com/api" | vercel env add VITE_API_URL production
git commit --allow-empty -m "redeploy" && git push
```

---

## ⚠️ Limitação do plano gratuito do Render

O serviço **hiberna após ~15 minutos sem acesso**. A primeira visita depois disso
espera **~50 segundos** o servidor acordar. Nas visitas seguintes, fica normal.

Para uso real com clientes agendando, considere um plano pago (Render Starter ou
Railway Hobby, ~US$ 5–7/mês), que elimina a hibernação.

---

## Frontend na Vercel (já configurado)

- **Root Directory:** `frontend` (essencial — é um monorepo).
- **Deploy:** automático via integração GitHub. Basta `git push`.
- `frontend/vercel.json` cuida das rotas do React (SPA rewrites).

> O upload direto pelo CLI (`vercel --prod`) falha nesta máquina com timeout.
> Use `git push` para publicar.

---

## Banco no Supabase

- `DATABASE_URL` usa o **Transaction Pooler** (porta 6543) com
  `?pgbouncer=true&connection_limit=5&pool_timeout=20`.
- `DIRECT_URL` usa a porta 5432 (migrations).
- **O projeto pausa após ~1 semana sem uso** (plano gratuito). Se isso acontecer,
  basta acessar o painel do Supabase e restaurar — os dados são preservados.
  Durante a restauração o banco passa por um estado em que as tabelas parecem não
  existir; espere terminar antes de concluir qualquer coisa.

---

## Rodar localmente

```bash
# backend (porta 3333)
cd backend && npm install && npm run dev

# frontend (porta 5173)
cd frontend && npm install && npm run dev
```

Site em `http://localhost:5173`, painel em `/login`.
