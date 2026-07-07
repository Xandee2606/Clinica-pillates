import { Reveal } from './Reveal'
import { LinkButton } from '../ui/Button'
import { CheckIcon, ArrowRightIcon } from '../ui/icons'

const diferenciais = [
  'Turmas reduzidas para atenção individual',
  'Profissionais qualificadas e acolhedoras',
  'Ambiente calmo, limpo e bem equipado',
  'Acompanhamento da sua evolução',
]

export function Sobre() {
  return (
    <section id="sobre" className="scroll-mt-20 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream-200 via-cream-300 to-clay-400/60 shadow-lg shadow-sage-900/10">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_25%_75%,white,transparent_55%)]" />
            <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 px-5 py-4 shadow-sm">
              <p className="font-display text-lg font-medium text-sage-800">Feito para o seu corpo</p>
              <p className="font-body text-sm text-sage-600">no seu tempo, com método</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wider text-sage-500">
              Sobre a clínica
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-sage-900 sm:text-4xl">
              Um espaço para reencontrar o bem-estar
            </h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-sage-600">
              Acreditamos que cuidar do corpo é um ato de presença. Nossas aulas unem a técnica do
              pilates a um olhar atento para cada aluno, respeitando limites e celebrando cada
              avanço.
            </p>

            <ul className="mt-6 space-y-3">
              {diferenciais.map((d) => (
                <li key={d} className="flex items-start gap-3 font-body text-sage-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-100 text-sage-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {d}
                </li>
              ))}
            </ul>

            <LinkButton to="/agendamento" className="mt-8">
              Agendar minha primeira aula
              <ArrowRightIcon className="h-5 w-5" />
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
