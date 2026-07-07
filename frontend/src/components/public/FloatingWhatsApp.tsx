import { WhatsAppIcon } from '../ui/icons'
import { useClinica } from '../../hooks/useClinica'
import { linkWhatsApp } from '../../config/clinica'

/**
 * Botão flutuante de WhatsApp, fixo no canto inferior direito do site público.
 * Leva direto para a conversa com a clínica.
 */
export function FloatingWhatsApp() {
  const { whatsapp, nome } = useClinica()
  const href = linkWhatsApp(whatsapp, `Olá! Vim pelo site da ${nome} e gostaria de mais informações.`)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a clínica no WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-3 text-white shadow-lg shadow-[#25D366]/30 transition-all hover:pr-5 hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      {/* Anel de destaque pulsante */}
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
      <WhatsAppIcon className="h-7 w-7 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-body text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-[10rem] group-hover:opacity-100">
        Fale conosco
      </span>
    </a>
  )
}
