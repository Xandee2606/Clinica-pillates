export interface Usuario {
  id: string
  email: string
  nome: string
  role: string
  criadoEm: string
}

export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  dataNasc: string | null
  observacoes: string | null
  criadoEm: string
}

export interface Modalidade {
  id: string
  nome: string
  descricao: string | null
  duracao: number
  vagas: number
  valor: number
  foto: string | null
  ativa: boolean
}

export type StatusAgendamento = 'confirmado' | 'cancelado' | 'concluido' | 'falta'

export interface Agendamento {
  id: string
  cliente: Cliente
  clienteId: string
  modalidade: Modalidade
  modalidadeId: string
  dataHora: string
  status: StatusAgendamento
  valorCobrado: number | null
  googleEventId: string | null
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface Pagamento {
  id: string
  clienteId: string
  agendamentoId: string | null
  valor: number
  tipo: 'avulso' | 'mensalidade' | 'pacote'
  status: 'pago' | 'pendente' | 'cancelado'
  dataPagamento: string
  observacoes: string | null
  criadoEm: string
}

export interface HorarioFuncionamento {
  id: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  ativo: boolean
}

export interface LoginResponse {
  token: string
  refreshToken: string
  usuario: Usuario
}

export interface ConfiguracaoClinica {
  id?: string
  nome: string
  endereco: string | null
  whatsapp: string | null
  instagram: string | null
}

// ---- Dashboard ----
export interface AgendaItem {
  id: string
  dataHora: string
  status: StatusAgendamento
  observacoes: string | null
  cliente: { id: string; nome: string; telefone: string }
  modalidade: { id: string; nome: string; duracao: number }
}

export interface AgendaResposta {
  data: string
  dias: number
  total: number
  agendamentos: AgendaItem[]
}

export interface ClienteInativo {
  id: string
  nome: string
  telefone: string
  ultimoAgendamento: string
  diasSemVir: number
  totalAgendamentos: number
  frequenciaMediaDias: number
}

export interface InativosResposta {
  dias: number
  total: number
  clientes: ClienteInativo[]
}

export interface ResumoResposta {
  agendamentosHoje: number
  agendamentosSemana: number
  clientesAtivos: number
  receitaMes: number
}

export type StatusSlot = 'fechado' | 'vago' | 'parcial' | 'ocupado'

export interface HorariosVagosResposta {
  semanaInicio: string
  capacidadeHora: number
  horas: number[]
  dias: {
    data: string
    diaSemana: number
    celulas: { hora: number; aberto: boolean; bookings: number; percentual: number; status: StatusSlot }[]
  }[]
}

export interface OcupacaoResposta {
  periodo: number
  horas: number[]
  max: number
  linhas: { diaSemana: number; horas: { hora: number; total: number }[] }[]
}

export interface ReceitaResposta {
  periodo: number
  total: number
  porDia: { data: string; valor: number }[]
  porModalidade: { nome: string; valor: number }[]
}

export interface HistoricoResposta {
  dias: number
  agendamentosPorDia: { data: string; total: number }[]
  novosClientesPorMes: { mes: string; total: number }[]
}

export interface AgendamentoAdmin {
  id: string
  dataHora: string
  status: StatusAgendamento
  valorCobrado: number | null
  observacoes: string | null
  cliente: { id: string; nome: string; telefone: string; email: string }
  modalidade: { id: string; nome: string }
}

export interface AgendamentosPagina {
  page: number
  porPagina: number
  total: number
  totalPaginas: number
  agendamentos: AgendamentoAdmin[]
}

export interface ClienteLista {
  id: string
  nome: string
  email: string
  telefone: string
  totalAgendamentos: number
  ultimaVisita: string | null
  ativo: boolean
}

export interface ClientesResposta {
  filtro: string
  total: number
  clientes: ClienteLista[]
}

export interface PagamentoItem {
  id: string
  clienteId: string
  clienteNome: string
  agendamentoId: string | null
  modalidade: string | null
  valor: number
  tipo: string
  status: string
  dataPagamento: string
  observacoes: string | null
}

export interface PagamentosResposta {
  periodo: number
  total: number
  porTipo: { tipo: string; valor: number }[]
  porModalidade: { nome: string; valor: number }[]
  pagamentos: PagamentoItem[]
}

export interface Pendencia {
  agendamentoId: string
  dataHora: string
  cliente: { id: string; nome: string; telefone: string }
  modalidade: string
  valorCobrado: number | null
}

export interface PendenciasResposta {
  total: number
  totalPendente: number
  pendencias: Pendencia[]
}

export interface PerfilCliente {
  cliente: {
    id: string
    nome: string
    email: string
    telefone: string
    dataNasc: string | null
    observacoes: string | null
    criadoEm: string
  }
  estatisticas: {
    totalAgendamentos: number
    concluidos: number
    faltas: number
    cancelados: number
    ultimaVisita: string | null
    frequenciaMediaDias: number | null
    totalPago: number
    totalEmAulas: number
  }
  historico: {
    id: string
    dataHora: string
    status: StatusAgendamento
    valorCobrado: number | null
    modalidade: { id: string; nome: string }
  }[]
  pagamentos: {
    id: string
    valor: number
    tipo: string
    status: string
    dataPagamento: string
    observacoes: string | null
  }[]
}
