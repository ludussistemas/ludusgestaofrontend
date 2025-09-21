// ============================================================================
// TIPOS DE RECEBÍVEL
// ============================================================================

import { SituacaoRecebivel } from './enums/situacao-recebivel';

export type StatusRecebivel = 'pendente' | 'pago' | 'vencido';

export interface Recebivel {
  id: string; // GUID
  reservaId: string;
  valor: number;
  dataVencimento: string;
  situacao: SituacaoRecebivel; // Enum do backend
  dataCriacao: string; // Padronizado com backend
} 