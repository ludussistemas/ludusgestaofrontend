import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useContextoAgenda } from '@/contexts/AgendaContext';
import { useLocais } from '@/hooks/useLocais';
import { cn } from '@/lib/utils';
import type { Reserva } from '@/types';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from 'date-fns';
import { memo, useMemo } from 'react';

// COMPONENTES ATÔMICOS

function AgendaGrid({ children, numRows }: { children: React.ReactNode, numRows: number }) {
  // IMPORTANTE: O container pai deste componente deve ter h-full ou min-h-screen para o grid ocupar toda a tela
  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
          <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30 last:border-r-0">
            {dia}
          </div>
        ))}
      </div>
      {/* Grid do calendário */}
      <div className={cn(
        "flex-1 min-h-0 h-full grid grid-cols-7 gap-2 p-1 border-border/50 bg-muted/10",
        `grid-rows-${numRows}`
      )} style={{ height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

function AgendaCell({
  dia,
  isHoje,
  isForaDoMes,
  onClick,
  children,
  eventCount
}: {
  dia: Date;
  isHoje: boolean;
  isForaDoMes: boolean;
  onClick: () => void;
  children: React.ReactNode;
  eventCount: number;
}) {
  return (
    <div
      tabIndex={0}
      className={cn(
        "relative flex flex-col w-full h-full min-h-0 rounded-lg bg-white/80 shadow-sm border border-border p-0.5 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/40 hover:shadow-md overflow-hidden",
        isForaDoMes ? "bg-muted/30 text-muted-foreground/50 border-dashed opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-accent/10 bg-muted/80",
        isHoje && "ring-2 ring-primary/60 border-primary"
      )}
      onClick={e => {
        if (!isForaDoMes) onClick();
      }}
      style={{ minHeight: 0, height: '100%' }}
    >
      {/* Header do dia */}
      <div className="flex items-center justify-between mb-0.5 flex-shrink-0 h-6">
        <span className={cn(
          "text-sm font-bold transition-colors",
          isHoje && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm shadow",
          isForaDoMes && "text-muted-foreground/50"
        )}>
          {format(dia, 'd')}
        </span>
        {eventCount > 0 && (
          <Badge variant="secondary" className="text-[8px] h-4 px-1.5">
            {eventCount}
          </Badge>
        )}
      </div>
      {/* Wrapper dos eventos, ocupa todo o espaço restante */}
      <div className="absolute left-0.5 right-0.5 bottom-0.5 top-7 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function AgendaEvent({ evento, onClick }: { evento: Reserva; onClick: (e: React.MouseEvent) => void }) {
  const { getLocalById } = useLocais();
  const local = getLocalById(evento.localId);
  
  return (
    <div
      className="mb-0.5 rounded-sm bg-white shadow-sm border border-muted cursor-pointer hover:shadow-md transition-all duration-200 flex items-center px-1.5 py-1"
      style={{
        backgroundColor: local?.cor || evento.cor,
        color: '#fff',
        fontSize: '10px',
        lineHeight: '1.2',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minHeight: '24px',
        maxHeight: '24px',
        width: '100%',
        height: '24px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className="font-semibold truncate text-[10px] leading-tight flex-1 mr-1">{evento.cliente?.nome || 'Cliente não informado'}</div>
        <div className="text-[9px] font-medium leading-tight flex-shrink-0">{evento.dataInicio?.split('T')[1]?.substring(0, 5) || ''}-{evento.dataFim?.split('T')[1]?.substring(0, 5) || ''}</div>
      </div>
    </div>
  );
}

// Skeleton para célula mensal
function AgendaCellSkeleton({ isForaDoMes }: { isForaDoMes: boolean }) {
  return (
    <div className={cn(
      "relative min-h-[80px] p-1 rounded-lg border border-border/50 cursor-pointer transition-all duration-200 hover:bg-muted/50",
      isForaDoMes && "bg-muted/20 opacity-50"
    )}>
      {/* Skeleton do número do dia */}
      <div className="flex justify-between items-start mb-1">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
      
      {/* Skeletons dos eventos */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

// VISUALIZAÇÃO MENSAL REFACTORED

const VisaoMensal = memo(() => {
  const { getLocalById } = useLocais();
  const {
    dataAtual,
    eventosPorDiaELocal,
    handleDataClick,
    handleEventClick,
    loading
  } = useContextoAgenda();

  // Dias do mês
  const diasDoMes = useMemo(() => {
    const monthStart = startOfMonth(dataAtual);
    const monthEnd = endOfMonth(dataAtual);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [dataAtual]);

  // Se está carregando, mostrar skeletons
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-background min-h-0">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
            <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30 last:border-r-0">
              {dia}
            </div>
          ))}
        </div>
        
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-7 relative h-full min-h-0 gap-1 p-1 bg-muted/10">
            {diasDoMes.map((dia, index) => {
              const isCurrentMonth = dia.getMonth() === dataAtual.getMonth();
              const isForaDoMes = !isCurrentMonth;
              
              return (
                <AgendaCellSkeleton key={index} isForaDoMes={isForaDoMes} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Grid do calendário */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30 sticky top-0 z-10">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
          <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground border-r border-border/30 last:border-r-0">
            {dia}
          </div>
        ))}
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-7 relative h-full min-h-0 gap-1 p-1 bg-muted/10">
          {diasDoMes.map(dia => {
            const diaKey = dia.toISOString();
            const eventosDoDia = eventosPorDiaELocal[diaKey] || [];
            const isCurrentMonth = dia.getMonth() === dataAtual.getMonth();
            const isToday = isSameDay(dia, new Date());
            const isForaDoMes = !isCurrentMonth;
            
            // Calcular total de eventos para este dia (apenas do mês atual)
            const eventCount = isCurrentMonth ? eventosDoDia.length : 0;
            
            return (
              <AgendaCell
                key={diaKey}
                dia={dia}
                isHoje={isToday}
                isForaDoMes={isForaDoMes}
                eventCount={eventCount}
                onClick={() => handleDataClick(dia)}
              >
                {/* Eventos - apenas se for do mês atual */}
                {isCurrentMonth && (
                  <div className="space-y-0.5">
                    {eventosDoDia.slice(0, 3).map(evento => (
                      <AgendaEvent
                        key={evento.id}
                        evento={evento}
                        onClick={e => {
                          e.stopPropagation();
                          handleEventClick(evento);
                        }}
                      />
                    ))}
                    {eventosDoDia.length > 3 && (
                      <div className="text-[9px] font-medium text-muted-foreground text-center py-0.5">
                        +{eventosDoDia.length - 3} eventos
                      </div>
                    )}
                  </div>
                )}
              </AgendaCell>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VisaoMensal.displayName = 'VisaoMensal';

export default VisaoMensal;