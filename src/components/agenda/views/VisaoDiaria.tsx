import { Skeleton } from '@/components/ui/skeleton';
import { useContextoAgenda } from '@/contexts/AgendaContext';
import { useLocais } from '@/hooks/useLocais';
import { cn } from '@/lib/utils';
import type { Evento } from '@/types/eventos';
import { format, isSameDay, isSameHour, parseISO } from 'date-fns';
import { memo, useEffect, useMemo, useState } from 'react';

function AgendaGrid({ children }: { children: React.ReactNode }) {
  return <div className="h-full flex flex-col bg-background min-h-0 overflow-hidden max-h-full">{children}</div>;
}

// Skeleton para célula da timeline
function TimelineCellSkeleton({ isCurrentTime = false }: { isCurrentTime?: boolean }) {
  return (
    <div className={cn(
      "border-b border-border/50 relative h-12 p-2 transition-all duration-200 flex-shrink-0",
      isCurrentTime && "bg-blue-50/50 border-blue-200"
    )}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-12" />
        <div className="flex-1 ml-4">
          <Skeleton className="h-3 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para evento da timeline
function AgendaEventSkeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="absolute left-0 right-0 mx-1 rounded-md bg-white p-2 text-xs shadow-sm border border-gray-200"
      style={style}
    >
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-2 w-2/3 mb-1" />
      <Skeleton className="h-2 w-1/2" />
    </div>
  );
}

function TimelineCell({ children, className, isCurrentTime = false }: { 
  children: React.ReactNode; 
  className?: string;
  isCurrentTime?: boolean;
}) {
  return (
    <div className={cn(
      "border-b border-border/50 relative h-12 p-2 transition-all duration-200 flex-shrink-0",
      isCurrentTime && "bg-blue-50/50 border-blue-200",
      className
    )}>
      {children}
    </div>
  );
}

function CurrentTimeIndicator({ currentTime, timeSlots }: { currentTime: Date; timeSlots: string[] }) {
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentTimePosition = () => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;
    
    // Encontrar o slot mais próximo
    let closestSlot = timeSlots[0];
    let minDiff = Math.abs(timeToMinutes(timeSlots[0]) - currentMinutes);
    
    timeSlots.forEach(slot => {
      const diff = Math.abs(timeToMinutes(slot) - currentMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestSlot = slot;
      }
    });
    
    const slotIndex = timeSlots.indexOf(closestSlot);
    return slotIndex * 48; // 48px por slot (h-12)
  };

  const position = getCurrentTimePosition();

  return (
    <div 
      className="absolute left-0 right-0 z-30 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="flex items-center">
        <div className="w-20 h-0.5 bg-red-500 flex-shrink-0"></div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 -mt-1.5"></div>
      </div>
      <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
        {format(currentTime, 'HH:mm')}
      </div>
    </div>
  );
}

function AgendaEvent({ evento, style, onClick }: { evento: Evento; style?: React.CSSProperties; onClick: (e: React.MouseEvent) => void }) {
  const { buscarPorId } = useLocais();
  const local = buscarPorId(evento.localId);
  
  return (
    <div
      className="absolute left-0 right-0 mx-1 rounded-md p-2 text-xs shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      style={{
        ...style,
        backgroundColor: local?.cor || evento.cor,
        color: '#fff',
        fontSize: '11px',
        lineHeight: '1.3',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
      onClick={onClick}
    >
      <div className="font-medium truncate">{evento.cliente?.nome || 'Cliente não informado'}</div>
      <div className="truncate">{evento.dataInicio?.split('T')[1]?.substring(0, 5) || ''} - {evento.dataFim?.split('T')[1]?.substring(0, 5) || ''}</div>
      {evento.esporte && <div className="truncate text-xs opacity-90">{evento.esporte}</div>}
    </div>
  );
}

