// ============================================================================
// TIPOS DE RESERVA
// ============================================================================

import { SituacaoReserva } from './enums/situacao-reserva';

export interface Reserva {
  id: string; // GUID
  dataCriacao: string;
  dataAtualizacao: string | null;
  clienteId: string;
  cliente: any | null; // Relacionamento
  localId: string;
  local: any | null; // Relacionamento
  usuarioId: string | null;
  usuario: any | null; // Relacionamento
  dataInicio: string; // Data e hora de início em ISO
  dataFim: string; // Data e hora de fim em ISO
  situacao: SituacaoReserva; // Enum do backend
  cor: string | null;
  esporte: string | null;
  observacoes: string;
  valor: number;
  filialId: string;
  tenantId: number;
} 