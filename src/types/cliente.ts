// ============================================================================
// TIPOS DE CLIENTE
// ============================================================================

import { SituacaoCliente } from './enums/situacao-cliente';

export interface Cliente {
  id: string; // GUID
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes: string;
  situacao: SituacaoCliente; // Enum do backend
  dataCriacao: string; // Padronizado com backend
} 