const VisaoDiaria = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { buscarPorId, locais } = useLocais();
  const {
    dataAtual,
    eventos,
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
      const [hAbertura] = local.horarioAbertura.split(':').map(Number);
      const [hFechamento] = local.horarioFechamento.split(':').map(Number);
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

  // Gerar timeSlots baseado no menor intervalo
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = horaMin; hour <= horaMax; hour++) {
      for (let minute = 0; minute < 60; minute += menorIntervalo) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, [horaMin, horaMax, menorIntervalo]);

  // Atualizar hora atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar eventos do dia
  const dayEvents = useMemo(() => {
    return eventos.filter(evento => isSameDay(parseISO(evento.data), dataAtual));
  }, [eventos, dataAtual]);

  // Utilitário para converter hora em minutos
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Posição do evento
  const getEventPosition = (event: Evento) => {
    const startTime = event.dataInicio?.split('T')[1]?.substring(0, 5) || '';
    const endTime = event.dataFim?.split('T')[1]?.substring(0, 5) || '';
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = endMinutes - startMinutes;
    
    const firstSlotMinutes = timeToMinutes(timeSlots[0]);
    const topOffset = ((startMinutes - firstSlotMinutes) / menorIntervalo) * 48; // 48px por slot
    const height = (duration / menorIntervalo) * 48;
    
    return {
      top: `${topOffset}px`,
      height: `${Math.max(height - 2, 40)}px`
    };
  };

  // Verificar se é hora atual
  const isCurrentTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    return isSameHour(currentTime, timeDate) && 
           Math.abs(currentTime.getMinutes() - minutes) <= 15;
  };

  const dayKey = format(dataAtual, 'yyyy-MM-dd');
  const isToday = isSameDay(dataAtual, new Date());

  // Se está carregando, mostrar skeletons
  if (loading) {
    return (
      <AgendaGrid>
        {/* Timeline com scroll controlado */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="relative max-h-[calc(100vh-200px)]" style={{ 
            minWidth: '280px',
            height: `${timeSlots.length * 48}px`
          }}>
            {/* Grid da timeline */}
            <div className="grid grid-cols-[80px_1fr] h-full">
              {/* Coluna de horários */}
              <div className="border-r border-border">
                {timeSlots.map((time, idx) => (
                  <TimelineCellSkeleton 
                    key={time} 
                    isCurrentTime={isCurrentTimeSlot(time)}
                  />
                ))}
              </div>

              {/* Coluna de eventos */}
              <div className="relative">
                {timeSlots.map((time, idx) => (
                  <TimelineCell key={time} className="relative">
                    <></>
                  </TimelineCell>
                ))}
                
                {/* Skeletons dos eventos */}
                <AgendaEventSkeleton style={{ top: '60px', height: '60px' }} />
                <AgendaEventSkeleton style={{ top: '180px', height: '90px' }} />
                <AgendaEventSkeleton style={{ top: '300px', height: '45px' }} />
              </div>
            </div>
          </div>
        </div>
      </AgendaGrid>
    );
  }

  return (
    <AgendaGrid>
      {/* Timeline com scroll controlado */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="relative max-h-[calc(100vh-200px)]" style={{ 
          minWidth: '280px',
          height: `${timeSlots.length * 48}px`
        }}>
          {/* Indicador de hora atual */}
          {isToday && <CurrentTimeIndicator currentTime={currentTime} timeSlots={timeSlots} />}
          
          {/* Grid da timeline */}
          <div className="grid grid-cols-[80px_1fr] h-full">
            {/* Coluna de horários */}
            <div className="border-r border-border">
              {timeSlots.map((time, idx) => (
                <TimelineCell 
                  key={time} 
                  isCurrentTime={isCurrentTimeSlot(time)}
                  className="flex items-center justify-end pr-3"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {time}
                  </span>
                </TimelineCell>
              ))}
            </div>

            {/* Coluna de eventos */}
            <div className="relative">
              {timeSlots.map((time, idx) => (
                <TimelineCell key={time} className="relative">
                  <></>
                </TimelineCell>
              ))}
              
              {/* Eventos */}
              {dayEvents.map(evento => (
                <AgendaEvent
                  key={evento.id}
                  evento={evento}
                  style={getEventPosition(evento)}
                  onClick={e => {
                    e.stopPropagation();
                    handleEventClick(evento);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgendaGrid>
  );
});

VisaoDiaria.displayName = 'VisaoDiaria';

export default VisaoDiaria;