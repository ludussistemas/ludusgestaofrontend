// ============================================================================
// DTOs DE LOCAL
// ============================================================================

import { SituacaoLocal } from '../enums/situacao-local';

export interface CreateLocalDTO {
  nome: string;
  tipo: string;
  intervalo: number;
  valorHora: number;
  capacidade?: number;
  descricao: string;
  comodidades: string[];
  situacao: SituacaoLocal;
  cor: string;
  horaAbertura: string;
  horaFechamento: string;
}

export interface UpdateLocalDTO {
  nome: string;
  tipo: string;
  intervalo: number;
  valorHora: number;
  capacidade?: number;
  descricao: string;
  comodidades: string[];
  situacao: SituacaoLocal;
  cor: string;
  horaAbertura: string;
  horaFechamento: string;
}
