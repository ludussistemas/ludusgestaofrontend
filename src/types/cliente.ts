// ============================================================================
// TIPOS DE CLIENTE
// ============================================================================

import { SituacaoCliente } from './enums/situacao-cliente';

export interface Cliente {
  id: string; // GUID
  dataCriacao: string; // Data de criação
  dataAtualizacao: string | null; // Data da última atualização
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes: string;
  situacao: SituacaoCliente; // Enum do backend
  tenantId: number; // ID do tenant
} 