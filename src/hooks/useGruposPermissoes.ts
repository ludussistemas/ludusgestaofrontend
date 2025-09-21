import { useBaseCrud } from '@/core/hooks/useBaseCrud';
import { api, ApiResponse } from '@/lib/api';
import { GrupoPermissao } from '@/types/grupo-permissao';
import { toast } from 'sonner';

export const useGruposPermissoes = () => {
  const baseHook = useBaseCrud<GrupoPermissao>('grupos-permissoes');

  const getGrupoById = (id: string) => {
    if (!Array.isArray(baseHook.data)) return undefined;
    return baseHook.data.find(g => g.id === id);
  };

  // Buscar grupos para seleção (formato simplificado)
  const getGruposForSearch = async () => {
    try {
      const response = await api.get<ApiResponse<GrupoPermissao[]>>('/api/grupos-permissoes', { limit: 100 });
      return (response.data || []).map(grupo => ({
        id: grupo.id,
        nome: grupo.nome,
        subtitle: grupo.descricao || 'Sem descrição'
      }));
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return [];
    }
  };

  const createGrupo = async (grupoData: Omit<GrupoPermissao, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando grupo...');
      
      const response = await api.post<ApiResponse<GrupoPermissao>>('/api/grupos-permissoes', grupoData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Grupo criado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar grupo');
        throw new Error(response.message || 'Erro ao criar grupo');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar grupo';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateGrupo = async (id: string, grupoData: Partial<GrupoPermissao>) => {
    try {
      const loadingToast = toast.loading('Atualizando grupo...');
      
      const response = await api.put<ApiResponse<GrupoPermissao>>(`/api/grupos-permissoes/${id}`, grupoData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Grupo atualizado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar grupo');
        throw new Error(response.message || 'Erro ao atualizar grupo');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar grupo';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Buscar usuários de um grupo específico
  const getUsuariosDoGrupo = async (grupoId: string) => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/api/grupos-permissoes/${grupoId}/usuarios`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários do grupo:', error);
      return [];
    }
  };

  const adicionarUsuarioAoGrupo = async (grupoId: string, usuarioId: string) => {
    try {
      const response = await api.post<ApiResponse<any>>(`/api/grupos-permissoes/${grupoId}/usuarios`, {
        usuarioId
      });
      if (response.success) {
        toast.success('Usuário adicionado ao grupo com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Erro ao adicionar usuário ao grupo');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar usuário ao grupo';
      toast.error(errorMessage);
      return false;
    }
  };

  const removerUsuarioDoGrupo = async (grupoId: string, usuarioId: string) => {
    try {
      const response = await api.delete<ApiResponse<any>>(`/api/grupos-permissoes/${grupoId}/usuarios/${usuarioId}`);
      if (response.success) {
        toast.success('Usuário removido do grupo com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Erro ao remover usuário do grupo');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover usuário do grupo';
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    ...baseHook,
    getGrupoById,
    getGruposForSearch,
    createGrupo,
    updateGrupo,
    getUsuariosDoGrupo,
    adicionarUsuarioAoGrupo,
    removerUsuarioDoGrupo,
    // Aliases para compatibilidade
    grupos: baseHook.data,
    fetchGrupos: baseHook.fetchData,
    deleteGrupo: baseHook.deleteItem,
  };
}; 