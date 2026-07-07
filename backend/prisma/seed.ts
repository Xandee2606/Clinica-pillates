import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ---- Usuário admin ----
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos no .env')
  }

  const senhaHash = await bcrypt.hash(adminPassword, 12)

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      senha: senhaHash,
      nome: 'Administradora',
      role: 'admin',
    },
  })
  console.log(`✔ Admin garantido: ${adminEmail}`)

  // ---- Modalidades ----
  const modalidades: Prisma.ModalidadeCreateInput[] = [
    {
      nome: 'Pilates Solo',
      descricao: 'Aula individual no solo, foco em controle e respiração.',
      duracao: 50,
      vagas: 1,
      valor: new Prisma.Decimal('80.00'),
    },
    {
      nome: 'Pilates em Grupo',
      descricao: 'Aula em grupo, energia e motivação compartilhadas.',
      duracao: 60,
      vagas: 5,
      valor: new Prisma.Decimal('50.00'),
    },
    {
      nome: 'Pilates Aparelho',
      descricao: 'Aula nos aparelhos (reformer, cadillac), atenção personalizada.',
      duracao: 50,
      vagas: 2,
      valor: new Prisma.Decimal('100.00'),
    },
  ]

  for (const m of modalidades) {
    const existente = await prisma.modalidade.findFirst({ where: { nome: m.nome } })
    if (!existente) {
      await prisma.modalidade.create({ data: m })
      console.log(`✔ Modalidade criada: ${m.nome}`)
    } else {
      console.log(`• Modalidade já existe: ${m.nome}`)
    }
  }

  // ---- Horários de funcionamento ----
  // Segunda(1) a sexta(5): 07:00–20:00; Sábado(6): 08:00–13:00
  const horarios = [
    { diaSemana: 1, horaInicio: '07:00', horaFim: '20:00' },
    { diaSemana: 2, horaInicio: '07:00', horaFim: '20:00' },
    { diaSemana: 3, horaInicio: '07:00', horaFim: '20:00' },
    { diaSemana: 4, horaInicio: '07:00', horaFim: '20:00' },
    { diaSemana: 5, horaInicio: '07:00', horaFim: '20:00' },
    { diaSemana: 6, horaInicio: '08:00', horaFim: '13:00' },
  ]

  for (const h of horarios) {
    const existente = await prisma.horarioFuncionamento.findFirst({
      where: { diaSemana: h.diaSemana },
    })
    if (!existente) {
      await prisma.horarioFuncionamento.create({ data: h })
      console.log(`✔ Horário criado: dia ${h.diaSemana} (${h.horaInicio}-${h.horaFim})`)
    } else {
      console.log(`• Horário já existe: dia ${h.diaSemana}`)
    }
  }

  // ---- Configuração da clínica (registro único) ----
  const configExistente = await prisma.configuracao.findFirst()
  if (!configExistente) {
    await prisma.configuracao.create({
      data: {
        nome: process.env.CLINICA_NOME ?? '[NOME DA CLÍNICA]',
        endereco: process.env.CLINICA_ENDERECO ?? null,
        whatsapp: process.env.CLINICA_WHATSAPP ?? null,
        instagram: process.env.CLINICA_INSTAGRAM ?? null,
      },
    })
    console.log('✔ Configuração da clínica criada')
  } else {
    console.log('• Configuração da clínica já existe')
  }

  console.log('\nSeed concluído com sucesso.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
