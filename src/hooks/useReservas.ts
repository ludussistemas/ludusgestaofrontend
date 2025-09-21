import { toast } from 'sonner';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';
import { Reserva } from '../types';

export const useReservas = () => {
  const baseHook = useBaseCrud<Reserva>('reservas', {
    transformData: (data) => data, // Usar dados exatamente como vêm do backend
    transformPagination: (pagination) => pagination
  });

  const getReservaById = (id: string) => baseHook.data.find(r => r.id === id);

  const getReservasForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(reserva => ({
      id: reserva.id,
      label: reserva.observacoes || 'Reserva',
      subtitle: `Reserva ${reserva.id.substring(0, 8)}`
    }));
  };

  const createReserva = async (reservaData: Omit<Reserva, 'id' | 'dataCriacao'>) => {
    try {
      const loadingToast = toast.loading('Criando reserva...');
      
      const response = await api.post<ApiResponse<Reserva>>('reservas', reservaData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Reserva criada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar reserva');
        throw new Error(response.message || 'Erro ao criar reserva');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar reserva';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateReserva = async (id: string, reservaData: Partial<Reserva>) => {
    try {
      const loadingToast = toast.loading('Atualizando reserva...');
      
      const response = await api.put<ApiResponse<Reserva>>(`reservas/${id}`, reservaData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Reserva atualizada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar reserva');
        throw new Error(response.message || 'Erro ao atualizar reserva');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar reserva';
      toast.error(errorMessage);
      throw error;
    }
  };

  const confirmarReserva = async (id: string) => {
    try {
      const loadingToast = toast.loading('Confirmando reserva...');
      
      const response = await api.put<ApiResponse<Reserva>>(`reservas/${id}/confirmar`);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Reserva confirmada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao confirmar reserva');
        throw new Error(response.message || 'Erro ao confirmar reserva');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao confirmar reserva';
      toast.error(errorMessage);
      throw error;
    }
  };


  const finalizarReserva = async (id: string) => {
    try {
      const loadingToast = toast.loading('Finalizando reserva...');
      
      const response = await api.put<ApiResponse<Reserva>>(`reservas/${id}/finalizar`);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Reserva finalizada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao finalizar reserva');
        throw new Error(response.message || 'Erro ao finalizar reserva');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao finalizar reserva';
      toast.error(errorMessage);
      throw error;
    }
  };

  const cancelarReserva = async (reservaId: string, motivoCancelamento: string) => {
    try {
      const loadingToast = toast.loading('Cancelando reserva...');
      
      const response = await api.post<ApiResponse<Reserva>>('reservas/cancelar', { 
        reservaId, 
        motivoCancelamento 
      });
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Reserva cancelada com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          pageSize: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao cancelar reserva');
        throw new Error(response.message || 'Erro ao cancelar reserva');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar reserva';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    ...baseHook,
    getReservaById,
    getReservasForSearch,
    createReserva,
    updateReserva,
    confirmarReserva,
    cancelarReserva,
    finalizarReserva,
    // Aliases para compatibilidade
    reservas: baseHook.data,
    fetchReservas: baseHook.fetchData,
    deleteReserva: baseHook.deleteItem,
    getReserva: baseHook.getItem,
  };
}; 