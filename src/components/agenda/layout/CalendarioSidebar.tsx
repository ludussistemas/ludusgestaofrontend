import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar-rac';
import { parseDate } from '@internationalized/date';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import type { DateValue } from 'react-aria-components';

interface CalendarioSidebarProps {
  selectedDate: DateValue | null;
  onDateChange: (date: DateValue | null) => void;
  isExpanded: boolean;
  eventDates?: string[]; // Datas que têm eventos para destacar
}

const CalendarioSidebar: React.FC<CalendarioSidebarProps> = ({
  selectedDate,
  onDateChange,
  isExpanded,
  eventDates = []
}) => {
  // Converter DateValue para Date
  const selectedDateAsDate = selectedDate 
    ? new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day)
    : new Date();

  // Função para verificar se uma data tem eventos
  const hasEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventDates.includes(dateStr);
  };

  // Função para lidar com a seleção de data
  const handleDateSelect = (date: DateValue) => {
    onDateChange(date);
  };

  // Função para ir para hoje
  const goToToday = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onDateChange(parseDate(dateStr));
  };

  return (
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
      isExpanded ? 'w-full' : 'w-14'
    }`}>
      {/* Versão compacta */}
      <div className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-500 ease-in-out ${
        isExpanded ? 'opacity-0 scale-0 h-0' : 'opacity-100 scale-100 h-auto'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="h-8 w-8 p-0 hover:bg-accent transition-all duration-500"
          title="Ir para hoje"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
        <div className="text-xs text-center text-muted-foreground transition-all duration-500 mt-1">
          {format(selectedDateAsDate, 'dd/MM', { locale: ptBR })}
        </div>
      </div>

      {/* Versão expandida */}
      <div className={`transition-all duration-500 ease-in-out ${
        isExpanded ? 'opacity-100 scale-100 h-auto' : 'opacity-0 scale-0 h-0'
      }`}>
        <div className="px-2">
          <Calendar
            value={selectedDate}
            onChange={handleDateSelect}
            className="w-full border-0 shadow-none bg-transparent transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarioSidebar; 