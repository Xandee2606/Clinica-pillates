/**
 * Utilitários de horários/slots da clínica.
 *
 * A clínica opera em horário de Brasília. O Brasil não adota horário de verão
 * desde 2019, então usamos um offset fixo UTC-3. Todos os horários "HH:MM" e
 * datas "YYYY-MM-DD" são interpretados nesse fuso; os instantes são armazenados
 * em UTC no banco.
 */

export const CLINICA_TZ_OFFSET = '-03:00'

export interface Slot {
  /** Hora local no formato "HH:MM" */
  hora: string
  /** Instante exato (UTC) do início do slot */
  inicio: Date
}

/** Converte "YYYY-MM-DD" + "HH:MM" locais (UTC-3) para um instante Date (UTC). */
export function paraInstante(data: string, hora: string): Date {
  return new Date(`${data}T${hora}:00${CLINICA_TZ_OFFSET}`)
}

/** Dia da semana (0=domingo..6=sábado) da data "YYYY-MM-DD" no calendário local. */
export function diaSemanaDe(data: string): number {
  const [ano, mes, dia] = data.split('-').map(Number)
  // Usa UTC para obter o weekday do dia civil, sem influência de fuso local do servidor.
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
}

/** Data de hoje como "YYYY-MM-DD" no fuso da clínica (America/Sao_Paulo). */
export function hojeClinicaYMD(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Instante (UTC) do início do dia civil (00:00 UTC-3) de "YYYY-MM-DD". */
export function inicioDoDia(data: string): Date {
  return paraInstante(data, '00:00')
}

/** Soma `n` dias a uma data "YYYY-MM-DD" e retorna a nova data "YYYY-MM-DD". */
export function adicionarDias(data: string, n: number): string {
  const [ano, mes, dia] = data.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1, dia + n))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
    d.getUTCDate(),
  ).padStart(2, '0')}`
}

/** Extrai a data local (YYYY-MM-DD, UTC-3) de um instante. */
export function instanteParaDataLocal(instante: Date): string {
  const local = new Date(instante.getTime() - 3 * 60 * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

/** Partes locais (fuso da clínica, UTC-3) de um instante: data, dia da semana, hora e minuto. */
export function partesLocais(instante: Date): {
  ymd: string
  diaSemana: number
  hora: number
  minuto: number
} {
  const local = new Date(instante.getTime() - 3 * 60 * 60 * 1000)
  return {
    ymd: local.toISOString().slice(0, 10),
    diaSemana: local.getUTCDay(),
    hora: local.getUTCHours(),
    minuto: local.getUTCMinutes(),
  }
}

/** Retorna a segunda-feira (YYYY-MM-DD) da semana que contém a data informada. */
export function segundaDaSemana(data: string): string {
  const wd = diaSemanaDe(data) // 0=domingo..6=sábado
  const offset = wd === 0 ? -6 : -(wd - 1)
  return adicionarDias(data, offset)
}

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function minutosParaHora(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Gera os slots de um dia para uma modalidade, com cadência igual à duração da
 * modalidade (evita sobreposição dentro da mesma modalidade). Um slot só é
 * gerado se couber inteiro dentro do horário de funcionamento.
 */
export function gerarSlots(
  data: string,
  horaInicio: string,
  horaFim: string,
  duracaoMin: number,
): Slot[] {
  const inicioMin = horaParaMinutos(horaInicio)
  const fimMin = horaParaMinutos(horaFim)
  const slots: Slot[] = []

  for (let t = inicioMin; t + duracaoMin <= fimMin; t += duracaoMin) {
    const hora = minutosParaHora(t)
    slots.push({ hora, inicio: paraInstante(data, hora) })
  }

  return slots
}
