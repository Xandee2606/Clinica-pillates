export function formatarBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h}h${m}` : `${h}h`
}

const meses = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const diasSemana = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
]

export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Formata um instante ISO no fuso da clínica (UTC-3) como "07:00". */
export function formatarHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

/** Formata uma data "YYYY-MM-DD" como "segunda-feira, 6 de julho". */
export function formatarDataExtenso(ymd: string): string {
  const [ano, mes, dia] = ymd.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1, dia))
  return `${diasSemana[d.getUTCDay()]}, ${dia} de ${meses[mes - 1]}`
}

export function formatarDataCurta(ymd: string): string {
  const [, mes, dia] = ymd.split('-').map(Number)
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`
}
