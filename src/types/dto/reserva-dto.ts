// ============================================================================
// DTOs DE RESERVA
// ============================================================================

import { SituacaoReserva } from '../enums/situacao-reserva';

export interface CreateReservaDTO {
  clienteId: string;
  localId: string;
  usuarioId?: string;
  dataInicio: string;
  dataFim: string;
  situacao: SituacaoReserva;
  cor?: string;
  esporte?: string;
  observacoes?: string;
  valor: number;
}

export interface UpdateReservaDTO {
  clienteId: string;
  localId: string;
  usuarioId?: string;
  dataInicio: string;
  dataFim: string;
  situacao: SituacaoReserva;
  cor?: string;
  esporte?: string;
  observacoes?: string;
  valor: number;
}
