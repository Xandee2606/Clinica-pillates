import { useApi } from '../../hooks/useApi'
import { ModalidadeCard } from './ModalidadeCard'
import { Reveal } from './Reveal'
import type { Modalidade } from '../../types'

export function Modalidades() {
  const { data, loading, error } = useApi<Modalidade[]>('/modalidades')

  return (
    <section id="modalidades" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-sage-500">
            Nossas modalidades
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-sage-900 sm:text-4xl">
            Escolha o formato que combina com você
          </h2>
          <p className="mt-4 font-body text-lg text-sage-600">
            Do solo aos aparelhos, cada aula é conduzida com técnica e atenção ao seu momento.
          </p>
        </Reveal>

        <div className="mt-12">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-sage-100 bg-white"
                />
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-rose-50 p-4 font-body text-sm text-rose-700">
              Não foi possível carregar as modalidades agora. Tente novamente em instantes.
            </p>
          )}

          {data && data.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((m, i) => (
                <Reveal key={m.id} delay={i * 90}>
                  <ModalidadeCard modalidade={m} index={i} />
                </Reveal>
              ))}
            </div>
          )}

          {data && data.length === 0 && (
            <p className="font-body text-sage-600">Nenhuma modalidade disponível no momento.</p>
          )}
        </div>
      </div>
    </section>
  )
}
