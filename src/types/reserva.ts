// ============================================================================
// TIPOS DE RESERVA
// ============================================================================

import { SituacaoReserva } from './enums/situacao-reserva';

export interface Reserva {
  id: string; // GUID
  dataCriacao: string; // Data de criação
  dataAtualizacao: string | null; // Data da última atualização
  clienteId: string; // ID do cliente
  cliente?: any; // Objeto do cliente (relacionamento)
  localId: string; // ID do local
  local?: any; // Objeto do local (relacionamento)
  usuarioId: string | null; // ID do usuário (opcional)
  usuario?: any; // Objeto do usuário (relacionamento)
  dataInicio: string; // Data e hora de início em ISO
  dataFim: string; // Data e hora de fim em ISO
  situacao: SituacaoReserva; // Enum do backend
  cor: string | null; // Cor para identificação visual (opcional)
  esporte: string | null; // Esporte/atividade (opcional)
  observacoes: string | null; // Observações (opcional)
  valor: number; // Valor da reserva
  filialId: string; // ID da filial
  tenantId: number; // ID do tenant
} 