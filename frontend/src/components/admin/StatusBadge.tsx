import { Badge } from '../ui/Badge'
import type { StatusAgendamento } from '../../types'

const config: Record<StatusAgendamento, { tom: 'sage' | 'success' | 'warning' | 'neutral'; label: string }> = {
  confirmado: { tom: 'sage', label: 'Confirmado' },
  concluido: { tom: 'success', label: 'Concluído' },
  falta: { tom: 'warning', label: 'Falta' },
  cancelado: { tom: 'neutral', label: 'Cancelado' },
}

export function StatusBadge({ status }: { status: StatusAgendamento }) {
  const { tom, label } = config[status]
  return <Badge tom={tom}>{label}</Badge>
}
