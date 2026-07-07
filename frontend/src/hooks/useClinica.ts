import { useApi } from './useApi'
import { CLINICA_FALLBACK } from '../config/clinica'

interface ClinicaConfig {
  nome: string
  endereco: string | null
  whatsapp: string | null
  instagram: string | null
}

/**
 * Busca os dados públicos da clínica, aplicando fallbacks para campos vazios.
 */
export function useClinica() {
  const { data } = useApi<ClinicaConfig>('/configuracoes')

  return {
    nome: data?.nome || CLINICA_FALLBACK.nome,
    endereco: data?.endereco || CLINICA_FALLBACK.endereco,
    whatsapp: data?.whatsapp || CLINICA_FALLBACK.whatsapp,
    instagram: data?.instagram || CLINICA_FALLBACK.instagram,
  }
}
