// ============================================================================
// TIPOS DE LOCAL
// ============================================================================

import { SituacaoLocal } from './enums/situacao-local';
import { TipoLocal } from './enums/tipo-local';

export interface Local {
  id: string; // GUID
  nome: string;
  tipo: TipoLocal;
  intervalo: number;
  valorHora: number;
  capacidade: number;
  descricao: string;
  comodidades: string[];
  situacao: SituacaoLocal; // Enum do backend
  cor: string;
  horaAbertura: string;
  horaFechamento: string;
  filialId: string;
  dataCriacao: string; // Padronizado com backend
} 