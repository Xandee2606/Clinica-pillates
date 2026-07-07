import { useAuth } from '../../hooks/useAuth'
import { BlocoResumo } from '../../components/admin/BlocoResumo'
import { BlocoAgenda } from '../../components/admin/BlocoAgenda'
import { BlocoInativos } from '../../components/admin/BlocoInativos'
import { BlocoHorariosVagos } from '../../components/admin/BlocoHorariosVagos'
import { BlocoHeatmap } from '../../components/admin/BlocoHeatmap'
import { BlocoReceita } from '../../components/admin/BlocoReceita'
import { BlocoHistorico } from '../../components/admin/BlocoHistorico'

export default function Dashboard() {
  const { usuario } = useAuth()
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? ''

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-sage-900">
          Olá{primeiroNome ? `, ${primeiroNome}` : ''} 🌿
        </h1>
        <p className="mt-1 font-body text-sage-600">Aqui está o resumo da sua clínica hoje.</p>
      </div>

      {/* Bloco 1 — Resumo rápido */}
      <BlocoResumo />

      {/* Blocos 2 e 3 — Agenda do dia + Clientes inativos */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BlocoAgenda />
        <BlocoInativos />
      </div>

      {/* Bloco 4 — Horários vagos da semana */}
      <BlocoHorariosVagos />

      {/* Bloco 5 — Heatmap de ocupação histórica */}
      <BlocoHeatmap />

      {/* Bloco 6 — Receita */}
      <BlocoReceita />

      {/* Bloco 7 — Histórico */}
      <BlocoHistorico />
    </div>
  )
}
