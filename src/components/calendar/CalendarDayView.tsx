import { Card, CardContent } from '@/components/ui/card';
import { useLocais } from '@/hooks/useLocais';
import { MapPin, Plus, User } from 'lucide-react';
import CalendarDayColumnsView from './CalendarDayColumnsView';

// Interface temporária para Reservation
interface Reservation {
  id: string;
  client: string;
  venue: string;
  venueId: string;
  startTime: string;
  endTime: string;
  start: string;
  status: string;
  color: string;
  sport: string;
  notes: string;
  title: string;
}

interface CalendarDayViewProps {
  currentDate: Date;
  selectedVenue: string;
  mockReservations: Reservation[];
  handleDateClick: (date: Date) => void;
  handleEventClick: (event: Reservation) => void;
}

const CalendarDayView = ({
  currentDate,
  selectedVenue,
  mockReservations,
  handleDateClick,
  handleEventClick
}: CalendarDayViewProps) => {
  
  // Se for "todos os locais", usar visualização em colunas
  if (selectedVenue === 'all') {
    return (
      <CalendarDayColumnsView
        currentDate={currentDate}
        mockReservations={mockReservations}
        handleDateClick={handleDateClick}
        handleEventClick={handleEventClick}
      />
    );
  }
  
  const { generateTimeSlots, getVenueInterval, getLocalById } = useLocais();
  
  // Gerar slots baseados no local selecionado
  const timeSlots = generateTimeSlots(selectedVenue || 'all');
  const interval = getVenueInterval(selectedVenue || 'all');
  const slotHeight = 48;
  
  // Filtrar reservas por local e data selecionados
  const dayStr = currentDate.toISOString().split('T')[0];
  const filteredReservations = mockReservations.filter(reservation => {
    const reservationDate = new Date(reservation.start).toISOString().split('T')[0];
    const matchesDate = reservationDate === dayStr;
    const matchesVenue = selectedVenue === 'all' || reservation.venueId === selectedVenue;
    return matchesDate && matchesVenue;
  });

  // Converter horário para minutos para cálculos
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Verificar disponibilidade em um slot específico
  const getSlotAvailability = (slotTime: string) => {
    const slotStart = timeToMinutes(slotTime);
    const slotEnd = slotStart + interval;
    
    // Verificar eventos que se sobrepõem
    const overlappingEvents = filteredReservations.filter(event => {
      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);
      
      return !(eventEnd <= slotStart || eventStart >= slotEnd);
    });

    return overlappingEvents.length === 0;
  };

  // Função para obter a cor do local baseado no venueId
  const getVenueColorById = (venueId: string) => {
    const local = getLocalById(venueId);
    return local?.cor || '#6b7280';
  };

  const handleNewReservation = (time: string) => {
    handleDateClick(currentDate);
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <Card className="">
        <CardContent className="p-0 flex-1 relative">
          {/* Time slots grid */}
          <div className="relative">
            {timeSlots.map((time, index) => {
              const isAvailable = getSlotAvailability(time);
              
              return (
                <div 
                  key={time} 
                  className={`border-b border-gray-100 flex items-center p-3 transition-colors relative ${
                    isAvailable ? 'cursor-pointer hover:bg-green-50' : ''
                  }`}
                  style={{ height: `${slotHeight}px` }}
                  onClick={() => isAvailable && handleNewReservation(time)}
                >
                  <div className="w-16 text-sm font-medium text-gray-600 flex-shrink-0">
                    {time}
                  </div>
                  
                  <div className="flex-1 ml-4 relative">
                    {isAvailable && (
                      <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Disponível - clique para reservar
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Events overlay */}
          <div className="absolute top-0 left-0 right-0 pointer-events-none">
            {filteredReservations.map((event) => {
              const startMinutes = timeToMinutes(event.startTime);
              const endMinutes = timeToMinutes(event.endTime);
              const duration = endMinutes - startMinutes;
              
              // Calcular posição baseada nos slots dinâmicos
              const baseHour = 7 * 60; // 7h em minutos
              const topOffset = ((startMinutes - baseHour) / interval) * slotHeight;
              const height = (duration / interval) * slotHeight;

              const venueColor = getVenueColorById(event.venueId);

              return (
                <div
                  key={event.id}
                  className="absolute left-20 right-4 rounded-lg shadow-sm border-l-4 z-10 cursor-pointer pointer-events-auto hover:shadow-md transition-all border-gray-200 dark:border-gray-700"
                  style={{
                    top: `${topOffset}px`,
                    height: `${Math.max(height - 4, 32)}px`,
                    borderLeftColor: venueColor,
                    backgroundColor: `${venueColor}15`
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="p-2 h-full overflow-hidden">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-600 flex-shrink-0" />
                        <span className="font-semibold text-xs truncate">{event.client}</span>
                      </div>
                      {height > 60 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">{event.venue}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 font-medium">
                        {event.startTime} - {event.endTime}
                      </div>
                      {height > 80 && (
                        <div className="text-xs text-gray-500 truncate">
                          {event.title.split(' - ')[1] || 'Reserva'}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          event.status === 'confirmed' ? 'bg-green-500' :
                          event.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {height > 60 && (
                          <span className="text-xs text-gray-500">
                            {event.status === 'confirmed' ? 'Confirmado' :
                             event.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarDayView;
