import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';
import { Permissao } from '../types/permissao';

export const usePermissoes = () => {
  const baseHook = useBaseCrud<Permissao>('permissoes');

  const getPermissaoById = (id: string) => {
    if (!Array.isArray(baseHook.data)) return undefined;
    return baseHook.data.find(p => p.id === id);
  };

  const getPermissoesForSearch = async () => {
    try {
      const response = await api.get<ApiResponse<Permissao[]>>('permissoes', { pageSize: 100 });
      return (response.data || []).map(permissao => ({
        id: permissao.id,
        nome: permissao.nome,
        subtitle: permissao.descricao
      }));
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      return [];
    }
  };

  const getModulosPai = async () => {
    try {
      const response = await api.get<ApiResponse<string[]>>('permissoes/modulos-pai');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar módulos pai:', error);
      return [];
    }
  };

  const getSubmodulos = async () => {
    try {
      const response = await api.get<ApiResponse<string[]>>('permissoes/submodulos');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar submódulos:', error);
      return [];
    }
  };

  const getPermissoesPorModuloPai = async (moduloPai: string) => {
    try {
      const response = await api.get<ApiResponse<Permissao[]>>(`/api/permissoes/modulo-pai/${moduloPai}`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar permissões por módulo pai:', error);
      return [];
    }
  };

  const getPermissoesPorSubmodulo = async (submodulo: string) => {
    try {
      const response = await api.get<ApiResponse<Permissao[]>>(`/api/permissoes/submodulo/${submodulo}`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar permissões por submódulo:', error);
      return [];
    }
  };

  return {
    ...baseHook,
    getPermissaoById,
    getPermissoesForSearch,
    getModulosPai,
    getSubmodulos,
    getPermissoesPorModuloPai,
    getPermissoesPorSubmodulo,
    // Aliases para compatibilidade
    permissoes: baseHook.data,
    fetchPermissoes: baseHook.fetchData,
  };
}; 