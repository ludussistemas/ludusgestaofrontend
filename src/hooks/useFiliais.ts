import { Filial } from '@/types/filial';
import { toast } from 'sonner';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';

export const useFiliais = () => {
  const baseHook = useBaseCrud<Filial>('filiais', {
    transformData: (data) => data,
    transformPagination: (pagination) => pagination
  });

  const getFilialById = (id: string) => baseHook.data.find(f => f.id === id);

  const getFiliaisForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(filial => ({
      id: filial.id,
      label: filial.nome,
      subtitle: filial.endereco || ''
    }));
  };

  const createFilial = async (filialData: Omit<Filial, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando filial...');
      
      const response = await api.post<ApiResponse<Filial>>('filiais', filialData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Filial criada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar filial');
        throw new Error(response.message || 'Erro ao criar filial');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar filial';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateFilial = async (id: string, filialData: Partial<Omit<Filial, 'id' | 'dataCriacao'>>) => {
    try {
      const loadingToast = toast.loading('Atualizando filial...');
      
      const response = await api.put<ApiResponse<Filial>>(`filiais/${id}`, filialData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Filial atualizada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar filial');
        throw new Error(response.message || 'Erro ao atualizar filial');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar filial';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...baseHook,
    getFilialById,
    getFiliaisForSearch,
    createFilial,
    updateFilial,
    // Aliases para compatibilidade
    filiais: baseHook.data,
    fetchFiliais: baseHook.fetchData,
    deleteFilial: baseHook.deleteItem,
  };
}; 