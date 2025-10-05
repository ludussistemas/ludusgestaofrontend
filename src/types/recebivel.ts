// ============================================================================
// TIPOS DE RECEBÍVEL
// ============================================================================

import { SituacaoRecebivel } from './enums/situacao-recebivel';

export interface Recebivel {
  id: string; // GUID
  dataCriacao: string; // Data de criação
  dataAtualizacao: string | null; // Data da última atualização
  clienteId: string; // ID do cliente
  cliente?: any; // Objeto do cliente (relacionamento)
  reservaId: string | null; // ID da reserva relacionada (opcional)
  reserva?: any; // Objeto da reserva (relacionamento)
  descricao: string; // Descrição do recebível
  valor: number; // Valor do recebível
  dataVencimento: string; // Data de vencimento
  situacao: SituacaoRecebivel; // Enum do backend
  tenantId: number; // ID do tenant
} 