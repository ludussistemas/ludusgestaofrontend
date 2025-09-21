import { Badge } from '@/components/ui/badge';
import { useContextoAgenda } from '@/contexts/AgendaContext';
import { useLocais } from '@/hooks/useLocais';
import type { Evento } from '@/types/eventos';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { memo, useMemo } from 'react';

function AgendaEvent({ evento, onClick }: { evento: Evento; onClick: (e: React.MouseEvent) => void }) {
  const { buscarPorId } = useLocais();
  const local = buscarPorId(evento.localId);
  
  return (
    <div
      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Indicador de cor do local */}
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: local?.cor || evento.cor }}
        />
        
        {/* Informações do evento */}
        <div className="flex flex-col">
          <div className="font-medium text-sm">{evento.cliente?.nome || 'Cliente não informado'}</div>
          <div className="text-xs text-muted-foreground">
            {evento.dataInicio?.split('T')[1]?.substring(0, 5) || ''} - {evento.dataFim?.split('T')[1]?.substring(0, 5) || ''}
          </div>
          {evento.esporte && (
            <div className="text-xs text-muted-foreground">{evento.esporte}</div>
          )}
        </div>
      </div>
      
      {/* Status e data */}
      <div className="flex flex-col items-end space-y-1">
        <Badge variant="secondary" className="text-xs">
          {evento.situacao === 1 ? 'Pendente' : 
           evento.situacao === 2 ? 'Confirmada' : 
           evento.situacao === 3 ? 'Cancelada' : 'Concluída'}
        </Badge>
        <div className="text-xs text-muted-foreground">
          {format(parseISO(evento.dataInicio), 'dd/MM/yyyy')}
        </div>
      </div>
    </div>
  );
}

const VisaoLista = memo(() => {
  const {
    eventos,
    handleEventClick
  } = useContextoAgenda();

  // Organizar eventos por data
  const eventosPorData = useMemo(() => {
    const organizados: Record<string, Evento[]> = {};
    
    eventos.forEach(evento => {
      const data = evento.data;
      if (!organizados[data]) organizados[data] = [];
      organizados[data].push(evento);
    });
    
    // Ordenar por data
    return Object.fromEntries(
      Object.entries(organizados).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [eventos]);

  if (eventos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum evento encontrado
          </div>
          <div className="text-sm text-muted-foreground">
            Não há eventos para os filtros selecionados
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background min-h-0">
      {/* Lista de eventos */}
      <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
        {Object.entries(eventosPorData).map(([data, eventosDoDia]) => (
          <div key={data} className="space-y-3">
            {/* Cabeçalho da data */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {format(parseISO(data), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                </h3>
                <Badge variant="outline" className="text-sm">
                  {eventosDoDia.length} evento{eventosDoDia.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            
            {/* Eventos do dia */}
            <div className="space-y-2">
              {eventosDoDia.map(evento => (
                <AgendaEvent
                  key={evento.id}
                  evento={evento}
                  onClick={e => {
                    e.stopPropagation();
                    handleEventClick(evento);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

VisaoLista.displayName = 'VisaoLista';

export default VisaoLista;