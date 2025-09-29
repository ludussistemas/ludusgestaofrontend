import type { Reserva } from '@/types';
import { eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, isSameMonth, isSameWeek, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocais } from './useLocais';
import { useReservas } from './useReservas';

export type TipoVisualizacao = 'mes' | 'semana' | 'dia' | 'lista';

const STORAGE_KEY = 'agenda_view_state';

function getInitialAgendaState() {
  if (typeof window === 'undefined') return undefined;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return undefined;
}

const initialState = getInitialAgendaState();

export function useAgenda() {
  const navigate = useNavigate();
  const { data: locais, loading: locaisLoading } = useLocais();
  const {
    data: reservas,
    loading: reservasLoading,
    fetchData: fetchReservas,
    fetchReservasPorPeriodo
  } = useReservas();

  // Estado de carregamento da restauração
  const [restaurando, setRestaurando] = useState(true);

  // Estado da agenda (inicial padrão)
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('mes');
  const [dataAtual, setDataAtual] = useState<Date>(new Date());
  const [locaisSelecionados, setLocaisSelecionados] = useState<string[]>(['all']);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [ultimaConsulta, setUltimaConsulta] = useState<{
    tipoVisualizacao: TipoVisualizacao;
    dataInicio: Date;
    dataFim: Date;
    localIds: string[] | undefined;
  } | null>(null);
  const [reservasAgenda, setReservasAgenda] = useState<Reserva[]>([]);

  // Restaurar do localStorage no primeiro render
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.tipoVisualizacao) setTipoVisualizacao(parsed.tipoVisualizacao);
        if (parsed.dataAtual) {
          const d = new Date(parsed.dataAtual);
          setDataAtual(isNaN(d.getTime()) ? new Date() : d);
        }
        if (parsed.locaisSelecionados) setLocaisSelecionados(parsed.locaisSelecionados);
        if (typeof parsed.sidebarExpanded === 'boolean') setSidebarExpanded(parsed.sidebarExpanded);
      }
    } catch {}
    setRestaurando(false);
  }, []);

  // Persistir no localStorage sempre que mudar
  useEffect(() => {
    if (restaurando) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tipoVisualizacao,
      dataAtual,
      locaisSelecionados,
      sidebarExpanded,
    }));
  }, [tipoVisualizacao, dataAtual, locaisSelecionados, sidebarExpanded, restaurando]);

  // Função para verificar se precisa fazer nova consulta
  const precisaNovaConsulta = useCallback((
    novoFiltros: {
      tipoVisualizacao: TipoVisualizacao;
      dataInicio: Date;
      dataFim: Date;
      localIds: string[] | undefined;
    }
  ): boolean => {
    if (!ultimaConsulta) return true;

    const { tipoVisualizacao, dataInicio, dataFim, localIds } = novoFiltros;
    const { tipoVisualizacao: ultTipo, dataInicio: ultDataInicio, dataFim: ultDataFim, localIds: ultLocalIds } = ultimaConsulta;

    // Se mudou o tipo de visualização, sempre fazer nova consulta
    if (tipoVisualizacao !== ultTipo) {
      console.log('🔄 Nova consulta: tipo de visualização mudou');
      return true;
    }

    // Se mudaram os locais selecionados, fazer nova consulta
    const locaisAtuais = localIds?.sort().join(',') || 'all';
    const locaisAnteriores = ultLocalIds?.sort().join(',') || 'all';
    if (locaisAtuais !== locaisAnteriores) {
      console.log('🔄 Nova consulta: locais selecionados mudaram');
      return true;
    }

    // Verificar se a nova data está dentro do período já consultado
    switch (tipoVisualizacao) {
      case 'mes':
        // Se está no mesmo mês, não precisa nova consulta
        if (isSameMonth(dataInicio, ultDataInicio)) {
          console.log('📦 Cache: mesmo mês, usando dados existentes');
          return false;
        }
        break;
      
      case 'semana':
        // Se está na mesma semana, não precisa nova consulta
        if (isSameWeek(dataInicio, ultDataInicio, { weekStartsOn: 0 })) {
          console.log('📦 Cache: mesma semana, usando dados existentes');
          return false;
        }
        break;
      
      case 'dia':
        // Se é o mesmo dia, não precisa nova consulta
        if (isSameDay(dataInicio, ultDataInicio)) {
          console.log('📦 Cache: mesmo dia, usando dados existentes');
          return false;
        }
        break;
      
      case 'lista':
        // Se está no mesmo mês, não precisa nova consulta
        if (isSameMonth(dataInicio, ultDataInicio)) {
          console.log('📦 Cache: mesmo mês (lista), usando dados existentes');
          return false;
        }
        break;
    }

    console.log('🔄 Nova consulta: período mudou');
    return true;
  }, [ultimaConsulta]);

  // Calcular filtros baseados na visualização atual
  const filtrosReservas = useMemo(() => {
    let dataInicio: Date;
    let dataFim: Date;
    
    switch (tipoVisualizacao) {
      case 'mes':
        dataInicio = startOfMonth(dataAtual);
        dataFim = endOfMonth(dataAtual);
        break;
      case 'semana':
        dataInicio = startOfWeek(dataAtual, { weekStartsOn: 0 });
        dataFim = endOfWeek(dataAtual, { weekStartsOn: 0 });
        break;
      case 'dia':
        dataInicio = dataAtual;
        dataFim = dataAtual;
        break;
      case 'lista':
        dataInicio = startOfMonth(dataAtual);
        dataFim = endOfMonth(dataAtual);
        break;
      default:
        dataInicio = startOfMonth(dataAtual);
        dataFim = endOfMonth(dataAtual);
    }

    const localIds = locaisSelecionados.includes('all') ? undefined : locaisSelecionados;

    return {
      dataInicio,
      dataFim,
      localIds
    };
  }, [tipoVisualizacao, dataAtual, locaisSelecionados]);

  // Verificar se precisa fazer nova consulta
  const deveFazerConsulta = useMemo(() => {
    // Sempre fazer consulta se não há última consulta
    if (!ultimaConsulta) {
      return true;
    }

    const { tipoVisualizacao: ultTipo, dataInicio: ultDataInicio, dataFim: ultDataFim, localIds: ultLocalIds } = ultimaConsulta;

    // Se mudou o tipo de visualização, sempre fazer nova consulta
    if (tipoVisualizacao !== ultTipo) {
      console.log('🔄 Nova consulta: tipo de visualização mudou');
      return true;
    }

    // Se mudaram os locais selecionados, fazer nova consulta
    const locaisAtuais = filtrosReservas.localIds?.sort().join(',') || 'all';
    const locaisAnteriores = ultLocalIds?.sort().join(',') || 'all';
    if (locaisAtuais !== locaisAnteriores) {
      console.log('🔄 Nova consulta: locais selecionados mudaram');
      return true;
    }

    // Verificar se a nova data está dentro do período já consultado
    switch (tipoVisualizacao) {
      case 'mes':
        // Se está no mesmo mês, não precisa nova consulta
        if (isSameMonth(filtrosReservas.dataInicio!, ultDataInicio)) {
          console.log('📦 Cache: mesmo mês, usando dados existentes');
          return false;
        }
        break;
      
      case 'semana':
        // Se está na mesma semana, não precisa nova consulta
        if (isSameWeek(filtrosReservas.dataInicio!, ultDataInicio, { weekStartsOn: 0 })) {
          console.log('📦 Cache: mesma semana, usando dados existentes');
          return false;
        }
        break;
      
      case 'dia':
        // Se é o mesmo dia, não precisa nova consulta
        if (isSameDay(filtrosReservas.dataInicio!, ultDataInicio)) {
          console.log('📦 Cache: mesmo dia, usando dados existentes');
          return false;
        }
        break;
      
      case 'lista':
        // Se está no mesmo mês, não precisa nova consulta
        if (isSameMonth(filtrosReservas.dataInicio!, ultDataInicio)) {
          console.log('📦 Cache: mesmo mês (lista), usando dados existentes');
          return false;
        }
        break;
    }

    console.log('🔄 Nova consulta: período mudou');
    return true;
  }, [ultimaConsulta, tipoVisualizacao, filtrosReservas]);

  // Função para buscar reservas só quando necessário
  const buscarReservasAgenda = useCallback(async () => {
    if (filtrosReservas.dataInicio && filtrosReservas.dataFim) {
      try {
        const dataInicio = filtrosReservas.dataInicio.toISOString().split('T')[0];
        const dataFim = filtrosReservas.dataFim.toISOString().split('T')[0];
        
        console.log('🔄 Buscando reservas para período:', { dataInicio, dataFim, locaisSelecionados });
        
        await fetchReservasPorPeriodo(dataInicio, dataFim, locaisSelecionados);
        
        setUltimaConsulta({
          tipoVisualizacao,
          dataInicio: filtrosReservas.dataInicio!,
          dataFim: filtrosReservas.dataFim!,
          localIds: filtrosReservas.localIds
        });
      } catch (error) {
        console.error('Erro ao buscar reservas da agenda:', error);
        // O erro já foi tratado no fetchReservasPorPeriodo com toast
      }
    }
  }, [fetchReservasPorPeriodo, filtrosReservas, tipoVisualizacao]);

  useEffect(() => {
    if (deveFazerConsulta) {
      console.log('🔄 Fazendo consulta de reservas:', {
        tipoVisualizacao,
        dataInicio: filtrosReservas.dataInicio?.toISOString(),
        dataFim: filtrosReservas.dataFim?.toISOString(),
        localIds: filtrosReservas.localIds
      });
      buscarReservasAgenda();
    }
  }, [deveFazerConsulta, buscarReservasAgenda]);

  // Sincronizar reservasAgenda com reservas do hook useReservas
  useEffect(() => {
    setReservasAgenda(reservas);
  }, [reservas]);

  // Estado de loading combinado
  const loading = reservasLoading || locaisLoading;

  // Função para sincronizar (limpar cache e forçar nova consulta)
  const sincronizar = useCallback(async () => {
    console.log('🔄 Sincronizando dados...');
    setUltimaConsulta(null); // Força nova consulta
  }, []);

  // Navegação entre datas
  const navegarData = useCallback((direcao: 'anterior' | 'proxima') => {
    console.log('🔄 Navegando data:', { direcao, tipoVisualizacao, dataAtual: dataAtual.toISOString() });
    setDataAtual(prev => {
      const novaData = new Date(prev);
      const incremento = direcao === 'proxima' ? 1 : -1;
      switch (tipoVisualizacao) {
        case 'mes':
          novaData.setMonth(prev.getMonth() + incremento);
          novaData.setDate(1);
          break;
        case 'semana':
          novaData.setDate(prev.getDate() + (7 * incremento));
          break;
        case 'dia':
          novaData.setDate(prev.getDate() + incremento);
          break;
        case 'lista':
          novaData.setMonth(prev.getMonth() + incremento);
          novaData.setDate(1);
          break;
        default:
          novaData.setMonth(prev.getMonth() + incremento);
          novaData.setDate(1);
          break;
      }
      console.log('🔄 Nova data calculada:', novaData.toISOString());
      return novaData;
    });
  }, [tipoVisualizacao, dataAtual]);

  const irParaHoje = useCallback(() => {
    setDataAtual(new Date());
  }, []);

  // Métodos para locais selecionados
  const alternarLocal = useCallback((localId: string) => {
    setLocaisSelecionados(prev => {
      if (localId === 'all') {
        return ['all'];
      }
      let novos;
      if (prev.includes(localId)) {
        novos = prev.filter(id => id !== localId && id !== 'all');
      } else {
        novos = [...prev.filter(id => id !== 'all'), localId];
      }
      return novos.length === 0 ? ['all'] : novos;
    });
  }, []);

  const setarLocaisSelecionados = useCallback((locais: string[]) => {
    setLocaisSelecionados(locais.length === 0 ? ['all'] : locais);
  }, []);

  const isLocalSelecionado = useCallback((localId: string) => {
    return locaisSelecionados.includes(localId);
  }, [locaisSelecionados]);

  // Organizar reservas por dia para visualizações (filtrados por período e local no frontend)
  const reservasPorDiaELocal = useMemo(() => {
    const organizados: Record<string, Reserva[]> = {};
    
    // Obter dias baseado na visualização
    let dias: Date[] = [];
    if (tipoVisualizacao === 'semana') {
      const weekStart = startOfWeek(dataAtual, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(dataAtual, { weekStartsOn: 0 });
      dias = eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else if (tipoVisualizacao === 'mes') {
      const monthStart = startOfMonth(dataAtual);
      const monthEnd = endOfMonth(dataAtual);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      dias = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else if (tipoVisualizacao === 'dia') {
      dias = [dataAtual];
    }

    dias.forEach(dia => {
      const reservasDoDia = reservasAgenda.filter(reserva => {
        try {
          // Usar o campo 'dataInicio' que é o principal do backend
          if (!reserva.dataInicio) {
            return false;
          }
          
          const dataReserva = reserva.dataInicio.split('T')[0];
          const mesmoDia = isSameDay(parseISO(dataReserva), dia);
          
          // Aplicar filtro por local no frontend quando necessário
          // (quando há 2+ locais selecionados ou "all")
          const localSelecionado = locaisSelecionados.includes('all') || 
                                 locaisSelecionados.includes(reserva.localId);
          
          return mesmoDia && localSelecionado;
        } catch (error) {
          console.warn('Erro ao parsear data da reserva:', reserva, error);
          return false;
        }
      });
      organizados[dia.toISOString()] = reservasDoDia;
    });
    
    return organizados;
  }, [reservasAgenda, tipoVisualizacao, dataAtual, locaisSelecionados]);

  // Calcular contadores de eventos por local
  const eventCountByVenue = useMemo(() => {
    const counts: Record<string, number> = {};
    
    reservasAgenda.forEach(reserva => {
      if (reserva.localId) {
        counts[reserva.localId] = (counts[reserva.localId] || 0) + 1;
      }
    });
    
    return counts;
  }, [reservasAgenda]);

  // Handlers de eventos
  const handleEventClick = useCallback((reserva: Reserva) => {
    console.log('Reserva clicada:', reserva);
    // Navegar para página de edição da reserva
    navigate(`/eventos/reserva/${reserva.id}/editar`);
  }, [navigate]);

  const handleDataClick = useCallback((data: Date) => {
    console.log('Data clicada:', data);
    // Implementar navegação para criação de reserva
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const dataStr = `${ano}-${mes}-${dia}`;
    navigate(`/eventos/reserva?date=${dataStr}`);
  }, [navigate]);

  const handleNovoEvento = useCallback(() => {
    const ano = dataAtual.getFullYear();
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const dataStr = `${ano}-${mes}-${dia}`;
    navigate(`/eventos/reserva?date=${dataStr}`);
  }, [dataAtual, navigate]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarExpanded(exp => !exp);
  }, []);

  // No final do hook, só retorna o estado se não estiver restaurando
  if (restaurando) {
    return {
      tipoVisualizacao,
      setTipoVisualizacao: () => {},
      dataAtual,
      setDataAtual: () => {},
      locaisSelecionados,
      setLocaisSelecionados: () => {},
      sidebarExpanded,
      locais,
      eventos: [],
      eventosPorDiaELocal: {},
      loading: true,
      navegarData: () => {},
      irParaHoje: () => {},
      alternarLocal: () => {},
      setarLocaisSelecionados: () => {},
      isLocalSelecionado: () => false,
      handleEventClick: () => {},
      handleDataClick: () => {},
      handleNovoEvento: () => {},
      handleToggleSidebar: () => {},
      sincronizar: () => {},
    };
  }

  return {
    // Estado
    tipoVisualizacao,
    setTipoVisualizacao,
    dataAtual,
    setDataAtual,
    locaisSelecionados,
    setLocaisSelecionados,
    sidebarExpanded,
    locais,
    eventos: reservasAgenda, // Mantém compatibilidade com componentes existentes
    eventosPorDiaELocal: reservasPorDiaELocal, // Mantém compatibilidade
    eventCountByVenue, // Contadores de eventos por local
    loading,
    
    // Métodos de navegação
    navegarData,
    irParaHoje,
    
    // Métodos de locais
    alternarLocal,
    setarLocaisSelecionados,
    isLocalSelecionado,
    
    // Handlers de eventos
    handleEventClick,
    handleDataClick,
    handleNovoEvento,
    handleToggleSidebar,
    sincronizar
  };
} 