import 'dotenv/config'
import { google } from 'googleapis'

/**
 * Script de autorização do Google Calendar — roda UMA vez para obter o
 * GOOGLE_REFRESH_TOKEN.
 *
 * Pré-requisitos no .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
 * GOOGLE_REDIRECT_URI (ex.: http://localhost:3000).
 *
 * Uso:
 *   1) npm run google:auth
 *      → imprime a URL de autorização. Abra no navegador, autorize e copie o
 *        parâmetro `code` da URL de redirecionamento.
 *   2) npm run google:auth -- <code>
 *      → troca o code pelo refresh token e imprime o valor para o .env.
 */

const SCOPES = ['https://www.googleapis.com/auth/calendar']

function getOAuth2() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env antes de rodar.')
    process.exit(1)
  }
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI || 'http://localhost:3000',
  )
}

async function main() {
  const oauth2 = getOAuth2()
  const code = process.argv[2]

  if (!code) {
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // força o retorno de um refresh_token
      scope: SCOPES,
    })
    console.log('\n1) Abra esta URL no navegador e autorize:\n')
    console.log(url)
    console.log('\n2) Após autorizar, copie o valor de `code=` da URL de redirecionamento e rode:')
    console.log('   npm run google:auth -- <code>\n')
    return
  }

  const { tokens } = await oauth2.getToken(code)
  if (!tokens.refresh_token) {
    console.error(
      '\nNenhum refresh_token retornado. Remova o acesso em https://myaccount.google.com/permissions e tente de novo (prompt=consent).\n',
    )
    process.exit(1)
  }
  console.log('\n✔ Copie esta linha para o seu .env:\n')
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
