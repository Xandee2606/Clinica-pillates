import { Reveal } from './Reveal'

const fotos = [
  {
    src: '/images/clinica/recepcao-espera.jpg',
    alt: 'Recepção com poltronas de espera e mesa de atendimento',
    titulo: 'Recepção',
    legenda: 'Um lugar confortável para chegar sem pressa',
    // Foto mais alta: ocupa duas linhas no desktop e vira o destaque da grade.
    destaque: true,
  },
  {
    src: '/images/clinica/cantinho-cafe.jpg',
    alt: 'Cantinho do café com chás, biscoitos e garrafa térmica',
    titulo: 'Café e chá',
    legenda: 'Fique à vontade antes ou depois da aula',
    destaque: false,
  },
  {
    src: '/images/clinica/sala-atendimento.jpg',
    alt: 'Porta da sala de atendimento individual',
    titulo: 'Sala de atendimento',
    legenda: 'Avaliações e conversas com privacidade',
    destaque: false,
  },
  {
    src: '/images/clinica/corredor-ambientes.jpg',
    alt: 'Corredor com acesso à sala de atendimento, banheiro e copa',
    titulo: 'Estrutura completa',
    legenda: 'Banheiro, copa e tudo sinalizado',
    destaque: false,
  },
]

export function NossoEspaco() {
  return (
    <section id="espaco" className="scroll-mt-20 bg-sage-50/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-body text-sm font-semibold uppercase tracking-wider text-sage-500">
            Nosso espaço
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-sage-900 sm:text-4xl">
            Cada detalhe pensado para o seu conforto
          </h2>
          <p className="mt-4 font-body text-lg text-sage-600">
            Um ambiente limpo, organizado e acolhedor — do momento em que você chega até a hora de ir
            embora.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {fotos.map((foto, i) => (
            <Reveal
              key={foto.src}
              delay={i * 90}
              className={foto.destaque ? 'lg:row-span-2' : ''}
            >
              <figure
                className={`group relative h-full overflow-hidden rounded-2xl shadow-sm shadow-sage-900/5 ${
                  foto.destaque ? 'aspect-[3/4] lg:aspect-auto lg:h-full' : 'aspect-[4/3]'
                }`}
              >
                <img
                  src={foto.src}
                  alt={foto.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-950/75 via-sage-950/10 to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-display text-lg font-medium text-cream-50">{foto.titulo}</p>
                  <p className="font-body text-sm text-cream-100/85">{foto.legenda}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
