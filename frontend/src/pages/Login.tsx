import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { LeafIcon, ArrowLeftIcon } from '../components/ui/icons'

const loginFormSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

type LoginForm = z.infer<typeof loginFormSchema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginFormSchema) })

  async function onSubmit({ email, senha }: LoginForm) {
    setErro(null)
    setCarregando(true)
    try {
      await login(email, senha)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      const msg = (err as AxiosError<{ message?: string }>).response?.data?.message
      setErro(msg ?? 'Não foi possível entrar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage-600 text-cream-50">
            <LeafIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-medium tracking-tight text-sage-900">
            Painel administrativo
          </h1>
          <p className="mt-1 font-body text-sm text-sage-600">Entre para gerenciar a clínica</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 rounded-2xl border border-sage-100 bg-white p-6 shadow-sm shadow-sage-900/[0.03]"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">
                E-mail
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`w-full rounded-xl border bg-white px-4 py-2.5 font-body text-sage-800 outline-none transition-colors focus:ring-2 ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                    : 'border-sage-200 focus:border-sage-500 focus:ring-sage-200'
                }`}
              />
              {errors.email && (
                <p className="mt-1 font-body text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-body text-sm font-medium text-sage-700">
                Senha
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('senha')}
                className={`w-full rounded-xl border bg-white px-4 py-2.5 font-body text-sage-800 outline-none transition-colors focus:ring-2 ${
                  errors.senha
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                    : 'border-sage-200 focus:border-sage-500 focus:ring-sage-200'
                }`}
              />
              {errors.senha && (
                <p className="mt-1 font-body text-xs text-rose-600">{errors.senha.message}</p>
              )}
            </div>
          </div>

          {erro && (
            <p className="mt-4 rounded-xl bg-rose-50 p-3 font-body text-sm text-rose-700">{erro}</p>
          )}

          <Button type="submit" disabled={carregando} className="mt-6 w-full">
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-body text-sm text-sage-600 hover:text-sage-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar para o site
          </Link>
        </div>
      </div>
    </main>
  )
}
