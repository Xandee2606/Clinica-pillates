import { Reveal } from './Reveal'
import { LeafIcon, CalendarIcon, SparkleIcon } from '../ui/icons'

const passos = [
  {
    icone: LeafIcon,
    titulo: 'Escolha a modalidade',
    texto: 'Solo, em grupo ou nos aparelhos — encontre o formato ideal para o seu objetivo.',
  },
  {
    icone: CalendarIcon,
    titulo: 'Reserve seu horário',
    texto: 'Veja os horários livres em tempo real e agende em poucos toques, sem ligações.',
  },
  {
    icone: SparkleIcon,
    titulo: 'Venha se movimentar',
    texto: 'Você recebe a confirmação por e-mail e é só chegar. O resto é com a gente.',
  },
]

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-sage-50/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-sage-500">
            Como funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-sage-900 sm:text-4xl">
            Simples do começo ao fim
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {passos.map((p, i) => {
            const Icone = p.icone
            return (
              <Reveal key={p.titulo} delay={i * 120}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm shadow-sage-900/5 ring-1 ring-sage-100">
                    <Icone className="h-7 w-7 text-sage-600" />
                    <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-sage-600 font-body text-sm font-semibold text-cream-50">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium text-sage-900">{p.titulo}</h3>
                  <p className="mt-2 max-w-xs font-body text-sage-600">{p.texto}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
