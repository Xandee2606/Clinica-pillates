import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons'
import { ehFeriado } from '../../config/feriados'
import { hojeYMD, gerarGradeMes, diaSemana, NOMES_MESES } from '../../lib/datas'

const diasSemanaLabel = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface Props {
  selecionada: string | null
  onSelecionar: (ymd: string) => void
}

export function Calendar({ selecionada, onSelecionar }: Props) {
  const hoje = hojeYMD()
  const [ano, mes] = hoje.split('-').map(Number)

  const [visao, setVisao] = useState({ ano, mes0: mes - 1 })

  const grade = gerarGradeMes(visao.ano, visao.mes0)
  const mesMinimo = { ano, mes0: mes - 1 }
  const podeVoltar = visao.ano > mesMinimo.ano || visao.mes0 > mesMinimo.mes0

  function mudarMes(delta: number) {
    setVisao((v) => {
      const d = new Date(Date.UTC(v.ano, v.mes0 + delta, 1))
      return { ano: d.getUTCFullYear(), mes0: d.getUTCMonth() }
    })
  }

  function estaBloqueada(cel: (typeof grade)[number]): boolean {
    if (!cel.mesAtual) return true
    if (cel.ymd < hoje) return true // datas passadas
    if (diaSemana(cel.ymd) === 0) return true // domingos
    if (ehFeriado(cel.ymd)) return true // feriados
    return false
  }

  return (
    <div className="rounded-2xl border border-sage-100 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => mudarMes(-1)}
          disabled={!podeVoltar}
          className="grid h-9 w-9 place-items-center rounded-full text-sage-600 transition-colors hover:bg-sage-50 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Mês anterior"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="font-display text-lg font-medium text-sage-900">
          {NOMES_MESES[visao.mes0]} {visao.ano}
        </p>
        <button
          onClick={() => mudarMes(1)}
          className="grid h-9 w-9 place-items-center rounded-full text-sage-600 transition-colors hover:bg-sage-50"
          aria-label="Próximo mês"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {diasSemanaLabel.map((d, i) => (
          <div key={i} className="text-center font-body text-xs font-medium text-sage-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grade.map((cel, i) => {
          const bloqueada = estaBloqueada(cel)
          const selec = cel.ymd === selecionada
          return (
            <button
              key={`${cel.ymd}-${i}`}
              disabled={bloqueada}
              onClick={() => onSelecionar(cel.ymd)}
              className={`aspect-square rounded-lg font-body text-sm transition-colors ${
                selec
                  ? 'bg-sage-600 font-semibold text-cream-50'
                  : bloqueada
                    ? 'cursor-not-allowed text-sage-300'
                    : 'text-sage-700 hover:bg-sage-100'
              } ${!cel.mesAtual ? 'invisible' : ''}`}
            >
              {cel.dia}
            </button>
          )
        })}
      </div>

      <p className="mt-4 font-body text-xs text-sage-400">
        Domingos e feriados não têm atendimento.
      </p>
    </div>
  )
}
