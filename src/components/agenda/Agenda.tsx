import ModuleHeader from '@/components/ModuleHeader';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { ProvedorAgenda, useContextoAgenda } from '@/contexts/AgendaContext';
import { Calendar as CalendarIcon } from 'lucide-react';
import LayoutAgenda from './layout/LayoutAgenda';

function ConteudoAgenda() {
  const agenda = useContextoAgenda();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <ModuleHeader
        title="Agenda"
        icon={<CalendarIcon className="h-6 w-6" />}
        moduleColor={MODULE_COLORS.events}
        backTo="/eventos"
        backLabel="Eventos"
      />
      <main className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
        <LayoutAgenda />
      </main>
    </div>
  );
}

export default function Agenda() {
  return (
    <ProvedorAgenda>
      <ConteudoAgenda />
    </ProvedorAgenda>
  );
}
