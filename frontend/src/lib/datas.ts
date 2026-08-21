/** Utilitários de data no fuso da clínica (America/Sao_Paulo). */

/** Data de hoje como "YYYY-MM-DD" no fuso de São Paulo. */
export function hojeYMD(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function ymd(ano: number, mes0: number, dia: number): string {
  return `${ano}-${String(mes0 + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Soma `n` dias a "YYYY-MM-DD" e retorna a nova data "YYYY-MM-DD". */
export function adicionarDias(data: string, n: number): string {
  const [a, m, d] = data.split('-').map(Number)
  const nova = new Date(Date.UTC(a, m - 1, d + n))
  return ymd(nova.getUTCFullYear(), nova.getUTCMonth(), nova.getUTCDate())
}

/** Data local (YYYY-MM-DD, fuso da clínica) de um instante ISO. */
export function ymdLocalDe(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

/** Dia da semana (0=domingo..6=sábado) de "YYYY-MM-DD". */
export function diaSemana(data: string): number {
  const [a, m, d] = data.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}
