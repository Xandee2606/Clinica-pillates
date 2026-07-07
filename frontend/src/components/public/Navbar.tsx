import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LinkButton } from '../ui/Button'
import { LeafIcon, MenuIcon, CloseIcon } from '../ui/icons'
import { useClinica } from '../../hooks/useClinica'

const links = [
  { label: 'Modalidades', href: '/#modalidades' },
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Sobre', href: '/#sobre' },
]

export function Navbar() {
  const { nome } = useClinica()
  const [aberto, setAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-cream-50/85 backdrop-blur-md border-b border-sage-100' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 text-sage-800">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-600 text-cream-50">
            <LeafIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight">{nome}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-body text-sm text-sage-700 transition-colors hover:text-sage-900"
            >
              {l.label}
            </a>
          ))}
          <LinkButton to="/agendamento" tamanho="sm">
            Agendar agora
          </LinkButton>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full text-sage-700 hover:bg-sage-50 md:hidden"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        >
          {aberto ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {aberto && (
        <div className="border-t border-sage-100 bg-cream-50 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className="rounded-lg px-3 py-2.5 font-body text-sage-700 hover:bg-sage-50"
              >
                {l.label}
              </a>
            ))}
            <LinkButton to="/agendamento" className="mt-2 w-full" onClick={() => setAberto(false)}>
              Agendar agora
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  )
}
