import { Empresa } from '@/types/empresa';
import { toast } from 'sonner';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';

export const useEmpresas = () => {
  const baseHook = useBaseCrud<Empresa>('empresas', {
    transformData: (data) => data,
    transformPagination: (pagination) => pagination
  });

  const getEmpresaById = (id: string) => baseHook.data.find(e => e.id === id);

  const getEmpresasForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(empresa => ({
      id: empresa.id,
      label: empresa.nome,
      subtitle: empresa.cnpj || empresa.email || ''
    }));
  };

  const createEmpresa = async (empresaData: Omit<Empresa, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando empresa...');
      
      const response = await api.post<ApiResponse<Empresa>>('empresas', empresaData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Empresa criada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar empresa');
        throw new Error(response.message || 'Erro ao criar empresa');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar empresa';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateEmpresa = async (id: string, empresaData: Partial<Omit<Empresa, 'id' | 'dataCriacao'>>) => {
    try {
      const loadingToast = toast.loading('Atualizando empresa...');
      
      const response = await api.put<ApiResponse<Empresa>>(`empresas/${id}`, empresaData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Empresa atualizada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar empresa');
        throw new Error(response.message || 'Erro ao atualizar empresa');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar empresa';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...baseHook,
    getEmpresaById,
    getEmpresasForSearch,
    createEmpresa,
    updateEmpresa,
    // Aliases para compatibilidade
    empresas: baseHook.data,
    fetchEmpresas: baseHook.fetchData,
    deleteEmpresa: baseHook.deleteItem,
  };
}; 