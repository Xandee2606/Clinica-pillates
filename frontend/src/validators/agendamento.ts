import { z } from 'zod'

export const clienteFormSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome completo').max(120),
  email: z.string().email('E-mail inválido'),
  telefone: z
    .string()
    .min(8, 'Telefone inválido')
    .max(20)
    .regex(/^[0-9()+\-\s]+$/, 'Use apenas números e (), +, -'),
  observacoes: z.string().max(500).optional(),
})

export type ClienteForm = z.infer<typeof clienteFormSchema>
