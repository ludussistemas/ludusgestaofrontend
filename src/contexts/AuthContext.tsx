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

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  empresa: Empresa | null;
  filiais: Filial[];
  filialAtual: Filial | null;
  login: (email: string, password: string) => Promise<LoginResult>;
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
  const login = async (email: string, password: string): Promise<LoginResult> => {
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
        
        // Processar filiais que vêm diretamente do login
        let primeiraFilial = null;
        if (filiais && filiais.length > 0) {
          localStorage.setItem('userFiliais', JSON.stringify(filiais));
          primeiraFilial = filiais[0];
          localStorage.setItem('filialAtual', JSON.stringify(primeiraFilial));
          
          // Definir filial na API para headers automáticos
          api.setFilial(primeiraFilial.id);
          console.log('🏢 Filial definida na API:', primeiraFilial.id);
        }
        
        // Atualizar estado do React em sequência
        setUser(usuario);
        setFiliais(filiais || []);
        setFilialAtual(primeiraFilial);
        setIsAuthenticated(true);
        
        console.log('✅ Estados do React atualizados:', {
          userId: usuario.id,
          filialId: primeiraFilial?.id,
          filiaisCount: filiais?.length || 0
        });
        
        // Carregar dados completos do usuário (empresa)
        await fetchUserCompleteData(usuario.id);
        
        // Disparar evento customizado para notificar o contexto de permissões
        console.log('🔐 Disparando evento de login para carregar permissões...', {
          userId: usuario.id,
          filialId: primeiraFilial?.id
        });
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { userId: usuario.id, filialId: primeiraFilial?.id } 
        }));
        
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        const errorMessage = response.message || 'Erro no login';
        console.error('❌ Erro no login:', errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('❌ Erro no login (catch):', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : 'Erro ao tentar realizar login. Tente novamente.';
      return { success: false, message: errorMessage };
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
        
        // Definir filial atual
        const filialAtual = filialAtualData || (filiaisData.length > 0 ? filiaisData[0] : null);
        
        // Definir filial na API para headers automáticos
        if (filialAtual?.id) {
          api.setFilial(filialAtual.id);
          console.log('🏢 Filial definida na API durante restauração:', filialAtual.id);
        }
        
        // Restaurar estado do React
        setUser(userData);
        setEmpresa(empresaData);
        setFiliais(filiaisData);
        setFilialAtual(filialAtual);
        setIsAuthenticated(true);
        
        console.log('✅ Sessão restaurada com sucesso:', {
          userId: userData?.id,
          filialId: filialAtual?.id,
          filiaisCount: filiaisData.length
        });
        
        // Buscar dados mais recentes em background
        if (userData?.id) {
          await fetchUserCompleteData(userData.id);
        }
        
        // Disparar evento para carregar permissões após restauração de sessão
        console.log('🔐 Disparando evento de login para carregar permissões após restauração...', {
          userId: userData?.id,
          filialId: filialAtual?.id
        });
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { userId: userData?.id, filialId: filialAtual?.id } 
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
