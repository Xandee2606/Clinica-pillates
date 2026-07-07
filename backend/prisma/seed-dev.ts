import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { paraInstante, hojeClinicaYMD, adicionarDias } from '../src/lib/horarios'

/**
 * Seed de DESENVOLVIMENTO — popula clientes e agendamentos realistas para testar
 * o dashboard (agenda do dia e clientes inativos). Todos os clientes usam e-mail
 * "@dev.local" para poderem ser removidos com `npm run seed:dev:limpar`.
 *
 * NÃO usar em produção.
 */

const prisma = new PrismaClient()

const MARCADOR = '@dev.local'

interface AgDef {
  cliente: string
  ymd: string
  hora: string
  modalidade: 'Pilates Solo' | 'Pilates em Grupo' | 'Pilates Aparelho'
  status: 'confirmado' | 'cancelado' | 'concluido' | 'falta'
}

async function main() {
  const hoje = hojeClinicaYMD()
  const amanha = adicionarDias(hoje, 1)
  const d = (n: number) => adicionarDias(hoje, n)

  // Datas passadas (relativas a hoje) para clientes inativos.
  const p = (n: number) => adicionarDias(hoje, -n)

  const clientes: Record<string, { email: string; telefone: string }> = {
    'Ana Souza': { email: 'ana.souza' + MARCADOR, telefone: '11991110001' },
    'Bruna Lima': { email: 'bruna.lima' + MARCADOR, telefone: '11991110002' },
    'Carla Dias': { email: 'carla.dias' + MARCADOR, telefone: '11991110003' },
    'Ivo Santos': { email: 'ivo.santos' + MARCADOR, telefone: '11991110004' },
    'Helena Pinto': { email: 'helena.pinto' + MARCADOR, telefone: '11991110005' },
    'João Mendes': { email: 'joao.mendes' + MARCADOR, telefone: '11991110006' },
    // Inativos:
    'Diana Melo': { email: 'diana.melo' + MARCADOR, telefone: '11991110007' },
    'Eduarda Reis': { email: 'eduarda.reis' + MARCADOR, telefone: '11991110008' },
    'Fernanda Alves': { email: 'fernanda.alves' + MARCADOR, telefone: '11991110009' },
    // Borda (não deve aparecer como inativo):
    'Gabi Nunes': { email: 'gabi.nunes' + MARCADOR, telefone: '11991110010' },
  }

  const agendamentos: AgDef[] = [
    // ---- HOJE (agenda do dia, variedade de status) ----
    { cliente: 'Ana Souza', ymd: hoje, hora: '08:00', modalidade: 'Pilates Solo', status: 'concluido' },
    { cliente: 'Ivo Santos', ymd: hoje, hora: '09:00', modalidade: 'Pilates em Grupo', status: 'confirmado' },
    { cliente: 'Bruna Lima', ymd: hoje, hora: '09:00', modalidade: 'Pilates Solo', status: 'confirmado' },
    { cliente: 'Carla Dias', ymd: hoje, hora: '10:00', modalidade: 'Pilates Aparelho', status: 'confirmado' },
    { cliente: 'João Mendes', ymd: hoje, hora: '11:00', modalidade: 'Pilates em Grupo', status: 'cancelado' },
    { cliente: 'Ana Souza', ymd: hoje, hora: '14:00', modalidade: 'Pilates em Grupo', status: 'confirmado' },
    { cliente: 'Helena Pinto', ymd: hoje, hora: '16:00', modalidade: 'Pilates Solo', status: 'falta' },

    // ---- AMANHÃ ----
    { cliente: 'Bruna Lima', ymd: amanha, hora: '08:00', modalidade: 'Pilates Solo', status: 'confirmado' },
    { cliente: 'Carla Dias', ymd: amanha, hora: '09:00', modalidade: 'Pilates em Grupo', status: 'confirmado' },

    // ---- PRÓXIMOS 7 DIAS ----
    { cliente: 'Carla Dias', ymd: d(3), hora: '07:00', modalidade: 'Pilates Solo', status: 'confirmado' },
    { cliente: 'Ana Souza', ymd: d(5), hora: '10:00', modalidade: 'Pilates Aparelho', status: 'confirmado' },
    { cliente: 'Ivo Santos', ymd: d(6), hora: '18:00', modalidade: 'Pilates em Grupo', status: 'confirmado' },

    // ---- INATIVOS (2+ históricos, último > 15 dias, sem futuro) ----
    { cliente: 'Diana Melo', ymd: p(39), hora: '09:00', modalidade: 'Pilates Solo', status: 'concluido' },
    { cliente: 'Diana Melo', ymd: p(32), hora: '09:00', modalidade: 'Pilates Solo', status: 'concluido' },

    { cliente: 'Eduarda Reis', ymd: p(51), hora: '10:00', modalidade: 'Pilates Solo', status: 'concluido' },
    { cliente: 'Eduarda Reis', ymd: p(44), hora: '10:00', modalidade: 'Pilates Solo', status: 'concluido' },
    { cliente: 'Eduarda Reis', ymd: p(37), hora: '10:00', modalidade: 'Pilates Solo', status: 'concluido' },

    { cliente: 'Fernanda Alves', ymd: p(31), hora: '11:00', modalidade: 'Pilates em Grupo', status: 'concluido' },
    { cliente: 'Fernanda Alves', ymd: p(24), hora: '11:00', modalidade: 'Pilates em Grupo', status: 'concluido' },

    // ---- BORDA: só 1 histórico (não deve aparecer como inativo) ----
    { cliente: 'Gabi Nunes', ymd: p(28), hora: '15:00', modalidade: 'Pilates Solo', status: 'concluido' },

    // ---- BORDA: Helena tem histórico recente (hoje/falta) => ativa ----
    { cliente: 'Helena Pinto', ymd: p(10), hora: '16:00', modalidade: 'Pilates Solo', status: 'concluido' },
  ]

  // Modalidades por nome.
  const mods = await prisma.modalidade.findMany()
  const modPorNome = new Map(mods.map((m) => [m.nome, m]))

  // Limpa dados de dev anteriores.
  const antigos = await prisma.cliente.findMany({
    where: { email: { endsWith: MARCADOR } },
    select: { id: true },
  })
  const idsAntigos = antigos.map((c) => c.id)
  if (idsAntigos.length) {
    await prisma.agendamento.deleteMany({ where: { clienteId: { in: idsAntigos } } })
    await prisma.cliente.deleteMany({ where: { id: { in: idsAntigos } } })
  }

  // Cria clientes.
  const clientePorNome = new Map<string, string>()
  for (const [nome, dados] of Object.entries(clientes)) {
    const c = await prisma.cliente.create({
      data: { nome, email: dados.email, telefone: dados.telefone },
    })
    clientePorNome.set(nome, c.id)
  }

  // Cria agendamentos.
  let criados = 0
  for (const a of agendamentos) {
    const mod = modPorNome.get(a.modalidade)
    const clienteId = clientePorNome.get(a.cliente)
    if (!mod || !clienteId) continue

    await prisma.agendamento.create({
      data: {
        clienteId,
        modalidadeId: mod.id,
        dataHora: paraInstante(a.ymd, a.hora),
        status: a.status,
        valorCobrado: mod.valor as unknown as Prisma.Decimal,
      },
    })
    criados++
  }

  console.log(`✔ ${clientePorNome.size} clientes e ${criados} agendamentos de dev criados.`)
  console.log(`  (hoje = ${hoje})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
