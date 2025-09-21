import { Skeleton } from '@/components/ui/skeleton';
import { useContextoAgenda } from '@/contexts/AgendaContext';
import { useLocais } from '@/hooks/useLocais';
import type { Reserva } from '@/types';
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { memo, useMemo } from 'react';

// Timeline semanal com horas no eixo Y e dias no eixo X
const VisaoSemanal = memo(() => {
  const { data: locais } = useLocais();
  const {
    dataAtual,
    eventosPorDiaELocal,
    handleEventClick,
    loading,
    locaisSelecionados
  } = useContextoAgenda();

  // Filtrar locais selecionados
  const locaisFiltrados = useMemo(() => {
    if (!locaisSelecionados || locaisSelecionados.includes('all')) return locais;
    return locais.filter(l => locaisSelecionados.includes(l.id));
  }, [locais, locaisSelecionados]);

  // Calcular menor horário de abertura e maior de fechamento
  const [horaMin, horaMax] = useMemo(() => {
    let min = 23;
    let max = 0;
    locaisFiltrados.forEach(local => {
      const [hAbertura] = local.horaAbertura.split(':').map(Number);
      const [hFechamento] = local.horaFechamento.split(':').map(Number);
      if (hAbertura < min) min = hAbertura;
      if (hFechamento > max) max = hFechamento;
    });
    // Limites de segurança
    min = Math.max(0, min);
    max = Math.min(23, max);
    return [min, max];
  }, [locaisFiltrados]);

  // Calcular menor intervalo entre os locais
  const menorIntervalo = useMemo(() => {
    if (locaisFiltrados.length === 0) return 60; // Padrão 1 hora
    return Math.min(...locaisFiltrados.map(local => local.intervalo || 60));
  }, [locaisFiltrados]);

  // Gerar slots de tempo baseado no menor intervalo
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = horaMin; hour <= horaMax; hour++) {
      for (let minute = 0; minute < 60; minute += menorIntervalo) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, [horaMin, horaMax, menorIntervalo]);

  // Horários da timeline (para exibição no cabeçalho)
  const horarios = useMemo(() => {
    const horas = [];
    for (let i = horaMin; i <= horaMax; i++) {
      horas.push(i);
    }
    return horas;
  }, [horaMin, horaMax]);

  // Dias da semana
  const diasSemana = useMemo(() => {
    const weekStart = startOfWeek(dataAtual, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(dataAtual, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [dataAtual]);

  // Função para calcular posição e altura do evento
  const getEventPosition = (evento: Reserva) => {
    const startTime = evento.dataInicio?.split('T')[1]?.substring(0, 5) || '';
    const endTime = evento.dataFim?.split('T')[1]?.substring(0, 5) || '';
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Encontrar o índice do slot de início
    const startTimeDecimal = startHour + startMinute / 60;
    const endTimeDecimal = endHour + endMinute / 60;
    const duration = endTimeDecimal - startTimeDecimal;
    
    // Calcular posição baseada no slot
    const startSlotIndex = timeSlots.findIndex(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotTime = slotHour + slotMinute / 60;
      return slotTime >= startTime;
    });
    
    const top = startSlotIndex * 60; // Cada slot tem 60px de altura
    const height = Math.max(duration * 60, 30); // Mínimo 30px
    
    return { top, height };
  };

  // Função para verificar se evento está no horário
  const isEventInTimeSlot = (evento: Reserva, slot: string) => {
    const startTime = evento.dataInicio?.split('T')[1]?.substring(0, 5) || '';
    const endTime = evento.dataFim?.split('T')[1]?.substring(0, 5) || '';
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    const [slotHour] = slot.split(':').map(Number);
    return startHour <= slotHour && endHour > slotHour;
  };

  // Hora atual para indicador
  const horaAtual = useMemo(() => {
    const agora = new Date();
    return agora.getHours();
  }, []);

  // Função para calcular posição da linha do tempo atual
  const getCurrentTimePosition = () => {
    const agora = new Date();
    const hora = agora.getHours();
    const minuto = agora.getMinutes();
    const currentTime = hora + minuto / 60;
    
    // Encontrar o slot mais próximo
    const slotIndex = timeSlots.findIndex(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotTime = slotHour + slotMinute / 60;
      return slotTime >= currentTime;
    });
    
    return Math.max(0, slotIndex * 60);
  };

  // Se está carregando, mostrar skeleton
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-background min-h-0">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-8 border-b border-border bg-muted/30">
          <div className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30">
            Horário
          </div>
          {diasSemana.map(dia => (
            <div key={dia.toISOString()} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30 last:border-r-0">
              {format(dia, 'EEE dd/MM', { locale: ptBR })}
            </div>
          ))}
        </div>
        
        {/* Timeline com skeletons */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="grid grid-cols-8 relative min-h-[960px]">
            {/* Coluna de horários */}
            <div className="border-r border-border/30">
              {timeSlots.map(slot => (
                <div key={slot} className="h-[60px] border-b border-border/20 flex items-center justify-center text-xs text-muted-foreground">
                  {slot}
                </div>
              ))}
            </div>
            
            {/* Colunas dos dias com skeletons */}
            {diasSemana.map((dia, diaIndex) => (
              <div key={dia.toISOString()} className="border-r border-border/30 last:border-r-0 relative">
                {timeSlots.map(slot => (
                  <div key={slot} className="h-[60px] border-b border-border/20 relative">
                    <Skeleton className="h-4 w-full mx-1 my-2" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Cabeçalho dos dias */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/30 sticky top-0 z-10">
        <div className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30">
          Horário
        </div>
        {diasSemana.map(dia => (
          <div key={dia.toISOString()} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30 last:border-r-0">
            {format(dia, 'EEE dd/MM', { locale: ptBR })}
          </div>
        ))}
      </div>
      
      {/* Timeline principal */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="grid grid-cols-8 relative min-h-[960px]">
          {/* Coluna de horários */}
          <div className="border-r border-border/30 bg-muted/10">
            {timeSlots.map(slot => (
              <div key={slot} className="h-[60px] border-b border-border/20 flex items-center justify-center text-xs text-muted-foreground font-medium">
                {slot}
              </div>
            ))}
          </div>
          
          {/* Colunas dos dias */}
          {diasSemana.map(dia => {
            const dayKey = dia.toISOString();
            const dayEvents = eventosPorDiaELocal[dayKey] || [];
            const isToday = new Date().toDateString() === dia.toDateString();
            
            return (
              <div key={dayKey} className="border-r border-border/30 last:border-r-0 relative">
                {/* Linha do tempo atual (apenas para hoje) */}
                {isToday && (
                  <div 
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ 
                      top: `${getCurrentTimePosition()}px`,
                      height: '2px',
                      background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                      boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    <div className="absolute -left-1 -top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                )}
                
                {/* Grade de horários */}
                {timeSlots.map(slot => (
                  <div key={slot} className="h-[60px] border-b border-border/20 relative">
                    {/* Eventos que estão ativos neste horário */}
                    {dayEvents
                      .filter(evento => {
                        const startTime = evento.dataInicio?.split('T')[1]?.substring(0, 5) || '';
                        const endTime = evento.dataFim?.split('T')[1]?.substring(0, 5) || '';
                        const [startHour, startMinute] = startTime.split(':').map(Number);
                        const [endHour, endMinute] = endTime.split(':').map(Number);
                        const [slotHour, slotMinute] = slot.split(':').map(Number);
                        
                        const startTimeDecimal = startHour + startMinute / 60;
                        const endTimeDecimal = endHour + endMinute / 60;
                        const slotTime = slotHour + slotMinute / 60;
                        
                        // Mostrar evento se ele começa neste slot OU se está ativo neste slot
                        return startTimeDecimal === slotTime || (startTimeDecimal < slotTime && endTimeDecimal > slotTime);
                      })
                      .map(evento => {
                        const { top, height } = getEventPosition(evento);
                        const startTime = evento.dataInicio?.split('T')[1]?.substring(0, 5) || '';
                        const [startHour, startMinute] = startTime.split(':').map(Number);
                        const startTimeDecimal = startHour + startMinute / 60;
                        const [slotHour, slotMinute] = slot.split(':').map(Number);
                        const slotTime = slotHour + slotMinute / 60;
                        
                        // Se o evento começa neste slot, mostrar normalmente
                        if (startTimeDecimal === slotTime) {
                          return (
                            <div
                              key={evento.id}
                              className="absolute left-0 right-0 mx-1 rounded-md p-1 text-xs shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow z-10"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                backgroundColor: evento.cor,
                                color: '#fff',
                                fontSize: '10px',
                                lineHeight: '1.2',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                handleEventClick(evento);
                              }}
                            >
                              <div className="font-medium truncate">{evento.cliente?.nome || 'Cliente não informado'}</div>
                              <div className="truncate text-[9px]">{evento.dataInicio?.split('T')[1]?.substring(0, 5) || ''} - {evento.dataFim?.split('T')[1]?.substring(0, 5) || ''}</div>
                              {evento.esporte && (
                                <div className="truncate text-[8px] opacity-90">{evento.esporte}</div>
                              )}
                            </div>
                          );
                        }
                        
                        // Se o evento está ativo mas não começa neste slot, mostrar apenas uma continuação
                        return (
                          <div
                            key={`${evento.id}-${slot}`}
                            className="absolute left-0 right-0 mx-1 border-l-4 cursor-pointer hover:opacity-80 transition-opacity z-5"
                            style={{
                              top: '0px',
                              height: '60px',
                              backgroundColor: evento.cor,
                              borderLeftColor: evento.cor,
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              handleEventClick(evento);
                            }}
                          >
                            <div className="h-full flex items-center justify-center">
                              <div className="text-[8px] text-white font-medium truncate px-1 text-shadow-sm">
                                {evento.cliente}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VisaoSemanal.displayName = 'VisaoSemanal';

export default VisaoSemanal;