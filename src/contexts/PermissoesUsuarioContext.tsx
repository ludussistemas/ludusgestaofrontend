import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ============================================================================
// SISTEMA DE PERMISSÕES - MAPEAMENTO COMPLETO
// ============================================================================
//
// MÓDULOS DISPONÍVEIS NA API:
// - "Eventos" (submódulos: Clientes, Reservas, Recebiveis, Locais)
// - "Configuracoes" (submódulos: Filiais, Grupo de Permissões, Empresa, Usuarios)
//
// EXEMPLOS DE USO:
// const { hasModuleAccess, hasClientesAccess, hasFiliaisAccess } = usePermissoesUsuario();
//
// // Verificar acesso a módulos principais (usando nomes exatos da API)
// const canAccessEvents = hasModuleAccess('Eventos'); // true se tem acesso ao módulo Eventos
// const canAccessConfig = hasModuleAccess('Configuracoes'); // true se tem acesso ao módulo Configuracoes
//
// // Verificar acesso a submódulos específicos do módulo Eventos
// const canAccessClientes = hasClientesAccess(); // true se tem acesso ao submódulo Clientes
// const canAccessReservas = hasReservasAccess(); // true se tem acesso ao submódulo Reservas
// const canAccessRecebiveis = hasRecebiveisAccess(); // true se tem acesso ao submódulo Recebiveis
// const canAccessLocais = hasLocaisAccess(); // true se tem acesso ao submódulo Locais
//
// // Verificar acesso a submódulos específicos do módulo Configuracoes
// const canAccessFiliais = hasFiliaisAccess(); // true se tem acesso ao submódulo Filiais
// const canAccessGrupoPermissoes = hasGrupoPermissoesAccess(); // true se tem acesso ao submódulo Grupo de Permissões
// const canAccessEmpresa = hasEmpresaAccess(); // true se tem acesso ao submódulo Empresa
// const canAccessUsuarios = hasUsuariosAccess(); // true se tem acesso ao submódulo Usuarios
//
// // Verificar ações específicas (via API)
// const canCreateReservas = await checkPermission('Eventos', 'Reservas', 'Criar');
// const canEditUsuarios = await checkPermission('Configuracoes', 'Usuarios', 'Editar');
//
// ============================================================================

// Interface para estrutura de menu de permissões
interface ModuloPermissao {
  id: string;
  nome: string;
  submodulos: Array<{
    id: string;
    nome: string;
  }>;
}

