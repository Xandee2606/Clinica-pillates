-- Habilita Row Level Security (RLS) em todas as tabelas.
-- O backend conecta como o role postgres (BYPASSRLS / dono das tabelas), então a
-- aplicação continua funcionando normalmente. Sem políticas definidas, as chaves
-- anon/authenticated da API pública do Supabase (PostgREST) ficam sem acesso aos
-- dados — defesa em profundidade exigida pelo checklist de segurança.
-- NÃO usar FORCE ROW LEVEL SECURITY: forçaria RLS sobre o dono e, sem políticas,
-- bloquearia o próprio backend.

ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cliente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Modalidade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HorarioFuncionamento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agendamento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pagamento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Configuracao" ENABLE ROW LEVEL SECURITY;
