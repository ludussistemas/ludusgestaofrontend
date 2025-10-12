import { toast } from 'sonner';
import { useCallback, useState } from 'react';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse, ApiPagedResponseV2 } from '../lib/api';
import { Reserva, CreateReservaDTO, UpdateReservaDTO, Local, Cliente } from '../types';

export const useReservas = () => {
  const baseHook = useBaseCrud<Reserva>('reservas', {
    transformData: (data) => data, // Usar dados exatamente como vêm do backend
    transformPagination: (pagination) => pagination
  });

  // Função específica para buscar reservas por período (usada pela agenda)
  const fetchReservasPorPeriodo = async (dataInicio: string, dataFim: string, localIds?: string[]) => {
    try {
      const filterData: any = {
        dataInicio,
        dataFim
      };

      // Lógica para filtro de locais:
      // - Se não há locais selecionados ou é "all": não filtrar por local na API
      // - Se há apenas 1 local: filtrar na API
      // - Se há 2 ou mais locais: não filtrar na API, filtrar no frontend
      const shouldFilterByLocationInAPI = localIds && 
                                        localIds.length === 1 && 
                                        !localIds.includes('all');

      if (shouldFilterByLocationInAPI) {
        // Filtrar por local na API (apenas 1 local selecionado)
        filterData.localId = localIds[0];
        console.log('🔍 Estratégia: Filtrar por local na API', { localId: localIds[0] });
      } else if (localIds && localIds.length > 1) {
        console.log('🔍 Estratégia: Múltiplos locais - buscar todos e filtrar no frontend', { localIds });
      } else {
        console.log('🔍 Estratégia: Todos os locais - sem filtro de local');
      }

      const filtros: any = {
        page: 1,
        limit: 100,  // Limite máximo aceito pela API (1-100)
        filter: JSON.stringify(filterData)
      };

      console.log('🔍 Buscando reservas por período:', filtros);
      await baseHook.fetchData(filtros);
    } catch (error) {
      console.error('Erro ao buscar reservas por período:', error);
      
      // Verificar se é um erro 503 (Service Unavailable)
      const isServiceUnavailable = error instanceof Error && 
        (error.message.includes('503') || error.message.includes('Service Unavailable'));
      
      if (isServiceUnavailable) {
        toast.error('Serviço temporariamente indisponível. Tente novamente em alguns minutos.', {
          duration: 5000,
        });
      } else {
        toast.error('Erro ao buscar reservas. Verifique sua conexão.', {
          duration: 5000,
        });
      }
      
      throw error;
    }
  };

  const getReservaById = (id: string) => baseHook.data.find(r => r.id === id);

  const getReservasForSearch = async () => {
    await baseHook.fetchData({ limit: 100 });  // Limite máximo aceito pela API (1-100)
    return baseHook.data.map(reserva => ({
      id: reserva.id,
      label: reserva.observacoes || 'Reserva',
      subtitle: `Reserva ${reserva.id.substring(0, 8)}`
    }));
  };

  const createReserva = async (reservaData: CreateReservaDTO) => {
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

  const updateReserva = async (id: string, reservaData: UpdateReservaDTO) => {
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

  // Estados para timeline
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Função para buscar reservas para timeline
  const buscarReservasTimeline = useCallback(async (
    data: Date, 
    localId?: string, 
    locais: Local[] = [], 
    clientes: Cliente[] = []
  ) => {
    if (!data) return;
    
    console.log('🚀 [Timeline] buscarReservasTimeline chamado com:', {
      data,
      localId,
      totalLocais: locais.length,
      totalClientes: clientes.length
    });
    
    try {
      setTimelineLoading(true);
      
      // Formatar datas para busca (YYYY-MM-DD local)
      const year = data.getFullYear();
      const month = String(data.getMonth() + 1).padStart(2, '0');
      const day = String(data.getDate()).padStart(2, '0');
      const dataInicio = `${year}-${month}-${day}`;
      
      const nextDay = new Date(data);
      nextDay.setDate(nextDay.getDate() + 1);
      const yearNext = nextDay.getFullYear();
      const monthNext = String(nextDay.getMonth() + 1).padStart(2, '0');
      const dayNext = String(nextDay.getDate()).padStart(2, '0');
      const dataFim = `${yearNext}-${monthNext}-${dayNext}`;
      
      console.log('🔍 [Timeline] Buscando reservas:', { dataInicio, dataFim, localId });
      
      // Buscar DIRETAMENTE da API
      const filterData: any = { dataInicio, dataFim };
      if (localId) {
        filterData.localId = localId;
      }
      
      const filtros: any = {
        page: 1,
        limit: 100,  // Limite máximo aceito pela API (1-100)
        filter: JSON.stringify(filterData)
      };
      
      console.log('🔍 [Timeline] Filtros:', filtros);
      
      // Buscar diretamente da API (usa ApiPagedResponseV2 que tem 'items')
      const response = await api.get<ApiPagedResponseV2<Reserva>>('reservas', filtros);
      
      console.log('📡 [Timeline] Resposta da API:', response);
      
      if (!response.success || !response.items || !Array.isArray(response.items)) {
        console.warn('⚠️ [Timeline] Nenhuma reserva encontrada');
        setTimelineEvents([]);
        return;
      }
      
      const reservas = response.items;
      console.log('📅 [Timeline] Reservas recebidas:', reservas);
      console.log('📊 [Timeline] Total de reservas:', reservas.length);
      
      // Transformar em eventos para timeline
      console.log('🔍 [Timeline] Arrays disponíveis:', {
        totalClientes: clientes.length,
        clientesIds: clientes.map(c => c.id),
        totalLocais: locais.length,
        locaisIds: locais.map(l => l.id)
      });
      
      const eventosTimeline = reservas.map(reserva => {
        console.log('🔍 [Timeline] Processando reserva:', {
          id: reserva.id,
          clienteId: reserva.clienteId,
          localId: reserva.localId,
          dataInicio: reserva.dataInicio,
          dataFim: reserva.dataFim
        });
        
        const cliente = clientes.find(c => c.id === reserva.clienteId);
        const local = locais.find(l => l.id === reserva.localId);
        
        console.log('🔍 [Timeline] Cliente/Local encontrados:', {
          cliente: cliente ? cliente.nome : '❌ NÃO ENCONTRADO',
          local: local ? local.nome : '❌ NÃO ENCONTRADO'
        });
        
        // Converter datas UTC para horário local
        const dataInicioDate = new Date(reserva.dataInicio);
        const dataFimDate = new Date(reserva.dataFim);
        
        const startHours = String(dataInicioDate.getHours()).padStart(2, '0');
        const startMinutes = String(dataInicioDate.getMinutes()).padStart(2, '0');
        const endHours = String(dataFimDate.getHours()).padStart(2, '0');
        const endMinutes = String(dataFimDate.getMinutes()).padStart(2, '0');
        
        const evento = {
          id: reserva.id,
          client: cliente?.nome || 'Cliente não encontrado',
          venue: local?.nome || 'Local não encontrado',
          startTime: `${startHours}:${startMinutes}`,
          endTime: `${endHours}:${endMinutes}`,
          status: reserva.situacao === 1 ? 'confirmed' : 'pending',
          color: local?.cor || reserva.cor || '#6b7280',
          sport: reserva.esporte || local?.tipo || '',
          notes: reserva.observacoes || ''
        };
        
        console.log('🎯 [Timeline] Evento transformado:', evento);
        return evento;
      });
      
      console.log('✅ [Timeline] Total de eventos transformados:', eventosTimeline.length);
      setTimelineEvents(eventosTimeline);
    } catch (error) {
      console.error('❌ [Timeline] Erro ao buscar reservas:', error);
      toast.error('Erro ao carregar eventos da timeline');
      setTimelineEvents([]);
    } finally {
      setTimelineLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para obter configurações do local
  const getVenueConfig = useCallback((localId: string, locais: Local[]) => {
    if (!Array.isArray(locais) || locais.length === 0) {
      return {
        interval: 30,
        minTime: "07:00",
        maxTime: "21:00"
      };
    }
    
    const selectedVenue = locais.find(l => l.id === localId);
    
    if (!selectedVenue) {
      return {
        interval: 30,
        minTime: "07:00",
        maxTime: "21:00"
      };
    }
    
    return {
      interval: selectedVenue.intervalo || 30,
      minTime: selectedVenue.horaAbertura || "07:00",
      maxTime: selectedVenue.horaFechamento || "21:00"
    };
  }, []);

  // Função para obter horários ocupados
  const getOccupiedTimes = useCallback((localId: string, date: Date, locais: Local[]) => {
    if (!localId || !date || !Array.isArray(locais)) {
      return [];
    }
    
    const selectedVenue = locais.find(l => l.id === localId);
    if (!selectedVenue) return [];
    
    const venueConfig = getVenueConfig(localId, locais);
    const occupiedTimes: string[] = [];
    
    // Filtrar reservas do local e data específica
    const reservasDoLocal = baseHook.data.filter(reserva => {
      if (reserva.localId !== localId) return false;
      
      const reservaDate = new Date(reserva.dataInicio);
      return reservaDate.toDateString() === date.toDateString();
    });
    
    // Adicionar horários ocupados
    reservasDoLocal.forEach(reserva => {
      const startTime = reserva.dataInicio?.split('T')[1]?.substring(0, 5);
      const endTime = reserva.dataFim?.split('T')[1]?.substring(0, 5);
      
      if (startTime && endTime) {
        occupiedTimes.push(startTime, endTime);
      }
    });
    
    return occupiedTimes;
  }, [baseHook.data, getVenueConfig]);

  return {
    ...baseHook,
    getReservaById,
    getReservasForSearch,
    createReserva,
    updateReserva,
    confirmarReserva,
    cancelarReserva,
    finalizarReserva,
    fetchReservasPorPeriodo,
    // Funções de timeline
    buscarReservasTimeline,
    getVenueConfig,
    getOccupiedTimes,
    timelineEvents,
    timelineLoading,
    // Aliases para compatibilidade
    reservas: baseHook.data,
    fetchReservas: baseHook.fetchData,
    deleteReserva: baseHook.deleteItem,
    getReserva: baseHook.getItem,
  };
}; 