interface PermissoesUsuarioContextType {
  permissoes: string[];
  modulos: ModuloPermissao[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  checkPermission: (moduloNome: string, submoduloNome: string, acaoNome: string) => Promise<boolean>;
  checkModulePermission: (moduloNome: string, acaoNome: string) => Promise<boolean>;
  hasModuleAccess: (moduleName: string) => boolean;
  hasSubmoduleAccess: (moduloNome: string, submoduloNome: string) => boolean;
  // Funções específicas para submódulos do módulo Eventos
  hasEventosAccess: () => boolean;
  hasClientesAccess: () => boolean;
  hasReservasAccess: () => boolean;
  hasRecebiveisAccess: () => boolean;
  hasLocaisAccess: () => boolean;
  // Funções específicas para submódulos do módulo Configuracoes
  hasConfiguracoesAccess: () => boolean;
  hasFiliaisAccess: () => boolean;
  hasGrupoPermissoesAccess: () => boolean;
  hasEmpresaAccess: () => boolean;
  hasUsuariosAccess: () => boolean;
  // Funções para outros módulos de configuração
  hasParametrosAccess: () => boolean;
  hasFinanceiroAccess: () => boolean;
  hasIntegracoesAccess: () => boolean;
  hasAuditoriaAccess: () => boolean;
  refreshPermissions: () => Promise<void>;
  forceLoadPermissions: () => Promise<void>;
  clearPermissionsCache: () => void;
}

const PermissoesUsuarioContext = createContext<PermissoesUsuarioContextType | undefined>(undefined);

export const usePermissoesUsuario = () => {
  const context = useContext(PermissoesUsuarioContext);
  if (!context) {
    throw new Error('usePermissoesUsuario deve ser usado dentro de um PermissoesUsuarioProvider');
  }
  return context;
};

export const PermissoesUsuarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, filialAtual } = useAuth();
  const [permissoes, setPermissoes] = useState<string[]>(() => {
    // Tentar carregar permissões do localStorage como fallback
    try {
      const saved = localStorage.getItem('userPermissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [modulos, setModulos] = useState<ModuloPermissao[]>(() => {
    // Tentar carregar módulos do localStorage como fallback
    try {
      const saved = localStorage.getItem('userModules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [permissoesCarregadas, setPermissoesCarregadas] = useState(false);
  const isLoadingRef = useRef(false); // Flag para prevenir chamadas simultâneas

  // Função para buscar permissões do usuário via endpoint usuariopermissao/menu
  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id || !filialAtual?.id) {
      console.log('⚠️ Usuário ou filial não definidos para buscar permissões');
      setPermissoes([]);
      setModulos([]);
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⏸️ Já existe um carregamento de permissões em andamento, ignorando...');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      // Usar endpoint correto conforme documentação
      const endpoint = `usuariopermissao/menu?usuarioId=${user.id}&filialId=${filialAtual.id}`;

      console.log('🔍 Buscando permissões do usuário:', { userId: user.id, filialId: filialAtual.id });

      const response = await api.get<{
        modulos: ModuloPermissao[];
      }>(endpoint);

      console.log('📦 Resposta da API de permissões:', response);

      // Verificar se a resposta tem a estrutura esperada
      if (response && response.modulos && Array.isArray(response.modulos)) {
        const modulosData = response.modulos;
        console.log('✅ Módulos carregados:', modulosData);
        setModulos(modulosData);

        // O endpoint /menu retorna apenas módulos e submódulos que o usuário tem acesso
        const permissoesList: string[] = [];
        
        modulosData.forEach(modulo => {
          permissoesList.push(`${modulo.nome}.Acesso`);
          
          modulo.submodulos.forEach(submodulo => {
            permissoesList.push(`${modulo.nome}.${submodulo.nome}.Acesso`);
          });
        });

        console.log('🔐 Permissões geradas:', permissoesList);
        setPermissoes(permissoesList);
        setPermissoesCarregadas(true);
        
        // Salvar no localStorage para fallback
        try {
          localStorage.setItem('userPermissions', JSON.stringify(permissoesList));
          localStorage.setItem('userModules', JSON.stringify(modulosData));
        } catch (error) {
          console.warn('Erro ao salvar permissões no localStorage:', error);
        }
      } else {
        console.warn('⚠️ Resposta da API não tem a estrutura esperada:', response);
        setPermissoes([]);
        setModulos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar permissões:', error);
      
      // Verificar se é um erro 503 (Service Unavailable)
      const isServiceUnavailable = error instanceof Error && 
        (error.message.includes('503') || error.message.includes('Service Unavailable'));
      
      if (isServiceUnavailable) {
        console.log('🔄 Erro 503 detectado, tentando novamente em 3 segundos...');
        // Se já temos permissões carregadas, manter elas e tentar novamente em background
        if (permissoesCarregadas && permissoes.length > 0) {
          console.log('📦 Mantendo permissões existentes durante erro 503');
        }
        // Tentar novamente após 3 segundos
        setTimeout(() => {
          console.log('🔄 Retentando carregamento de permissões...');
          fetchUserPermissions();
        }, 3000);
      } else {
        // Para outros erros, limpar permissões
        setPermissoes([]);
        setModulos([]);
        setPermissoesCarregadas(false);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user?.id, filialAtual?.id]);

  // Função para verificar permissão específica via API (verificação em tempo real)
  const checkPermission = async (moduloNome: string, submoduloNome: string, acaoNome: string): Promise<boolean> => {
    if (!user?.id || !filialAtual?.id) {
      return false;
    }

    try {
      // Usar endpoint de verificação em tempo real conforme documentação
      const response = await api.get<boolean>(`usuariopermissao/tem-permissao-submodulo?usuarioId=${user.id}&filialId=${filialAtual.id}&submoduloNome=${submoduloNome}&acaoNome=${acaoNome}`);
      return response === true;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  };

  // Função para verificar permissão de módulo
  const checkModulePermission = async (moduloNome: string, acaoNome: string): Promise<boolean> => {
    if (!user?.id || !filialAtual?.id) {
      return false;
    }

    try {
      // Usar endpoint de verificação de módulo conforme documentação
      const response = await api.get<boolean>(`usuariopermissao/tem-permissao-modulo?usuarioId=${user.id}&filialId=${filialAtual.id}&moduloNome=${moduloNome}&acaoNome=${acaoNome}`);
      return response === true;
    } catch (error) {
      console.error('Erro ao verificar permissão de módulo:', error);
      return false;
    }
  };

  // Função para verificar se o usuário tem uma permissão específica (cache local)
  const hasPermission = (permission: string): boolean => {
    // Se ainda está carregando, não permitir acesso até carregar
    if (loading) {
      console.log('⏳ Ainda carregando permissões, negando acesso temporariamente');
      return false;
    }
    
    // Se não há usuário ou filial, não permitir acesso
    if (!user?.id || !filialAtual?.id) {
      console.log('❌ Usuário ou filial não definidos, negando acesso');
      return false;
    }
    
    // Se não há permissões carregadas, não permitir acesso
    if (!permissoes || permissoes.length === 0) {
      console.log('❌ Nenhuma permissão carregada, negando acesso');
      return false;
    }
    
    const hasAccess = permissoes.includes(permission);
    console.log(`🔍 Verificando permissão "${permission}": ${hasAccess ? '✅' : '❌'}`);
    return hasAccess;
  };

  // Função para verificar acesso a módulos (verificação real via API)
  const hasModuleAccess = (moduleName: string): boolean => {
    // Se ainda está carregando, não permitir acesso até carregar
    if (loading) {
      console.log('⏳ Ainda carregando permissões, negando acesso ao módulo temporariamente');
      return false;
    }
    
    // Se não há usuário ou filial, não permitir acesso
    if (!user?.id || !filialAtual?.id) {
      console.log('❌ Usuário ou filial não definidos, negando acesso ao módulo');
      return false;
    }
    
    // Se não há módulos carregados, não permitir acesso
    if (modulos.length === 0) {
      console.log('❌ Nenhum módulo carregado, negando acesso');
      return false;
    }
    
    // Verificar se o módulo existe na lista de módulos retornados pelo menu
    const hasModuleInMenu = modulos.some(modulo => modulo.nome === moduleName);
    
    console.log(`🔍 Verificando acesso ao módulo "${moduleName}": ${hasModuleInMenu ? '✅' : '❌'}`);
    console.log('📋 Módulos disponíveis:', modulos.map(m => m.nome));
    
    return hasModuleInMenu;
  };

  // Função para verificar acesso a submódulos específicos
  const hasSubmoduleAccess = (moduloNome: string, submoduloNome: string): boolean => {
    // Se ainda está carregando, não permitir acesso até carregar
    if (loading) {
      console.log('⏳ Ainda carregando permissões, negando acesso ao submódulo temporariamente');
      return false;
    }
    
    // Se não há usuário ou filial, não permitir acesso
    if (!user?.id || !filialAtual?.id) {
      console.log('❌ Usuário ou filial não definidos, negando acesso ao submódulo');
      return false;
    }
    
    // Se não há módulos carregados, não permitir acesso
    if (modulos.length === 0) {
      console.log('❌ Nenhum módulo carregado, negando acesso ao submódulo');
      return false;
    }
    
    // Verificar se o módulo existe e se o submódulo está na lista
    const modulo = modulos.find(m => m.nome === moduloNome);
    if (!modulo) {
      console.log(`❌ Módulo "${moduloNome}" não encontrado`);
      return false;
    }
    
    const hasSubmodule = modulo.submodulos.some(sub => sub.nome === submoduloNome);
    
    console.log(`🔍 Verificando acesso ao submódulo "${submoduloNome}" do módulo "${moduloNome}": ${hasSubmodule ? '✅' : '❌'}`);
    console.log(`📋 Submódulos disponíveis em "${moduloNome}":`, modulo.submodulos.map(s => s.nome));
    
    return hasSubmodule;
  };

  // ============================================================================
  // FUNÇÕES ESPECÍFICAS PARA SUBMÓDULOS DO MÓDULO EVENTOS
  // ============================================================================
  
  const hasEventosAccess = (): boolean => {
    return hasModuleAccess('Eventos');
  };

  const hasClientesAccess = (): boolean => {
    return hasSubmoduleAccess('Eventos', 'Clientes');
  };

  const hasReservasAccess = (): boolean => {
    return hasSubmoduleAccess('Eventos', 'Reservas');
  };

  const hasRecebiveisAccess = (): boolean => {
    return hasSubmoduleAccess('Eventos', 'Recebiveis');
  };

  const hasLocaisAccess = (): boolean => {
    return hasSubmoduleAccess('Eventos', 'Locais');
  };

  // ============================================================================
  // FUNÇÕES ESPECÍFICAS PARA SUBMÓDULOS DO MÓDULO CONFIGURAÇÕES
  // ============================================================================
  
  const hasConfiguracoesAccess = (): boolean => {
    return hasModuleAccess('Configuracoes');
  };

  const hasFiliaisAccess = (): boolean => {
    return hasSubmoduleAccess('Configuracoes', 'Filiais');
  };

  const hasGrupoPermissoesAccess = (): boolean => {
    return hasSubmoduleAccess('Configuracoes', 'Grupo de Permissões');
  };

  const hasEmpresaAccess = (): boolean => {
    return hasSubmoduleAccess('Configuracoes', 'Empresa');
  };

  const hasUsuariosAccess = (): boolean => {
    return hasSubmoduleAccess('Configuracoes', 'Usuarios');
  };
  
  const hasParametrosAccess = (): boolean => {
    // Por enquanto, parâmetros são acessíveis para usuários com acesso a configurações
    return hasSubmoduleAccess('Configuracoes', 'Parâmetros');
  };

  const hasFinanceiroAccess = (): boolean => {
    // Por enquanto, financeiro é acessível para usuários com acesso a configurações
    return hasSubmoduleAccess('Configuracoes', 'Financeiro');
  };

  const hasIntegracoesAccess = (): boolean => {
    // Por enquanto, integrações são acessíveis para usuários com acesso a configurações
    return hasSubmoduleAccess('Configuracoes', 'Integrações');
  };

  const hasAuditoriaAccess = (): boolean => {
    // Por enquanto, auditoria é acessível para usuários com acesso a configurações
    return hasSubmoduleAccess('Configuracoes', 'Auditoria');
  };

  // Função para atualizar permissões
  const refreshPermissions = async () => {
    await fetchUserPermissions();
  };

  // Função para forçar carregamento de permissões (pública)
  const forceLoadPermissions = async () => {
    console.log('🔐 Forçando carregamento de permissões...');
    await fetchUserPermissions();
  };

  // Função para limpar cache de permissões
  const clearPermissionsCache = () => {
    console.log('🧹 Limpando cache de permissões...');
    setPermissoes([]);
    setModulos([]);
    setPermissoesCarregadas(false);
    try {
      localStorage.removeItem('userPermissions');
      localStorage.removeItem('userModules');
    } catch (error) {
      console.warn('Erro ao limpar cache do localStorage:', error);
    }
  };

  // Effect principal: Buscar permissões quando usuário ou filial mudarem
  useEffect(() => {
    if (user?.id && filialAtual?.id) {
      console.log('🔄 [Effect Principal] Usuário ou filial mudaram, verificando necessidade de carregar permissões...', { 
        userId: user.id, 
        filialId: filialAtual.id,
        permissoesCarregadas,
        isLoading: isLoadingRef.current
      });
      
      // Só carregar se não estiver carregando e não tiver carregado ainda
      if (!isLoadingRef.current && !permissoesCarregadas) {
        console.log('✅ Iniciando carregamento de permissões...');
        fetchUserPermissions();
      } else {
        console.log('⏭️ Permissões já carregadas ou em carregamento, ignorando...');
      }
    } else {
      console.log('⚠️ [Effect Principal] Usuário ou filial não disponível, limpando permissões');
      setPermissoes([]);
      setModulos([]);
      setPermissoesCarregadas(false);
    }
  }, [user?.id, filialAtual?.id, permissoesCarregadas, fetchUserPermissions]);

  // Effect secundário: Escutar evento de login para forçar recarregamento
  useEffect(() => {
    const handleUserLoggedIn = (event: CustomEvent) => {
      const { userId, filialId } = event.detail;
      console.log('🔐 [Effect Evento] Evento de login recebido!', { 
        userId, 
        filialId,
        currentUser: user?.id,
        currentFilial: filialAtual?.id
      });
      
      // Limpar cache e flags para forçar recarregamento
      setPermissoes([]);
      setModulos([]);
      setPermissoesCarregadas(false);
      isLoadingRef.current = false;
      
      console.log('🧹 Cache limpo, aguardando Effect Principal recarregar...');
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    };
  }, [user?.id, filialAtual?.id]);

  const value: PermissoesUsuarioContextType = {
    permissoes,
    modulos,
    loading,
    hasPermission,
    checkPermission,
    checkModulePermission,
    hasModuleAccess,
    hasSubmoduleAccess,
    // Funções específicas para submódulos do módulo Eventos
    hasEventosAccess,
    hasClientesAccess,
    hasReservasAccess,
    hasRecebiveisAccess,
    hasLocaisAccess,
    // Funções específicas para submódulos do módulo Configuracoes
    hasConfiguracoesAccess,
    hasFiliaisAccess,
    hasGrupoPermissoesAccess,
    hasEmpresaAccess,
    hasUsuariosAccess,
    // Funções para outros módulos de configuração
    hasParametrosAccess,
    hasFinanceiroAccess,
    hasIntegracoesAccess,
    hasAuditoriaAccess,
    refreshPermissions,
    forceLoadPermissions,
    clearPermissionsCache,
  };

  return (
    <PermissoesUsuarioContext.Provider value={value}>
      {children}
    </PermissoesUsuarioContext.Provider>
  );
};
