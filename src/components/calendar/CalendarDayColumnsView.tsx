
import { Card, CardContent } from '@/components/ui/card';
import { useLocais } from '@/hooks/useLocais';
import { Plus, User } from 'lucide-react';
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

interface CalendarDayColumnsViewProps {
  currentDate: Date;
  mockReservations: Reservation[];
  handleDateClick: (date: Date) => void;
  handleEventClick: (event: Reservation) => void;
}

const CalendarDayColumnsView = ({
  currentDate,
  mockReservations,
  handleDateClick,
  handleEventClick
}: CalendarDayColumnsViewProps) => {
  
  const { generateTimeSlots, data: locais, getLocalById } = useLocais();
  
  // Usar o menor intervalo entre todos os locais para a timeline
  const smallestInterval = Math.min(...locais.map(local => local.intervalo));
  
  // Gerar slots usando o menor intervalo calculado
  const timeSlots = generateTimeSlots('custom', 7, 21, smallestInterval);
  const slotHeight = 48;
  
  // Filtrar reservas por data
  const dayStr = currentDate.toISOString().split('T')[0];
  const filteredReservations = mockReservations.filter(reservation => {
    const reservationDate = new Date(reservation.start).toISOString().split('T')[0];
    return reservationDate === dayStr;
  });

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Função para obter a cor do local baseado no ID
  const getVenueColorById = (venueId: string) => {
    const local = getLocalById(venueId);
    return local?.color || '#6b7280';
  };

  const handleNewReservation = (time: string) => {
    handleDateClick(currentDate);
  };

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      <Card className="">
        <CardContent className="p-0">
          <div className="grid" style={{ gridTemplateColumns: `80px repeat(${locais.length}, 1fr)` }}>
            {/* Coluna de horários */}
            <div className="border-r border-gray-200">
              <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">Horário</span>
              </div>
              {timeSlots.map((slot) => {
                const time = slot.time;
                return (
                <div 
                  key={time} 
                  className="border-b border-gray-100 flex items-center justify-center px-2"
                  style={{ height: `${slotHeight}px` }}
                >
                  <div className="text-xs font-medium text-gray-600">
                    {time}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Colunas dos locais */}
            {locais.map((local) => {
              const venueReservations = filteredReservations.filter(r => r.venueId === local.id);
              
              return (
                <div key={local.id} className="border-r border-gray-200 relative">
                  <div className="h-12 border-b border-gray-200 bg-gray-50 flex flex-col items-center justify-center px-2">
                    <span className="text-xs font-medium text-gray-700 text-center">{local.name}</span>
                    <span className="text-xs text-gray-500">{local.interval}min</span>
                  </div>
                  
                  {/* Time slots grid */}
                  <div className="relative">
                    {timeSlots.map((slot) => {
                      const time = slot.time;
                      const slotStart = timeToMinutes(time);
                      const slotEnd = slotStart + local.interval;
                      
                      const hasConflict = venueReservations.some(event => {
                        const eventStart = timeToMinutes(event.startTime);
                        const eventEnd = timeToMinutes(event.endTime);
                        return !(eventEnd <= slotStart || eventStart >= slotEnd);
                      });
                      
                      const isAvailable = !hasConflict;
                      
                      return (
                        <div 
                          key={time} 
                          className={`border-b border-gray-100 flex items-center justify-center p-1 transition-colors ${
                            isAvailable ? 'cursor-pointer hover:bg-green-50' : ''
                          }`}
                          style={{ height: `${slotHeight}px` }}
                          onClick={() => isAvailable && handleNewReservation(time)}
                        >
                          {isAvailable && (
                            <div className="text-green-600 text-xs font-medium flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Events overlay */}
                  <div className="absolute top-12 left-0 right-0 pointer-events-none">
                    {venueReservations.map((event) => {
                      const startMinutes = timeToMinutes(event.startTime);
                      const endMinutes = timeToMinutes(event.endTime);
                      const duration = endMinutes - startMinutes;
                      
                      const baseHour = 7 * 60;
                      const topOffset = ((startMinutes - baseHour) / smallestInterval) * slotHeight;
                      const height = (duration / smallestInterval) * slotHeight;

                      const venueColor = getVenueColorById(event.venueId);

                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded-lg shadow-sm border-l-4 z-10 cursor-pointer pointer-events-auto hover:shadow-md transition-all border-gray-200 dark:border-gray-700"
                          style={{
                            top: `${topOffset}px`,
                            height: `${Math.max(height - 4, 32)}px`,
                            borderLeftColor: venueColor,
                            backgroundColor: `${venueColor}15`
                          }}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="p-1 h-full overflow-hidden">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-600 flex-shrink-0" />
                                <span className="font-semibold text-xs truncate">{event.client}</span>
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                {event.startTime} - {event.endTime}
                              </div>
                              {height > 60 && (
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
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarDayColumnsView;
