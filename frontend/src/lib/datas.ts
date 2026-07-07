/** Utilitários de data para o calendário, no fuso da clínica (America/Sao_Paulo). */

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

export interface CelulaCalendario {
  ymd: string
  dia: number
  mesAtual: boolean
}

/** Gera a grade (semanas x 7 dias) de um mês, iniciando no domingo. */
export function gerarGradeMes(ano: number, mes0: number): CelulaCalendario[] {
  const primeiro = new Date(Date.UTC(ano, mes0, 1))
  const inicioSemana = primeiro.getUTCDay() // 0=dom
  const diasNoMes = new Date(Date.UTC(ano, mes0 + 1, 0)).getUTCDate()

  const celulas: CelulaCalendario[] = []

  // Dias do mês anterior para preencher a primeira semana.
  const mesAnteriorDias = new Date(Date.UTC(ano, mes0, 0)).getUTCDate()
  for (let i = inicioSemana - 1; i >= 0; i--) {
    const dia = mesAnteriorDias - i
    const dPrev = new Date(Date.UTC(ano, mes0 - 1, dia))
    celulas.push({
      ymd: ymd(dPrev.getUTCFullYear(), dPrev.getUTCMonth(), dia),
      dia,
      mesAtual: false,
    })
  }

  // Dias do mês atual.
  for (let dia = 1; dia <= diasNoMes; dia++) {
    celulas.push({ ymd: ymd(ano, mes0, dia), dia, mesAtual: true })
  }

  // Dias do próximo mês para completar a última semana (grade de 6 linhas).
  while (celulas.length % 7 !== 0) {
    const idx = celulas.length - (inicioSemana + diasNoMes) + 1
    const dNext = new Date(Date.UTC(ano, mes0 + 1, idx))
    celulas.push({
      ymd: ymd(dNext.getUTCFullYear(), dNext.getUTCMonth(), idx),
      dia: idx,
      mesAtual: false,
    })
  }

  return celulas
}

export const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
