import { Link } from 'react-router-dom'
import { LeafIcon, WhatsAppIcon, InstagramIcon, MapPinIcon } from '../ui/icons'
import { useClinica } from '../../hooks/useClinica'
import { linkWhatsApp, linkInstagram } from '../../config/clinica'

export function Footer() {
  const { nome, endereco, whatsapp, instagram } = useClinica()
  const ano = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-sage-800 text-cream-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-600 text-cream-50">
              <LeafIcon className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-medium">{nome}</span>
          </div>
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-cream-200/80">
            Movimento consciente, corpo em equilíbrio. Cuidando de você com atenção e método.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base font-medium text-cream-50">Navegação</h3>
          <ul className="mt-4 space-y-2 font-body text-sm">
            <li>
              <a href="/#modalidades" className="text-cream-200/80 hover:text-cream-50">
                Modalidades
              </a>
            </li>
            <li>
              <a href="/#como-funciona" className="text-cream-200/80 hover:text-cream-50">
                Como funciona
              </a>
            </li>
            <li>
              <a href="/#sobre" className="text-cream-200/80 hover:text-cream-50">
                Sobre a clínica
              </a>
            </li>
            <li>
              <Link to="/agendamento" className="text-cream-200/80 hover:text-cream-50">
                Agendar aula
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-medium text-cream-50">Contato</h3>
          <ul className="mt-4 space-y-3 font-body text-sm">
            <li>
              <a
                href={linkWhatsApp(whatsapp, `Olá! Gostaria de saber mais sobre as aulas.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cream-200/80 hover:text-cream-50"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0" />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={linkInstagram(instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cream-200/80 hover:text-cream-50"
              >
                <InstagramIcon className="h-4 w-4 shrink-0" />@{instagram}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-medium text-cream-50">Onde estamos</h3>
          <p className="mt-4 flex items-start gap-2 font-body text-sm text-cream-200/80">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{endereco}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-sage-700/60">
        <p className="mx-auto max-w-6xl px-5 py-6 text-center font-body text-xs text-cream-200/60">
          © {ano} {nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
