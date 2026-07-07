-- Substitui a unicidade por slot (que limitava 1 agendamento por modalidade/horário)
-- por unicidade por cliente+modalidade+horário. Um slot passa a aceitar até `vagas`
-- clientes distintos; a capacidade é validada na camada de aplicação.

-- DropIndex
DROP INDEX "Agendamento_modalidadeId_dataHora_key";

-- CreateIndex
CREATE INDEX "Agendamento_modalidadeId_dataHora_idx" ON "Agendamento"("modalidadeId", "dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_clienteId_modalidadeId_dataHora_key" ON "Agendamento"("clienteId", "modalidadeId", "dataHora");
