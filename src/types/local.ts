// ============================================================================
// TIPOS DE LOCAL
// ============================================================================

import { SituacaoLocal } from './enums/situacao-local';
import { TipoLocal } from './enums/tipo-local';

export interface Local {
  id: string; // GUID
  dataCriacao: string; // Data de criação
  dataAtualizacao: string | null; // Data da última atualização
  nome: string;
  tipo: string; // Tipo do local (ex: Quadra, Sala, etc.)
  intervalo: number; // Intervalo em minutos
  valorHora: number; // Valor por hora
  capacidade: number | null; // Capacidade máxima (opcional)
  descricao: string;
  comodidades: string[]; // Lista de comodidades
  situacao: SituacaoLocal; // Enum do backend
  cor: string; // Cor para identificação visual
  horaAbertura: string; // Hora de abertura (formato HH:mm)
  horaFechamento: string; // Hora de fechamento (formato HH:mm)
  filialId: string; // ID da filial
  filial?: any; // Objeto da filial (relacionamento)
  tenantId: number; // ID do tenant
} 