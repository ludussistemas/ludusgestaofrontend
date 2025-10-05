
import EventTimeline from '@/components/EventTimeline';
import ModuleHeader from '@/components/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MODULE_COLORS } from '@/constants/moduleColors';
import CampoBusca from '@/core/components/CampoBusca';
import SeletorData from '@/core/components/SeletorData';
import SeletorHora from '@/core/components/SeletorHora';
import { useClientes } from '@/hooks/useClientes';
import { useLocais } from '@/hooks/useLocais';
import { useReservas } from '@/hooks/useReservas';
import { CreditCard, Edit, Plus, Repeat, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ReservationFormData {
  client: string | { id: string; label: string; subtitle: string } | null;
  venue: string | { id: string; label: string; subtitle: string } | null;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  notes: string;
  observations: string;
  amount: string;
  recurring: boolean;
  recurringType: string;
  customRecurringDays: string;
  hourlyRate: number;
  totalHours: number;
  totalMinutes: number;
  // Novos campos conforme documentação
  situacao: number; // SituacaoReserva (1=Pendente, 2=Confirmada, 3=Cancelada, 4=Finalizada, 5=Expirada)
  cor: string; // Cor para identificação visual
  esporte: string; // Esporte/atividade
  usuarioId: string | null; // ID do usuário (opcional)
}

const Reserva = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // Estado único para controlar edição
  const [isEdit, setIsEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [formData, setFormData] = useState<ReservationFormData>({
    client: '',
    venue: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    notes: '',
    observations: '',
    amount: '',
    recurring: false,
    recurringType: '',
    customRecurringDays: '',
    hourlyRate: 80,
    totalHours: 0,
    totalMinutes: 0,
    // Novos campos conforme documentação
    situacao: 1, // Pendente por padrão
    cor: '#3b82f6', // Azul por padrão
    esporte: '',
    usuarioId: null
  });

  // Hooks de dados
  const { getClientesForSearch, getClienteById, data: clientes, fetchData: fetchClientes } = useClientes();
  const { data: locais, getLocalById, getLocaisForSearch, fetchData: fetchLocais } = useLocais();
  const { 
    getReservaById, 
    createReserva, 
    updateReserva, 
    deleteReserva, 
    fetchData: fetchReservas, 
    getReserva, 
    fetchReservasPorPeriodo, 
    data: reservas,
    buscarReservasTimeline,
    getVenueConfig,
    getOccupiedTimes,
    timelineEvents,
    timelineLoading
  } = useReservas();

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchClientes({ limit: 1000 }),
          fetchLocais({ limit: 1000 }),
          fetchReservas({ limit: 1000 })
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados. Verifique sua conexão.');
      }
    };
    
    if (!dataLoaded) {
      loadInitialData();
    }
  }, [dataLoaded, fetchClientes, fetchLocais, fetchReservas]);


  // Carregar dados de edição quando necessário
  useEffect(() => {
    if (!id || !dataLoaded || clientes.length === 0 || locais.length === 0) {
      // Nova reserva - verificar parâmetros da URL
      const dateParam = searchParams.get('date');
      if (dateParam) {
        setFormData(prev => ({ ...prev, date: new Date(dateParam) }));
      }
      return;
    }
    
    const loadReservaData = async () => {
      try {
        setIsEdit(true);
        setEditingEventId(parseInt(id));
        
        const reserva = await getReserva(id);
        if (!reserva) return;
        
        const cliente = getClienteById(reserva.clienteId);
        const local = getLocalById(reserva.localId);
        
        setFormData({
          client: cliente ? {
            id: cliente.id,
            label: cliente.nome,
            subtitle: cliente.documento || cliente.email || ''
          } : null,
          venue: local ? {
            id: local.id,
            label: local.nome,
            subtitle: local.descricao || local.nome
          } : null,
          date: new Date(reserva.dataInicio),
          startTime: reserva.dataInicio?.split('T')[1]?.substring(0, 5) || '',
          endTime: reserva.dataFim?.split('T')[1]?.substring(0, 5) || '',
          notes: reserva.observacoes || '',
          observations: reserva.observacoes || '',
          amount: reserva.valor.toString(),
          recurring: false,
          recurringType: '',
          customRecurringDays: '',
          hourlyRate: local?.valorHora || 80,
          totalHours: 0,
          totalMinutes: 0,
          situacao: reserva.situacao || 1,
          cor: reserva.cor || '#3b82f6',
          esporte: reserva.esporte || '',
          usuarioId: reserva.usuarioId || null
        });
      } catch (error) {
        console.error('Erro ao carregar dados da reserva:', error);
        toast.error('Erro ao carregar dados da reserva');
      }
    };
    
    loadReservaData();
  }, [id, dataLoaded, clientes.length, locais.length, searchParams, getReserva, getClienteById, getLocalById]);


  // Calcular total de horas e valor
  const calculateTotal = () => {
    if (!formData.startTime || !formData.endTime) return { totalHours: 0, totalMinutes: 0, totalValue: 0 };
    
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) return { totalHours: 0, totalMinutes: 0, totalValue: 0 };
    
    const totalMinutes = endTotalMinutes - startTotalMinutes;
    const totalHours = totalMinutes / 60;
    const totalValue = totalHours * formData.hourlyRate;
    
    return { totalHours, totalMinutes, totalValue };
  };

  const { totalHours, totalMinutes, totalValue } = calculateTotal();

  // Funções auxiliares para extrair IDs dos objetos
  const getClientId = () => {
    return typeof formData.client === 'object' ? formData.client?.id : formData.client;
  };

  const getVenueId = () => {
    return typeof formData.venue === 'object' ? formData.venue?.id : formData.venue;
  };

  const getVenueName = () => {
    const venueId = getVenueId();
    if (!venueId) return '';
    const venue = locais.find(l => l.id === venueId);
    return venue?.nome || '';
  };


  // Buscar reservas para timeline quando data ou local mudarem
  useEffect(() => {
    if (formData.date && dataLoaded && locais.length > 0 && clientes.length > 0) {
      const localId = getVenueId();
      if (localId) {
        buscarReservasTimeline(formData.date, localId, locais, clientes);
      }
    }
  }, [formData.date, formData.venue, dataLoaded]);

  // Função para calcular horário final baseado no intervalo do local
  const calculateEndTime = (startTime: string, venueId: string) => {
    if (!startTime || !venueId) return '';
    
    if (!Array.isArray(locais) || locais.length === 0) {
      return '';
    }
    
    const selectedVenue = locais.find(l => l.id === venueId);
    if (!selectedVenue) {
      return '';
    }
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + (selectedVenue.intervalo || 30);
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Formatar duração em horas e minutos
  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} minutos`;
    } else if (minutes === 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  const recurringOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'custom', label: 'Personalizado' }
  ];


  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Obter configurações do local selecionado
  const venueConfig = getVenueConfig(getVenueId(), locais);
  const occupiedTimes = getOccupiedTimes(getVenueId(), formData.date || new Date(), locais);

  // Buscar reservas reais por data e local
  const selectedDateStr = formData.date ? formData.date.toISOString().split('T')[0] : '';
  const events = timelineEvents.map(reservation => ({
    id: reservation.id,
    client: reservation.client,
    venue: reservation.venue,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    status: reservation.status,
    color: reservation.color,
    sport: reservation.sport || '',
    notes: reservation.notes || ''
  }));


  const handleVenueChange = (value: string, item: any) => {
    const localId = item?.id || value;
    const selectedVenue = locais.find(l => l.id === localId);
    
    setFormData(prev => ({ 
      ...prev, 
      venue: localId,
      startTime: '', // Reset horários quando trocar local
      endTime: '',
      hourlyRate: selectedVenue?.valorHora || 80
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      date,
      startTime: '', // Reset horários quando trocar data
      endTime: ''
    }));
  };

  const tourSteps: any[] = [ // TODO: Definir tipo TourStep
    {
      target: '#client',
      title: 'Cliente',
      content: isEdit ? 'Altere o cliente desta reserva se necessário.' : 'Selecione o cliente que está fazendo a reserva.'
    },
    {
      target: '#venue',
      title: 'Local',
      content: isEdit ? 'Modifique o local da reserva.' : 'Escolha o local que será reservado.'
    },
    {
      target: '#date',
      title: 'Data',
      content: isEdit ? 'Atualize a data da reserva.' : 'Selecione a data da reserva.'
    },
    {
      target: '#startTime',
      title: 'Horário de Início',
      content: isEdit ? 'Ajuste o horário de início.' : 'Defina o horário de início da reserva.'
    },
    {
      target: '#endTime',
      title: 'Horário de Fim',
      content: isEdit ? 'Ajuste o horário de término.' : 'Defina o horário de término da reserva.'
    },
    {
      target: '#amount',
      title: 'Valor',
      content: isEdit ? 'Atualize o valor da reserva.' : 'Informe o valor total da reserva.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit && id) {
      // Atualizar reserva existente
      const updateData = {
        clienteId: getClientId(),
        localId: getVenueId(),
        usuarioId: formData.usuarioId,
        dataInicio: formData.date && formData.startTime ? 
          `${formData.date.toISOString().split('T')[0]}T${formData.startTime}:00Z` : '',
        dataFim: formData.date && formData.endTime ? 
          `${formData.date.toISOString().split('T')[0]}T${formData.endTime}:00Z` : '',
        situacao: formData.situacao,
        cor: formData.cor,
        esporte: formData.esporte,
        observacoes: formData.observations,
        valor: parseFloat(formData.amount) || totalValue
      };
      updateReserva(id, updateData);
      console.log('Editando reserva:', updateData);
    } else {
      // Criar nova reserva
      const cliente = getClienteById(getClientId());
      const local = getLocalById(getVenueId());
      
      const newReservaData = {
        clienteId: getClientId(),
        localId: getVenueId(),
        usuarioId: formData.usuarioId,
        dataInicio: formData.date && formData.startTime ? 
          `${formData.date.toISOString().split('T')[0]}T${formData.startTime}:00Z` : '',
        dataFim: formData.date && formData.endTime ? 
          `${formData.date.toISOString().split('T')[0]}T${formData.endTime}:00Z` : '',
        situacao: formData.situacao,
        cor: formData.cor,
        esporte: formData.esporte,
        observacoes: formData.observations,
        valor: parseFloat(formData.amount) || totalValue
      };
      createReserva(newReservaData);
      console.log('Nova reserva:', newReservaData);
    }
    
    navigate('/eventos/agenda');
  };

  const handleReserveNow = () => {
    console.log('Reservando e pagando agora:', formData);
    navigate('/eventos/recebiveis/novo?payNow=true');
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setEditingEventId(null);

    if (!id) {
      // Se não há ID na URL, limpar formulário mas manter data se veio dos parâmetros
      const dateParam = searchParams.get('date');
      setFormData({
        client: '',
        venue: '',
        date: dateParam ? new Date(dateParam) : new Date(),
        startTime: '',
        endTime: '',
        notes: '',
        observations: '',
        amount: '',
        recurring: false,
        recurringType: '',
        customRecurringDays: '',
        hourlyRate: 80,
        totalHours: 0,
        totalMinutes: 0,
        // Novos campos conforme documentação
        situacao: 1,
        cor: '#3b82f6',
        esporte: '',
        usuarioId: null
      });
    } else {
      // Se há ID na URL, navegar de volta para nova reserva
      navigate(`/eventos/reserva`);
    }
  };

  const handleCancel = () => {
    navigate('/eventos/agenda');
  };
  
  const pageTitle = isEdit ? "Editar Reserva" : "Nova Reserva";
  const pageIcon = isEdit ? <Edit className="h-6 w-6" /> : <Calendar className="h-6 w-6" />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ModuleHeader
        title={pageTitle}
        icon={pageIcon}
        moduleColor={MODULE_COLORS.events}
        backTo='/eventos'
        backLabel="Voltar"
      />

      <main className="max-w-none mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Formulário */}
          <div className="space-y-4 flex flex-col">
            <Card className={`${isEdit ? 'border-module-events/90 border border-2 rounded-lg' : ''} flex-1 flex flex-col`}>
              <CardHeader className="flex-shrink-0">
                {isEdit && (
                  <div className="bg-module-events/10 border border-module-events/30 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4 text-module-events/70" />
                        <span className="text-sm font-medium text-module-events/70">
                          Evento em edição - Modifique os campos necessários
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-8 px-3 text-xs text-module-events/70 hover:bg-module-events/20 bg-transparent border-module-events/30"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CampoBusca
                      id="client"
                      label="Cliente"
                      value={typeof formData.client === 'object' ? formData.client?.label || '' : formData.client || ''}
                      selectedId={typeof formData.client === 'object' ? formData.client?.id : formData.client}
                      onChange={(value, item) => {
                        setFormData(prev => ({ ...prev, client: item?.id || value }));
                      }}
                      items={clientes.map(cliente => ({
                    id: cliente.id,
                    label: cliente.nome,
                    subtitle: cliente.documento || cliente.email || ''
                  }))}
                      displayField="label"
                      placeholder="Digite o nome do cliente..."
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
                        navigate('/eventos/clientes/novo');
                      }}
                      className="h-11 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CampoBusca
                  id="venue"
                  label="Local"
                  value={typeof formData.venue === 'object' ? formData.venue?.label || '' : formData.venue || ''}
                  selectedId={typeof formData.venue === 'object' ? formData.venue?.id : formData.venue}
                  onChange={handleVenueChange}
                  items={locais.map(local => ({
                    id: local.id,
                    label: local.nome,
                    subtitle: local.descricao || local.nome
                  }))}
                  displayField="label"
                  placeholder="Selecione o local..."
                  required
                />

                <SeletorData
                  id="date"
                  label="Data"
                  value={formData.date}
                  onChange={handleDateChange}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <SeletorHora
                    id="startTime"
                    label="Início"
                    value={formData.startTime}
                    onChange={(time) => {
                      const endTime = calculateEndTime(time, getVenueId());
                      setFormData(prev => ({ 
                        ...prev, 
                        startTime: time,
                        endTime: endTime
                      }));
                    }}
                    interval={venueConfig?.interval || 30}
                    minTime={venueConfig?.minTime || "07:00"}
                    maxTime={venueConfig?.maxTime || "21:00"}
                    occupiedTimes={occupiedTimes || []}
                    venueSelected={!!formData.venue}
                    dateSelected={!!formData.date}
                    required
                  />

                  <SeletorHora
                    id="endTime"
                    label="Término"
                    value={formData.endTime}
                    onChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
                    interval={venueConfig?.interval || 30}
                    minTime={venueConfig?.minTime || "07:00"}
                    maxTime={venueConfig?.maxTime || "21:00"}
                    occupiedTimes={occupiedTimes || []}
                    venueSelected={!!formData.venue}
                    dateSelected={!!formData.date}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Observações sobre a reserva..."
                    rows={3}
                  />
                </div>

                {/* Seção de evento recorrente melhorada */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800/30">
                        <Repeat className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <Label htmlFor="recurring" className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                          Evento Recorrente
                        </Label>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Criar várias reservas baseadas em um padrão
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="recurring"
                      checked={formData.recurring}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recurring: checked }))}
                      className="data-[state=checked]:bg-gray-600"
                    />
                  </div>
                  
                  {formData.recurring && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50/30 dark:bg-gray-900/10">
                      <div className="space-y-2">
                        <Label htmlFor="recurringType" className="text-sm font-medium">
                          Frequência de repetição
                        </Label>
                        <Select 
                          value={formData.recurringType} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, recurringType: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a frequência..." />
                          </SelectTrigger>
                          <SelectContent>
                            {recurringOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {formData.recurringType === 'custom' && (
                        <div className="space-y-2">
                          <Label htmlFor="customRecurringDays" className="text-sm font-medium">
                            Dias personalizados
                          </Label>
                          <Input
                            id="customRecurringDays"
                            value={formData.customRecurringDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, customRecurringDays: e.target.value }))}
                            placeholder="Ex: Segunda, Quarta, Sexta"
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Especifique os dias da semana separados por vírgula
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Novos campos conforme documentação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="situacao">Situação</Label>
                    <Select 
                      value={formData.situacao.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, situacao: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a situação..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Pendente</SelectItem>
                        <SelectItem value="2">Confirmada</SelectItem>
                        <SelectItem value="3">Cancelada</SelectItem>
                        <SelectItem value="4">Finalizada</SelectItem>
                        <SelectItem value="5">Expirada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cor">Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cor"
                        type="color"
                        value={formData.cor}
                        onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.cor}
                        onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="esporte">Esporte/Atividade</Label>
                    <Input
                      id="esporte"
                      value={formData.esporte}
                      onChange={(e) => setFormData(prev => ({ ...prev, esporte: e.target.value }))}
                      placeholder="Ex: Futebol, Vôlei, Basquete..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="usuario">Usuário Responsável</Label>
                    <Input
                      id="usuario"
                      value={formData.usuarioId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, usuarioId: e.target.value || null }))}
                      placeholder="ID do usuário (opcional)"
                    />
                  </div>
                </div>

                {formData.totalMinutes > 0 && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h3 className="font-semibold mb-3">Resumo da Reserva</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duração:</span>
                        <span>{formatDuration(formData.totalMinutes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa por hora:</span>
                        <span>R$ {formData.hourlyRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Valor Total:</span>
                        <span>R$ {totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={!getClientId() || !getVenueId() || !formData.date || !formData.startTime || !formData.endTime}
                  >
                    {isEdit ? 'Atualizar' : 'Salvar'} Reserva
                  </Button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReserveNow}
                          className="px-3"
                          disabled={!getClientId() || !getVenueId() || !formData.date || !formData.startTime || !formData.endTime}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pagar agora</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline com altura flexível que acompanha o formulário */}
          <div className="flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardContent className="h-full p-0 flex flex-col">
                <EventTimeline
                  selectedDate={selectedDateStr}
                  events={events}
                  selectedVenue={getVenueName()}
                  loading={timelineLoading}
                  locais={locais}
                  onTimeSlotClick={(time) => {
                    if (!isEdit && formData.venue) {
                      const endTime = calculateEndTime(time, getVenueId());
                      setFormData(prev => ({ 
                        ...prev, 
                        startTime: time,
                        endTime: endTime
                      }));
                    }
                  }}
                  onEventEdit={(event) => {
                    // Buscar o local pelo nome do evento para obter o ID correto
                    const eventVenue = Array.isArray(locais) ? locais.find(l => l.nome === event.venue) : null;
                    const selectedClient = getClienteById(event.client);
                    
                    setFormData(prev => ({
                      ...prev,
                      client: selectedClient?.id || event.client,
                      venue: eventVenue?.id || '', // Usar o ID do local
                      startTime: event.startTime,
                      endTime: event.endTime,
                      notes: (event as any).notes || event.sport || '',
                      observations: (event as any).notes || event.sport || '',
                      amount: '160'
                    }));
                    setIsEdit(true);
                    setEditingEventId(event.id);
                  }}
                  editingEventId={editingEventId}
                  onEventSelect={(event) => {
                    // Buscar o local pelo nome do evento para obter o ID correto
                    const eventVenue = Array.isArray(locais) ? locais.find(l => l.nome === event.venue) : null;
                    const selectedClient = getClienteById(event.client);
                    
                    setFormData(prev => ({
                      ...prev,
                      client: selectedClient?.id || event.client,
                      venue: eventVenue?.id || '', // Usar o ID do local
                      startTime: event.startTime,
                      endTime: event.endTime,
                      notes: (event as any).notes || event.sport || '',
                      observations: (event as any).notes || event.sport || '',
                      amount: '160'
                    }));
                    setIsEdit(true);
                    setEditingEventId(event.id);
                  }}
                  onCancelEdit={handleCancelEdit}
                  onDeleteEvent={deleteReserva}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reserva;
