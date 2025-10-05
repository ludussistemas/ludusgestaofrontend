// ============================================================================
// DTOs DE RECEBÍVEL
// ============================================================================

import { SituacaoRecebivel } from '../enums/situacao-recebivel';

export interface CreateRecebivelDTO {
  clienteId: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  situacao: SituacaoRecebivel;
  reservaId?: string;
}

export interface UpdateRecebivelDTO {
  clienteId: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  situacao: SituacaoRecebivel;
  reservaId?: string;
}
