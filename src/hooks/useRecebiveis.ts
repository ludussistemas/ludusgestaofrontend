
import { toast } from 'sonner';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';
import { Recebivel } from '../types';

export const useRecebiveis = () => {
  const baseHook = useBaseCrud<Recebivel>('recebiveis', {
    transformData: (data) => data,
    transformPagination: (pagination) => pagination
  });

  const getRecebivelById = (id: string) => baseHook.data.find(r => r.id === id);

  const getRecebiveisForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(recebivel => ({
      id: recebivel.id,
      label: recebivel.descricao,
      subtitle: `R$ ${recebivel.valor.toFixed(2)}`
    }));
  };

  const createRecebivel = async (recebivelData: Omit<Recebivel, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando recebível...');
      
      const response = await api.post<ApiResponse<Recebivel>>('recebiveis', recebivelData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Recebível criado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar recebível');
        throw new Error(response.message || 'Erro ao criar recebível');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar recebível';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateRecebivel = async (id: string, recebivelData: Partial<Recebivel>) => {
    try {
      const loadingToast = toast.loading('Atualizando recebível...');
      
      const response = await api.put<ApiResponse<Recebivel>>(`recebiveis/${id}`, recebivelData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Recebível atualizado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar recebível');
        throw new Error(response.message || 'Erro ao atualizar recebível');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar recebível';
      toast.error(errorMessage);
      throw error;
    }
  };

  const cancelarRecebivel = async (recebivelId: string, motivoCancelamento: string) => {
    try {
      const loadingToast = toast.loading('Cancelando recebível...');
      
      const response = await api.post<ApiResponse<Recebivel>>('recebiveis/cancelar', { 
        recebivelId, 
        motivoCancelamento 
      });
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Recebível cancelado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          pageSize: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao cancelar recebível');
        throw new Error(response.message || 'Erro ao cancelar recebível');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar recebível';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...baseHook,
    getRecebivelById,
    getRecebiveisForSearch,
    createRecebivel,
    updateRecebivel,
    cancelarRecebivel,
    // Aliases para compatibilidade
    recebiveis: baseHook.data,
    fetchRecebiveis: baseHook.fetchData,
    deleteRecebivel: baseHook.deleteItem,
  };
};
