// ============================================================================
// DTOs DE CLIENTE
// ============================================================================

import { SituacaoCliente } from '../enums/situacao-cliente';

export interface CreateClienteDTO {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes: string;
  situacao: SituacaoCliente;
}

export interface UpdateClienteDTO {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  observacoes: string;
  situacao: SituacaoCliente;
}
