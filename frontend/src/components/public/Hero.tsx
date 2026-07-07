import { LinkButton } from '../ui/Button'
import { ArrowRightIcon, LeafIcon, SparkleIcon } from '../ui/icons'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fundo orgânico */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sage-200/40 blur-3xl" />
        <div className="absolute -left-32 top-40 h-80 w-80 rounded-full bg-clay-400/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-2 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/60 px-4 py-1.5 font-body text-sm text-sage-700">
            <LeafIcon className="h-4 w-4" />
            Studio de Pilates &amp; bem-estar
          </span>

          <h1 className="mt-6 font-display text-4xl font-medium leading-[1.05] tracking-tight text-sage-900 sm:text-5xl lg:text-6xl">
            Seu corpo lembra
            <br />
            <span className="text-sage-600">como é se sentir bem.</span>
          </h1>

          <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-sage-700/90">
            Aulas de pilates com método, atenção individual e o tempo que o seu corpo pede. Reserve
            seu horário em menos de um minuto.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/agendamento" tamanho="lg">
              Agendar agora
              <ArrowRightIcon className="h-5 w-5" />
            </LinkButton>
            <LinkButton href="/#modalidades" variante="secondary" tamanho="lg">
              Ver modalidades
            </LinkButton>
          </div>

          <div className="mt-10 flex items-center gap-6 font-body text-sm text-sage-600">
            <div>
              <p className="font-display text-2xl font-medium text-sage-800">+300</p>
              <p className="text-sage-600/80">aulas por mês</p>
            </div>
            <div className="h-8 w-px bg-sage-200" />
            <div>
              <p className="font-display text-2xl font-medium text-sage-800">3</p>
              <p className="text-sage-600/80">modalidades</p>
            </div>
            <div className="h-8 w-px bg-sage-200" />
            <div>
              <p className="font-display text-2xl font-medium text-sage-800">1:1</p>
              <p className="text-sage-600/80">atenção real</p>
            </div>
          </div>
        </div>

        {/* Composição visual */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-gradient-to-br from-sage-300 via-sage-400 to-sage-600 shadow-xl shadow-sage-900/20">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_45%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <SparkleIcon className="h-8 w-8 text-cream-50/90" />
              <p className="mt-3 font-display text-2xl font-medium leading-snug text-cream-50">
                Movimento consciente, corpo em equilíbrio.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-sage-100 bg-white px-5 py-4 shadow-lg shadow-sage-900/10 sm:block">
            <p className="font-display text-sm font-medium text-sage-800">Ambiente acolhedor</p>
            <p className="font-body text-xs text-sage-600">pensado para o seu ritmo</p>
          </div>
        </div>
      </div>
    </section>
  )
}
