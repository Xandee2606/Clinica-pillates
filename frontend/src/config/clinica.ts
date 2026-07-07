/**
 * Constantes e helpers da clínica para o site público.
 *
 * Os dados reais (nome, endereço, WhatsApp, Instagram) vêm da API
 * (`GET /api/configuracoes`). Estes valores são apenas fallback para quando a
 * configuração ainda não foi preenchida no painel admin.
 */

export const CLINICA_FALLBACK = {
  nome: '[NOME DA CLÍNICA]',
  endereco: 'Rua Exemplo, 123 — Bairro, Cidade/UF',
  // Apenas dígitos, com DDI 55. Ex.: 5511999998888
  whatsapp: '5599999999999',
  instagram: 'nomedaclinica',
}

/** Remove tudo que não for dígito de um telefone. */
export function apenasDigitos(telefone: string): string {
  return telefone.replace(/\D/g, '')
}

/**
 * Monta um link do WhatsApp. Garante o DDI 55 e permite mensagem pré-formatada.
 */
export function linkWhatsApp(telefone: string, mensagem?: string): string {
  let numero = apenasDigitos(telefone)
  if (!numero.startsWith('55')) {
    numero = `55${numero}`
  }
  const base = `https://wa.me/${numero}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

/** Monta o link do perfil no Instagram a partir do handle (com ou sem @). */
export function linkInstagram(handle: string): string {
  const limpo = handle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
  return `https://instagram.com/${limpo}`
}
