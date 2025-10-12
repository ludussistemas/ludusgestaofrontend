
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLocais } from '@/hooks/useLocais';
import { Clock, MapPin, Plus, Trash, User, X } from 'lucide-react';
import { useState } from 'react';
import EmptyTimelineState from './EmptyTimelineState';

interface Event {
  id: string;
  client: string;
  venue: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  color: string;
  sport?: string;
}

interface EventTimelineProps {
  selectedDate: string;
  events: Event[];
  selectedVenue?: string;
  onTimeSlotClick?: (time: string) => void;
  onEventEdit?: (event: Event) => void;
  editingEventId?: string | null;
  onEventSelect?: (event: Event) => void;
  onCancelEdit?: () => void;
  onDeleteEvent?: (eventId: string) => void;
  loading?: boolean;
  getLocalByName?: (venueName: string) => any;
  locais?: any[];
}

const EventTimeline = ({ 
  selectedDate, 
  events, 
  selectedVenue,
  onTimeSlotClick, 
  onEventEdit, 
  editingEventId,
  onEventSelect,
  onCancelEdit,
  onDeleteEvent,
  loading = false,
  getLocalByName: propGetLocalByName,
  locais: propLocais
}: EventTimelineProps) => {
  
  const { generateTimeSlots, getVenueInterval, data: hookLocais } = useLocais();
  
  // Usar locais passados como prop ou do hook
  const locais = propLocais || hookLocais;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  // Se não há local selecionado ou está vazio, mostrar estado vazio
  if (!selectedVenue || selectedVenue === '' || selectedVenue === 'all') {
    return <EmptyTimelineState />;
  }
  
  // selectedVenue agora é o nome do local
  const venue = locais.find(l => l.nome === selectedVenue);
  const venueId = venue?.id || 'all';
  
  console.log('🔍 EventTimeline Debug:');
  console.log('  - selectedVenue:', selectedVenue);
  console.log('  - propLocais:', propLocais);
  console.log('  - hookLocais:', hookLocais);
  console.log('  - locais usados:', locais);
  console.log('  - venue encontrado:', venue);
  console.log('  - venueId:', venueId);
  console.log('  - events recebidos:', events);
  
  // Gerar slots baseados no local selecionado
  const timeSlots = generateTimeSlots(venueId, 7, 21, undefined, locais);
  const interval = getVenueInterval(venueId, locais);
  
  console.log('  - timeSlots gerados:', timeSlots.length);
  console.log('  - interval:', interval);
  console.log('  - venue.intervalo:', venue?.intervalo);
  console.log('  - venue.horaAbertura:', venue?.horaAbertura);
  console.log('  - venue.horaFechamento:', venue?.horaFechamento);
  const slotHeight = 48;
  
  // Lógica de filtro corrigida: sempre mostrar eventos do local selecionado
  console.log('🔍 [EventTimeline] Filtrando eventos:', {
    totalEventos: events.length,
    selectedVenue,
    eventosRecebidos: events.map(e => ({ id: e.id, venue: e.venue, startTime: e.startTime }))
  });
  
  const filteredEvents = events.filter(event => {
    // Filtrar por local usando o nome do local
    const match = event.venue === selectedVenue;
    if (!match) {
      console.log(`⏭️ [EventTimeline] Evento ${event.id} filtrado (venue: "${event.venue}" !== "${selectedVenue}")`);
    }
    return match;
  });
  
  console.log('✅ [EventTimeline] Eventos após filtro:', filteredEvents.length);

  

  // Converter horário para minutos para cálculos
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Verificar se há espaço disponível em um slot
  const getAvailableSlot = (slotTime: string) => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + interval;
    
    // Verificar se há algum evento que conflita com este slot
    const hasConflict = filteredEvents.some(event => {
      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);
      
      // Verifica se há sobreposição
      return !(eventEnd <= slotStart || eventStart >= slotEnd);
    });

    if (!hasConflict) {
      return { available: true, time: slotTime };
    }

    return { available: false };
  };

  // Função para obter a cor do local baseado no nome do venue
  const getVenueColor = (venueName: string) => {
    const local = propGetLocalByName ? propGetLocalByName(venueName) : locais.find(l => l.nome === venueName);
    console.log('🎨 getVenueColor:', { venueName, local, cor: local?.cor });
    return local?.cor || local?.color || '#6b7280';
  };

  const handleEventClick = (event: Event) => {
    if (onEventSelect) {
      onEventSelect(event);
    }
    if (onEventEdit) {
      onEventEdit(event);
    }
  };

  const handleTimeSlotClick = (time: string) => {
    if (editingEventId === null && onTimeSlotClick) {
      onTimeSlotClick(time);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete && onDeleteEvent) {
      onDeleteEvent(eventToDelete);
    }
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const isEditingMode = editingEventId !== null;

  if (loading) {
    return (
      <div className="flex flex-col h-full max-h-[calc(100vh-110px)] overflow-hidden">
        <div className="flex-shrink-0 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto relative">
          <div className="relative">
            {Array.from({ length: 12 }).map((_, index) => (
              <div 
                key={index}
                className="border-b border-gray-100 flex items-center p-3 animate-pulse"
                style={{ height: `${slotHeight}px` }}
              >
                <div className="w-16 h-4 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="flex-1 ml-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Formatar intervalo em formato legível
  const formatInterval = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return hours === 1 ? '1 hora' : `${hours} horas`;
    }
    
    const hourText = hours === 1 ? '1 hora' : `${hours} horas`;
    return `${hourText} e ${mins} minutos`;
  };

  return (
    <>
      <div className="flex flex-col h-full max-h-[calc(100vh-110px)] overflow-hidden">
        <div className="flex-shrink-0 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline - {(() => {
                // Parse manual da data para evitar problemas de timezone
                const [year, month, day] = selectedDate.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: '2-digit', 
                  month: 'long' 
                });
              })()}
              {selectedVenue && (
                <span className="text-sm text-gray-600 ml-2">({selectedVenue}) - Intervalo: {formatInterval(interval)}</span>
              )}
            </h3>
          </div>
          {isEditingMode && (
            <div className="mt-2 text-sm p-2 rounded text-module-events/100 bg-module-events/10">
              Modo de edição ativo. Clique no botão cancelar no evento para sair ou selecione outro evento.
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto relative">
          {/* Time slots grid */}
          <div className="relative">
            {timeSlots.map((slot, index) => {
              const time = slot.time;
              const availability = getAvailableSlot(time);
              const canClick = !isEditingMode && availability.available;
              
              return (
                <div 
                  key={time} 
                  className={`border-b border-gray-100 flex items-center p-3 transition-colors relative ${
                    canClick ? 'cursor-pointer hover:bg-green-50' : ''
                  }`}
                  style={{ height: `${slotHeight}px` }}
                  onClick={() => canClick && handleTimeSlotClick(time)}
                >
                  <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                    {time}
                  </div>
                  
                  <div className="flex-1 ml-4 relative">
                    {canClick && (
                      <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Disponível - clique para reservar
                      </div>
                    )}
                    {isEditingMode && availability.available && (
                      <div className="text-sm text-gray-400 font-medium">
                        Disponível (modo edição ativo)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events overlay */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none">
            {filteredEvents.map((event) => {
              debugger
              const startMinutes = timeToMinutes(event.startTime);
              const endMinutes = timeToMinutes(event.endTime);
              const duration = endMinutes - startMinutes;
              
              const [openH = 7, openM = 0] = (venue?.horaAbertura || '07:00').split(':').map(Number);
              const openMinutes = openH * 60 + openM;
              
              // Calcular pixels por minuto baseado no intervalo e altura do slot
              const pixelsPerMinute = slotHeight / interval;
              
              // Calcular posição e altura baseado nos minutos exatos
              const topOffset = (startMinutes - openMinutes) * pixelsPerMinute;
              const height = duration * pixelsPerMinute;

              const isCurrentlyEditing = editingEventId !== null && String(editingEventId) === String(event.id);
              const isDisabledEvent = isEditingMode && !isCurrentlyEditing;
              const venueColor = getVenueColor(event.venue);
              
              // Cor do local; quando em edição, destacar com tom amarelo (mesma linguagem visual do aviso)
              const backgroundColor = isCurrentlyEditing 
                ? 'rgb(234 179 8 / 0.25)'
                : venueColor;
              
              const borderColor = isCurrentlyEditing 
                ? 'rgb(234 179 8)'
                : venueColor;

               return (
                 <div
                   key={event.id}
                   className={`absolute left-20 right-4 rounded-lg shadow-sm border-l-4 z-10 transition-all cursor-pointer pointer-events-auto border-gray-200 dark:border-gray-700 ${
                     isCurrentlyEditing 
                       ? 'ring-2 ring-module-events/100 ring-offset-2'
                       : 'hover:shadow-md'
                   }`}
                   style={{
                     top: `${topOffset + 3}px`,
                     height: `${Math.max(height - 7, 36)}px`,
                     borderLeftColor: borderColor,
                     backgroundColor: backgroundColor
                   }}
                   onClick={() => !isDisabledEvent && handleEventClick(event)}
                 >
                  {(() => {
                    const textColor = isCurrentlyEditing ? 'text-amber-900' : 'text-white';
                    const iconMuted = isCurrentlyEditing ? 'text-amber-900/90' : 'text-white/90';
                    const secondary = isCurrentlyEditing ? 'text-amber-900/90' : 'text-white/90';
                    return (
                      <div className={`p-2 h-full overflow-hidden flex items-center ${textColor}`}>
                        {/* Linha única: Cliente, Esporte | Status, Horário, Ações */}
                        <div className="flex items-center gap-3 w-full">
                          {/* Cliente (largura maior, trunca) */}
                          <div className="flex items-center gap-1 w-48 flex-shrink-0">
                            <User className={`h-3 w-3 ${iconMuted} flex-shrink-0`} />
                            <span className={`font-semibold text-xs truncate ${textColor}`}>{event.client}</span>
                          </div>
                          
                          {/* Esporte (largura fixa, trunca ou vazio) */}
                          <div className="w-32 flex-shrink-0">
                            <span className={`text-xs truncate block ${secondary}`}>
                              {event.sport || ''}
                            </span>
                          </div>
                          
                          {/* Espaçador flex */}
                          <div className="flex-1 min-w-0" />
                          
                          {/* Status (largura fixa com bolinha e texto completo) */}
                          <div className="flex items-center gap-1 w-24 flex-shrink-0">
                            <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                              event.status === 'confirmed' ? 'bg-green-500' :
                              event.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className={`text-xs capitalize truncate ${secondary}`}>
                              {event.status === 'confirmed' ? 'Confirmado' :
                               event.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                          </div>
                          
                          {/* Horário (antes dos botões) */}
                          <div className={`text-xs font-medium ${secondary} w-28 flex-shrink-0`}>
                            {event.startTime} - {event.endTime}
                          </div>
                          
                          {/* Ações (SEMPRE no final quando em edição) */}
                          {isCurrentlyEditing && (
                            <div className="flex flex-row gap-1 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              {onCancelEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCancelEdit();
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventTimeline;
