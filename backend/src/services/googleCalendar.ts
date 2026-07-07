import { google } from 'googleapis'

/**
 * Integração com o Google Calendar.
 *
 * A integração é OPCIONAL e resiliente: se as credenciais não estiverem
 * configuradas no .env, as funções viram no-op (sem quebrar o agendamento).
 * Qualquer falha da API deve ser tratada pelo chamador — nunca deve impedir a
 * criação/cancelamento de um agendamento.
 */

export interface DadosEvento {
  nomeCliente: string
  modalidade: string
  telefone: string
  email: string
  dataHora: Date
  duracaoMin: number
}

const TIMEZONE = 'America/Sao_Paulo'

/** Retorna true se as credenciais do Google Calendar estão configuradas. */
export function calendarHabilitado(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  )
}

function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || 'primary'
}

function getCliente() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return google.calendar({ version: 'v3', auth: oauth2 })
}

function montarCorpo(dados: DadosEvento) {
  const fim = new Date(dados.dataHora.getTime() + dados.duracaoMin * 60 * 1000)
  return {
    summary: `Pilates — ${dados.nomeCliente}`,
    description: `Modalidade: ${dados.modalidade}\nTelefone: ${dados.telefone}\nE-mail: ${dados.email}`,
    start: { dateTime: dados.dataHora.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: fim.toISOString(), timeZone: TIMEZONE },
  }
}

/**
 * Cria um evento no calendário e retorna o googleEventId.
 * Retorna null se a integração estiver desabilitada.
 */
export async function criarEventoCalendar(dados: DadosEvento): Promise<string | null> {
  if (!calendarHabilitado()) return null
  const calendar = getCliente()
  const res = await calendar.events.insert({
    calendarId: getCalendarId(),
    requestBody: montarCorpo(dados),
  })
  return res.data.id ?? null
}

/** Cancela (remove) um evento do calendário. No-op se desabilitado ou sem id. */
export async function cancelarEventoCalendar(googleEventId: string | null): Promise<void> {
  if (!calendarHabilitado() || !googleEventId) return
  const calendar = getCliente()
  try {
    await calendar.events.delete({ calendarId: getCalendarId(), eventId: googleEventId })
  } catch (err: unknown) {
    // Se o evento já não existe (410/404), ignora — o objetivo (não existir) foi atingido.
    const status = (err as { code?: number }).code
    if (status !== 404 && status !== 410) throw err
  }
}

/** Atualiza um evento existente (ex.: reagendamento). No-op se desabilitado. */
export async function atualizarEventoCalendar(
  googleEventId: string | null,
  dados: DadosEvento,
): Promise<void> {
  if (!calendarHabilitado() || !googleEventId) return
  const calendar = getCliente()
  await calendar.events.patch({
    calendarId: getCalendarId(),
    eventId: googleEventId,
    requestBody: montarCorpo(dados),
  })
}
