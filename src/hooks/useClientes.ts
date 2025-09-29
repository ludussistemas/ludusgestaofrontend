
import { Cliente } from '@/types/cliente';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';

export const useClientes = () => {
  const baseHook = useBaseCrud<Cliente>('clientes', {
    transformData: (data) => data,
    transformPagination: (pagination) => pagination
  });

  const getClienteById = useCallback((id: string) => baseHook.data.find(c => c.id === id), [baseHook.data]);

  const getClientesForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(cliente => ({
      id: cliente.id,
      label: cliente.nome,
      subtitle: cliente.documento || cliente.email || ''
    }));
  };

  const createCliente = async (clienteData: Omit<Cliente, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando cliente...');
      
      const response = await api.post<ApiResponse<Cliente>>('clientes', clienteData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Cliente criado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar cliente');
        throw new Error(response.message || 'Erro ao criar cliente');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar cliente';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateCliente = async (id: string, clienteData: Partial<Omit<Cliente, 'id' | 'dataCriacao'>>) => {
    try {
      const loadingToast = toast.loading('Atualizando cliente...');
      
      const response = await api.put<ApiResponse<Cliente>>(`clientes/${id}`, clienteData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Cliente atualizado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar cliente');
        throw new Error(response.message || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar cliente';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...baseHook,
    getClienteById,
    getClientesForSearch,
    createCliente,
    updateCliente,
    // Aliases para compatibilidade
    clientes: baseHook.data,
    fetchClientes: baseHook.fetchData,
    deleteCliente: baseHook.deleteItem,
  };
};
