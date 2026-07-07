/** Monta o link "Adicionar ao Google Agenda" (template de evento). */
export function linkGoogleAgenda(
  titulo: string,
  inicioISO: string,
  duracaoMin: number,
  detalhes: string,
): string {
  const inicio = new Date(inicioISO)
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
