import nodemailer from 'nodemailer'

/**
 * Envio de e-mails (Nodemailer + SMTP/Gmail).
 *
 * Opcional e resiliente: se o SMTP não estiver configurado no .env, as funções
 * viram no-op e nunca quebram o fluxo de agendamento.
 */

export interface DadosEmailConfirmacao {
  para: string
  nomeCliente: string
  modalidade: string
  dataHora: Date
  duracaoMin: number
  clinica: { nome: string; endereco: string | null; whatsapp: string | null }
}

const TIMEZONE = 'America/Sao_Paulo'

/** Retorna true se o SMTP está configurado. */
export function mailerHabilitado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

function formatarDataHora(data: Date): { dataExtenso: string; hora: string } {
  const dataExtenso = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(data)
  const hora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(data)
  return { dataExtenso, hora }
}

/** Monta o link "Adicionar ao Google Agenda". */
function linkGoogleAgenda(titulo: string, inicio: Date, duracaoMin: number, detalhes: string): string {
  const fim = new Date(inicio.getTime() + duracaoMin * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${fmt(inicio)}/${fmt(fim)}`,
    details: detalhes,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function linkWhatsApp(telefone: string): string {
  const num = telefone.replace(/\D/g, '')
  return `https://wa.me/${num.startsWith('55') ? num : '55' + num}`
}

function montarHtml(dados: DadosEmailConfirmacao): string {
  const { dataExtenso, hora } = formatarDataHora(dados.dataHora)
  const primeiroNome = dados.nomeCliente.split(' ')[0]
  const agendaLink = linkGoogleAgenda(
    `Pilates — ${dados.clinica.nome}`,
    dados.dataHora,
    dados.duracaoMin,
    `Modalidade: ${dados.modalidade}`,
  )
  const whats = dados.clinica.whatsapp ? linkWhatsApp(dados.clinica.whatsapp) : null

  // HTML com CSS inline, responsivo e sem imagens externas.
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f3;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f3;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6ede4;">
        <tr><td style="background:#4b6f47;padding:28px 32px;">
          <p style="margin:0;color:#eef4ec;font-size:14px;letter-spacing:.5px;">🌿 ${dados.clinica.nome}</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:600;">Agendamento confirmado!</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#324731;font-size:16px;line-height:1.5;">
            Olá, ${primeiroNome}! Sua aula está reservada. Aqui estão os detalhes:
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f3;border-radius:12px;padding:8px 0;">
            ${linhaResumo('Modalidade', dados.modalidade)}
            ${linhaResumo('Data', dataExtenso)}
            ${linhaResumo('Horário', hora)}
            ${linhaResumo('Duração', `${dados.duracaoMin} min`)}
            ${dados.clinica.endereco ? linhaResumo('Endereço', dados.clinica.endereco) : ''}
          </table>

          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${agendaLink}" style="display:inline-block;background:#628a5c;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;font-weight:600;">
              Adicionar ao Google Agenda
            </a>
          </div>

          <p style="margin:24px 0 0;color:#6b7d68;font-size:14px;line-height:1.5;text-align:center;">
            Precisa remarcar ou cancelar?${whats ? ` <a href="${whats}" style="color:#4b6f47;">Fale conosco no WhatsApp</a>.` : ' Entre em contato com a clínica.'}
          </p>
        </td></tr>
        <tr><td style="background:#324731;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#aac4a5;font-size:12px;">Até logo! — ${dados.clinica.nome}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function linhaResumo(rotulo: string, valor: string): string {
  return `<tr>
    <td style="padding:8px 20px;color:#82a67c;font-size:13px;">${rotulo}</td>
    <td style="padding:8px 20px;color:#324731;font-size:14px;font-weight:600;text-align:right;">${valor}</td>
  </tr>`
}

/** Expõe o HTML do e-mail (útil para testes/preview). */
export function montarHtmlConfirmacao(dados: DadosEmailConfirmacao): string {
  return montarHtml(dados)
}

/**
 * Envia o e-mail de confirmação de agendamento. No-op se o SMTP não estiver
 * configurado. Lança em caso de falha de envio (o chamador deve tratar).
 */
export async function enviarEmailConfirmacao(
  dados: DadosEmailConfirmacao,
): Promise<nodemailer.SentMessageInfo | null> {
  if (!mailerHabilitado()) return null

  const transporter = getTransporter()
  const { dataExtenso, hora } = formatarDataHora(dados.dataHora)

  return transporter.sendMail({
    from: `"${dados.clinica.nome}" <${process.env.SMTP_USER}>`,
    to: dados.para,
    subject: `Aula confirmada — ${dataExtenso} às ${hora}`,
    html: montarHtml(dados),
    text:
      `Olá, ${dados.nomeCliente}! Sua aula de ${dados.modalidade} está confirmada para ` +
      `${dataExtenso} às ${hora} (${dados.duracaoMin} min).` +
      (dados.clinica.endereco ? ` Endereço: ${dados.clinica.endereco}.` : ''),
  })
}
