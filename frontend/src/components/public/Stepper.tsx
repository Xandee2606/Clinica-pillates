import { CheckIcon } from '../ui/icons'

const rotulos = ['Modalidade', 'Data e horário', 'Seus dados', 'Confirmação']

interface Props {
  passoAtual: number // 1..4
}

export function Stepper({ passoAtual }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center">
        {rotulos.map((rotulo, i) => {
          const passo = i + 1
          const concluido = passo < passoAtual
          const ativo = passo === passoAtual
          return (
            <div key={rotulo} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 font-body text-sm font-semibold transition-colors ${
                    concluido
                      ? 'border-sage-600 bg-sage-600 text-cream-50'
                      : ativo
                        ? 'border-sage-600 bg-cream-50 text-sage-700'
                        : 'border-sage-200 bg-cream-50 text-sage-400'
                  }`}
                >
                  {concluido ? <CheckIcon className="h-4 w-4" /> : passo}
                </div>
                <span
                  className={`mt-2 hidden text-center font-body text-xs sm:block ${
                    ativo ? 'font-medium text-sage-800' : 'text-sage-500'
                  }`}
                >
                  {rotulo}
                </span>
              </div>
              {passo < rotulos.length && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded transition-colors ${
                    concluido ? 'bg-sage-600' : 'bg-sage-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-center font-body text-sm text-sage-500 sm:hidden">
        Passo {passoAtual} de {rotulos.length}: <span className="font-medium text-sage-700">{rotulos[passoAtual - 1]}</span>
      </p>
    </div>
  )
}
