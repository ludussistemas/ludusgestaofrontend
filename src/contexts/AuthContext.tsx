import { api, ApiResponse } from '@/lib/api';
import type { Filial, LoginResponse, User } from '@/types/auth';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Interfaces baseadas na estrutura hierárquica do backend
interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  situacao: 'Ativo' | 'Inativo';
  tenantId: number;
}

interface AuthContextType {
  user: User | null;
  empresa: Empresa | null;
  filiais: Filial[];
  filialAtual: Filial | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  setFilialAtual: (filial: Filial | null) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função auxiliar para fazer parse seguro de JSON
const safeJsonParse = <T,>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Erro ao fazer parse de JSON:', error);
    return defaultValue;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [filialAtual, setFilialAtual] = useState<Filial | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Busca dados completos do usuário (empresa)
  const fetchUserCompleteData = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Carregando dados completos do usuário...');
      
      // Buscar dados da empresa se o usuário tiver empresaId
      if (user?.empresaId) {
        try {
          const empresaResp = await api.get<ApiResponse<Empresa>>(`empresas/${user.empresaId}`);
          if (empresaResp?.data) {
            setEmpresa(empresaResp.data);
            localStorage.setItem('userEmpresa', JSON.stringify(empresaResp.data));
          }
        } catch (error) {
          console.warn('Erro ao carregar dados da empresa:', error);
        }
      }

      console.log('✅ Dados do usuário carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados completos do usuário:', error);
    }
  }, [user?.empresaId]);

  // Função para atualizar dados do usuário
  const refreshUserData = async () => {
    if (user?.id) {
      await fetchUserCompleteData(user.id);
    }
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('autenticacao/entrar', { 
        email, 
        senha: password 
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, expiraEm, usuario, filiais } = response.data;
        
        console.log('✅ Login bem-sucedido, salvando dados...');
        console.log('🏢 Filiais recebidas no login:', filiais);
        
        // Configurar tokens na API
        api.setTokens(accessToken, refreshToken);
        
        // Salvar dados no localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(usuario));
        
        console.log('💾 Dados salvos no localStorage:', {
          accessToken: accessToken ? '✅' : '❌',
          refreshToken: refreshToken ? '✅' : '❌',
          user: usuario ? '✅' : '❌',
          filiais: filiais ? filiais.length : 0
        });
        
        // Atualizar estado
        setUser(usuario);
        setIsAuthenticated(true);
        
        // Processar filiais que vêm diretamente do login
        if (filiais && filiais.length > 0) {
          setFiliais(filiais);
          localStorage.setItem('userFiliais', JSON.stringify(filiais));
          
          // Definir filial atual (primeira por padrão)
          const primeiraFilial = filiais[0];
          setFilialAtual(primeiraFilial);
          localStorage.setItem('filialAtual', JSON.stringify(primeiraFilial));
          
          // Definir filial na API para headers automáticos
          api.setFilial(primeiraFilial.id);
        }
        
        // Carregar dados completos do usuário (empresa)
        await fetchUserCompleteData(usuario.id);
        
        // Forçar carregamento de permissões após login
        console.log('🔐 Forçando carregamento de permissões após login...');
        // Disparar evento customizado para notificar o contexto de permissões
        const filialId = filiais && filiais.length > 0 ? filiais[0].id : null;
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { userId: usuario.id, filialId } 
        }));
        
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Erro no login');
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    console.log('🚪 Fazendo logout...');
    
    // Limpar tokens da API (inclui filial)
    api.clearTokens();
    
    // Limpar estado
    setUser(null);
    setEmpresa(null);
    setFiliais([]);
    setFilialAtual(null);
    setIsAuthenticated(false);
    
    // Limpar localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmpresa');
    localStorage.removeItem('userFiliais');
    localStorage.removeItem('filialAtual');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('userGrupos');
    
    toast.success('Logout realizado com sucesso!');
  };

  // Função para definir filial atual
  const handleSetFilialAtual = (filial: Filial | null) => {
    setFilialAtual(filial);
    localStorage.setItem('filialAtual', JSON.stringify(filial));
    
    // Definir filial na API para headers automáticos
    if (filial?.id) {
      api.setFilial(filial.id);
    } else {
      api.setFilial('');
    }
  };

  // Restaurar sessão do localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');
      const savedEmpresa = localStorage.getItem('userEmpresa');
      const savedFiliais = localStorage.getItem('userFiliais');
      const savedFilialAtual = localStorage.getItem('filialAtual');

      console.log('🔄 Restaurando sessão...', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!savedUser,
        hasEmpresa: !!savedEmpresa,
        hasFiliais: !!savedFiliais,
        hasFilialAtual: !!savedFilialAtual
      });

      if (accessToken && refreshToken && savedUser) {
        const userData = safeJsonParse<User>(savedUser, null);
        const empresaData = savedEmpresa ? safeJsonParse<Empresa>(savedEmpresa, null) : null;
        const filiaisData = savedFiliais ? safeJsonParse<Filial[]>(savedFiliais, []) : [];
        const filialAtualData = savedFilialAtual ? safeJsonParse<Filial>(savedFilialAtual, null) : null;

        // Configurar tokens na API
        api.setTokens(accessToken, refreshToken);
        
        // Restaurar estado
        setUser(userData);
        setEmpresa(empresaData);
        setFiliais(filiaisData);
        
        // Definir filial atual
        const filialAtual = filialAtualData || (filiaisData.length > 0 ? filiaisData[0] : null);
        setFilialAtual(filialAtual);
        setIsAuthenticated(true);
        
        // Definir filial na API para headers automáticos
        if (filialAtual?.id) {
          api.setFilial(filialAtual.id);
        }
        
        console.log('✅ Sessão restaurada com sucesso');
        
        // Buscar dados mais recentes em background
        if (userData?.id) {
          await fetchUserCompleteData(userData.id);
        }
        
        // Forçar carregamento de permissões após restauração de sessão
        console.log('🔐 Forçando carregamento de permissões após restauração de sessão...');
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { userId: userData.id, filialId: filialAtual?.id } 
        }));
      }
    };

    restoreSession();
  }, [fetchUserCompleteData]);

  const value: AuthContextType = {
    user,
    empresa,
    filiais,
    filialAtual,
    login,
    logout,
    isAuthenticated,
    setFilialAtual: handleSetFilialAtual,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
