import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

/** Remove todos os dados criados pelo seed de desenvolvimento (@dev.local). */
const prisma = new PrismaClient()

async function main() {
  const clientes = await prisma.cliente.findMany({
    where: { email: { endsWith: '@dev.local' } },
    select: { id: true },
  })
  const ids = clientes.map((c) => c.id)

  const ag = await prisma.agendamento.deleteMany({ where: { clienteId: { in: ids } } })
  const cl = await prisma.cliente.deleteMany({ where: { id: { in: ids } } })

  console.log(`✔ Removidos ${ag.count} agendamentos e ${cl.count} clientes de dev.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
