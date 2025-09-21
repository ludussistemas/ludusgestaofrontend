// ============================================================================
// TIPOS DE AUTENTICAÇÃO
// ============================================================================

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiraEm: string;
  usuario: User;
  filiais: Filial[];
}

export interface Filial {
  id: string;
  nome: string;
  codigo: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
  responsavel?: string;
  dataAbertura?: string;
  situacao: 'Ativo' | 'Inativo' | 'Manutencao';
  empresaId: string;
  gruposPermissoes?: GrupoPermissao[];
}

export interface GrupoPermissao {
  id: string;
  nome: string;
  descricao?: string;
  situacao: 'Ativo' | 'Inativo';
}

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  empresaId: string;
  grupoPermissaoId: string;
  situacao: 'Ativo' | 'Inativo';
  ultimoAcesso?: string;
  foto?: string;
  permissoesCustomizadas?: string[];
  dataCriacao: string;
} 