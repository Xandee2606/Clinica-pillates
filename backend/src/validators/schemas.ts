import { z } from 'zod'

// ---- Auth ----
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken obrigatório'),
})

// ---- Datas / horários ----
const dataYMD = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')

export const horariosLivresQuerySchema = z.object({
  modalidadeId: z.string().uuid('modalidadeId inválido'),
  data: dataYMD,
})

// ---- Dashboard ----
export const agendaQuerySchema = z.object({
  data: dataYMD.optional(),
  dias: z.coerce.number().int().min(1).max(31).optional(),
})

export const inativosQuerySchema = z.object({
  dias: z.coerce.number().int().min(1).max(365).optional(),
})

export const periodoQuerySchema = z.object({
  // Aceita número de dias (ex.: 30, 60, 90) ou palavra-chave (semana/mes/trimestre).
  periodo: z.string().max(15).optional(),
})

export const historicoQuerySchema = z.object({
  dias: z.coerce.number().int().min(1).max(90).optional(),
})

// ---- Agendamento público ----
export const criarAgendamentoSchema = z.object({
  modalidadeId: z.string().uuid('modalidadeId inválido'),
  dataHora: z.string().datetime({ offset: true, message: 'dataHora deve ser ISO 8601' }),
  cliente: z.object({
    nome: z.string().min(2, 'Nome muito curto').max(120),
    email: z.string().email('E-mail inválido'),
    telefone: z
      .string()
      .min(8, 'Telefone inválido')
      .max(20)
      .regex(/^[0-9()+\-\s]+$/, 'Telefone contém caracteres inválidos'),
  }),
  observacoes: z.string().max(500).optional(),
})

// ---- Admin: listagem de agendamentos ----
export const listaAgendamentosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  status: z.enum(['confirmado', 'cancelado', 'concluido', 'falta']).optional(),
  data: dataYMD.optional(),
  modalidadeId: z.string().uuid().optional(),
  busca: z.string().max(120).optional(),
})

// ---- Admin: mudança de status ----
export const statusAgendamentoSchema = z.object({
  status: z.enum(['confirmado', 'cancelado', 'concluido', 'falta']),
})

// ---- Admin: listagem de clientes ----
export const listaClientesQuerySchema = z.object({
  busca: z.string().max(120).optional(),
  filtro: z.enum(['ativas', 'inativas', 'todas']).optional(),
})

// ---- Admin: listagem de pagamentos ----
export const listaPagamentosQuerySchema = z.object({
  periodo: z.string().max(15).optional(),
})

// ---- Admin: pagamento ----
export const criarPagamentoSchema = z.object({
  clienteId: z.string().uuid(),
  agendamentoId: z.string().uuid().optional(),
  valor: z.number().positive('Valor deve ser positivo'),
  tipo: z.enum(['avulso', 'mensalidade', 'pacote']),
  status: z.enum(['pago', 'pendente', 'cancelado']).optional(),
  observacoes: z.string().max(500).optional(),
})

// ---- Admin: modalidade ----
export const modalidadeSchema = z.object({
  nome: z.string().min(2).max(120),
  descricao: z.string().max(500).optional().nullable(),
  duracao: z.number().int().positive('Duração deve ser positiva'),
  vagas: z.number().int().positive('Vagas deve ser positivo'),
  valor: z.number().nonnegative('Valor inválido'),
  foto: z.string().url('URL de foto inválida').max(500).optional().nullable().or(z.literal('')),
  ativa: z.boolean().optional(),
})

// ---- Admin: horários de funcionamento ----
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve estar em HH:MM')

export const funcionamentoSchema = z.object({
  horarios: z
    .array(
      z.object({
        diaSemana: z.number().int().min(0).max(6),
        horaInicio: hhmm,
        horaFim: hhmm,
        ativo: z.boolean().optional(),
      }),
    )
    .max(7),
})

// ---- Admin: configuração da clínica ----
export const configuracaoSchema = z.object({
  nome: z.string().min(1).max(120),
  endereco: z.string().max(300).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  instagram: z.string().max(120).optional().nullable(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema>
