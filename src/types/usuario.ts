import { SituacaoUsuario } from './enums/situacao-usuario';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  situacao: SituacaoUsuario;
  dataCriacao: string;
} 