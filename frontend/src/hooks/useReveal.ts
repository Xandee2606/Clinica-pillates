import { useEffect, useRef, useState } from 'react'

/**
 * Revela o elemento quando ele entra na viewport (scroll reveal sutil).
 * Retorna uma ref para anexar ao elemento e um booleano `visivel`.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respeita usuários que preferem menos movimento.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisivel(true)
      return
    }

    // Navegador sem IntersectionObserver: mostra o conteúdo direto, sem animação.
    // Sem isso, a seção ficaria invisível permanentemente.
    if (typeof IntersectionObserver === 'undefined') {
      setVisivel(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visivel }
}
