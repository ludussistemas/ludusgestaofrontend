import { Usuario } from '@/types/usuario';
import { toast } from 'sonner';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';

export const useUsuarios = () => {
  const baseHook = useBaseCrud<Usuario>('usuarios', {
    transformData: (data) => data,
    transformPagination: (pagination) => pagination
  });

  const getUsuarioById = (id: string) => baseHook.data.find(u => u.id === id);

  const getUsuariosForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(usuario => ({
      id: usuario.id,
      label: usuario.nome,
      subtitle: usuario.email
    }));
  };

  const createUsuario = async (usuarioData: Omit<Usuario, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando usuário...');
      
      const response = await api.post<ApiResponse<Usuario>>('usuarios', usuarioData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Usuário criado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar usuário');
        throw new Error(response.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateUsuario = async (id: string, usuarioData: Partial<Omit<Usuario, 'id' | 'dataCriacao'>>) => {
    try {
      const loadingToast = toast.loading('Atualizando usuário...');
      
      const response = await api.put<ApiResponse<Usuario>>(`usuarios/${id}`, usuarioData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Usuário atualizado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar usuário');
        throw new Error(response.message || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...baseHook,
    getUsuarioById,
    getUsuariosForSearch,
    createUsuario,
    updateUsuario,
    // Aliases para compatibilidade
    usuarios: baseHook.data,
    fetchUsuarios: baseHook.fetchData,
    deleteUsuario: baseHook.deleteItem,
  };
}; 