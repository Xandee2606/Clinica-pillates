import type { ComponentType, ReactNode, SVGProps } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LeafIcon,
  GridIcon,
  CalendarIcon,
  UsersIcon,
  WalletNavIcon,
  CogIcon,
} from '../ui/icons'

interface NavItem {
  to: string
  label: string
  icone: ComponentType<SVGProps<SVGSVGElement>>
}

const navItens: NavItem[] = [
  { to: '/admin/dashboard', label: 'Início', icone: GridIcon },
  { to: '/admin/agendamentos', label: 'Agenda', icone: CalendarIcon },
  { to: '/admin/clientes', label: 'Clientes', icone: UsersIcon },
  { to: '/admin/financeiro', label: 'Financeiro', icone: WalletNavIcon },
  { to: '/admin/configuracoes', label: 'Ajustes', icone: CogIcon },
]

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sage-100 bg-white lg:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-600 text-cream-50">
            <LeafIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-medium text-sage-900">Painel</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItens.map((item) => {
            const Icone = item.icone
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sage-100 text-sage-800'
                      : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
                  }`
                }
              >
                <Icone className="h-5 w-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-sage-100 p-3">
          <div className="px-3 py-2">
            <p className="truncate font-body text-sm font-medium text-sage-800">{usuario?.nome}</p>
            <p className="truncate font-body text-xs text-sage-500">{usuario?.email}</p>
          </div>
          <button
            onClick={sair}
            className="w-full rounded-xl px-3 py-2 text-left font-body text-sm text-sage-600 transition-colors hover:bg-sage-50"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Topbar — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sage-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-600 text-cream-50">
            <LeafIcon className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-medium text-sage-900">Painel</span>
        </div>
        <button
          onClick={sair}
          className="rounded-full border border-sage-200 px-3 py-1.5 font-body text-sm text-sage-700"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <div className="lg:pl-60">
        <main className="mx-auto max-w-5xl px-4 py-5 pb-24 lg:px-8 lg:py-8">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Bottom navigation — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-sage-100 bg-white/95 backdrop-blur lg:hidden">
        {navItens.map((item) => {
          const Icone = item.icone
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 font-body text-[11px] transition-colors ${
                  isActive ? 'text-sage-700' : 'text-sage-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icone className={`h-5 w-5 ${isActive ? 'text-sage-700' : 'text-sage-400'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
