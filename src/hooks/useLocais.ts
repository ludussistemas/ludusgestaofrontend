
import { toast } from 'sonner';
import { useCallback } from 'react';
import { useBaseCrud } from '../core/hooks/useBaseCrud';
import { api, ApiResponse } from '../lib/api';
import { Local, CreateLocalDTO, UpdateLocalDTO } from '../types';

export const useLocais = () => {
  const baseHook = useBaseCrud<Local>('locais', {
    transformData: (data) => data,
    transformPagination: (pagination) => pagination
  });

  const getLocalById = useCallback((id: string) => baseHook.data.find(l => l.id === id), [baseHook.data]);

  const getLocaisForSearch = async () => {
    await baseHook.fetchData({ limit: 1000 });
    return baseHook.data.map(local => ({
      id: local.id,
      label: local.nome,
      subtitle: local.descricao || local.nome
    }));
  };

  const createLocal = async (localData: CreateLocalDTO) => {
    try {
      const loadingToast = toast.loading('Criando local...');
      
      const response = await api.post<ApiResponse<Local>>('locais', localData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Local criado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao criar local');
        throw new Error(response.message || 'Erro ao criar local');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar local';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateLocal = async (id: string, localData: UpdateLocalDTO) => {
    try {
      const loadingToast = toast.loading('Atualizando local...');
      
      const response = await api.put<ApiResponse<Local>>(`locais/${id}`, localData);
      
      toast.dismiss(loadingToast);

      if (response.success && response.data) {
        toast.success('Local atualizado com sucesso!');
        await baseHook.fetchData({ 
          page: baseHook.pagination.currentPage, 
          limit: baseHook.pagination.pageSize 
        });
        return response.data;
      } else {
        toast.error(response.message || 'Erro ao atualizar local');
        throw new Error(response.message || 'Erro ao atualizar local');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar local';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Funções para gerenciar configurações de horários dos locais
  const generateTimeSlots = (venueId: string, startHour: number = 7, endHour: number = 21, customInterval?: number, locaisData?: any[]) => {
    const locais = locaisData || baseHook.data;
    
    if (venueId === 'all' || venueId === 'custom') {
      // Para 'all' ou 'custom', usar intervalo padrão ou customizado
      const interval = customInterval || 30;
      return generateTimeSlotsForInterval(startHour, endHour, interval);
    }

    // Buscar o local específico
    const venue = locais.find(l => l.id === venueId);
    if (!venue) {
      return generateTimeSlotsForInterval(startHour, endHour, 30);
    }

    // Usar configurações do local
    const startTime = parseInt(venue.horaAbertura.split(':')[0]) || startHour;
    const endTime = parseInt(venue.horaFechamento.split(':')[0]) || endHour;
    const interval = venue.intervalo || 30;

    console.log('🔍 generateTimeSlots Debug:');
    console.log('  - venue:', venue.nome);
    console.log('  - horaAbertura:', venue.horaAbertura);
    console.log('  - horaFechamento:', venue.horaFechamento);
    console.log('  - intervalo:', venue.intervalo);
    console.log('  - startTime calculado:', startTime);
    console.log('  - endTime calculado:', endTime);
    console.log('  - interval usado:', interval);

    return generateTimeSlotsForInterval(startTime, endTime, interval);
  };

  // Função auxiliar para gerar slots de tempo
  const generateTimeSlotsForInterval = (startHour: number, endHour: number, interval: number) => {
    const slots = [];
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;
    const totalMinutes = endMinutes - startMinutes;
    const numSlots = Math.floor(totalMinutes / interval);

    console.log('🔍 generateTimeSlotsForInterval Debug:');
    console.log('  - startHour:', startHour);
    console.log('  - endHour:', endHour);
    console.log('  - interval:', interval);
    console.log('  - startMinutes:', startMinutes);
    console.log('  - endMinutes:', endMinutes);
    console.log('  - totalMinutes:', totalMinutes);
    console.log('  - numSlots:', numSlots);

    for (let i = 0; i < numSlots; i++) {
      const currentMinutes = startMinutes + (i * interval);
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      slots.push({
        time: timeString,
        hour: hours,
        minute: minutes,
        totalMinutes: currentMinutes
      });
    }

    console.log('  - slots gerados:', slots.length);
    console.log('  - primeiros slots:', slots.slice(0, 5));
    console.log('  - últimos slots:', slots.slice(-5));

    return slots;
  };

  // Obter intervalo do local
  const getVenueInterval = (venueId: string, locaisData?: any[]) => {
    const locais = locaisData || baseHook.data;
    
    if (venueId === 'all') {
      // Para 'all', retornar o menor intervalo entre todos os locais
      const intervals = locais.map(l => l.intervalo).filter(Boolean);
      return intervals.length > 0 ? Math.min(...intervals) : 30;
    }

    const venue = locais.find(l => l.id === venueId);
    return venue?.intervalo || 30;
  };

  // Obter horário de abertura do local
  const getVenueOpenTime = (venueId: string) => {
    if (venueId === 'all') {
      return '07:00'; // Horário padrão
    }

    const venue = baseHook.data.find(l => l.id === venueId);
    return venue?.horaAbertura || '07:00';
  };

  // Obter horário de fechamento do local
  const getVenueCloseTime = (venueId: string) => {
    if (venueId === 'all') {
      return '21:00'; // Horário padrão
    }

    const venue = baseHook.data.find(l => l.id === venueId);
    return venue?.horaFechamento || '21:00';
  };

  return {
    ...baseHook,
    getLocalById,
    getLocal: baseHook.getItem, // Função para buscar dados específicos da API
    getLocaisForSearch,
    createLocal,
    updateLocal,
    // Funções de configuração de horários
    generateTimeSlots,
    getVenueInterval,
    getVenueOpenTime,
    getVenueCloseTime,
    // Aliases para compatibilidade
    locais: baseHook.data,
    fetchLocais: baseHook.fetchData,
    deleteLocal: baseHook.deleteItem,
  };
};
