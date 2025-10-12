
import EventTimeline from '@/components/EventTimeline';
import ModuleHeader from '@/components/ModuleHeader';
import { Button } from '@/components/ui/button';
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
import { SituacaoReserva } from '@/types/enums/situacao-reserva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

interface ReservationFormData {
  clienteId: string;
  localId: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  observations: string;
  amount: string;
  recurring: boolean;
  recurringType: string;
  customRecurringDays: string;
  esporte: string;
  usuarioId: string | null;
}

const INITIAL_FORM_STATE: ReservationFormData = {
  clienteId: '',
  localId: '',
  date: new Date(),
  startTime: '',
  endTime: '',
  observations: '',
  amount: '',
  recurring: false,
  recurringType: '',
  customRecurringDays: '',
  esporte: '',
  usuarioId: null
};

const Reserva = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // Estados principais
  const [formData, setFormData] = useState<ReservationFormData>(INITIAL_FORM_STATE);
  const [isLoadingReserva, setIsLoadingReserva] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Helper para converter data para string local (YYYY-MM-DD)
  const formatDateLocal = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Hooks de dados
  const { data: clientes, fetchData: fetchClientes } = useClientes();
  const { data: locais, fetchData: fetchLocais } = useLocais();
  const { 
    createReserva, 
    updateReserva, 
    deleteReserva,
    getReserva,
    buscarReservasTimeline,
    timelineEvents,
    timelineLoading
  } = useReservas();

  // ============================================================================
  // CARREGAMENTO INICIAL DE DADOS
  // ============================================================================
  
  useEffect(() => {
    console.log('🔄 [Reserva] Carregando dados iniciais...');
    const loadData = async () => {
      try {
        await Promise.all([
          fetchClientes({ limit: 1000 }),
          fetchLocais({ limit: 1000 })
        ]);
        console.log('✅ [Reserva] Dados iniciais carregados');
      } catch (error) {
        console.error('❌ [Reserva] Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados. Verifique sua conexão.');
      }
    };
    loadData();
  }, [fetchClientes, fetchLocais]);

  // ============================================================================
  // MODO DE EDIÇÃO - Carregar dados da reserva quando tem ID na URL
  // ============================================================================
  
  const isEditMode = !!(id || editingEventId);

  useEffect(() => {
    if (!id) {
      console.log('📝 [Reserva] Modo: Nova Reserva');
      // Nova reserva - verificar se tem data nos parâmetros
      const dateParam = searchParams.get('date');
      if (dateParam) {
        console.log('📅 [Reserva] Data da URL:', dateParam);
        setFormData(prev => ({ ...prev, date: new Date(dateParam) }));
      }
      return;
    }

    console.log('✏️ [Reserva] Modo: Edição da Agenda - ID:', id);
    
    const loadReserva = async () => {
      if (clientes.length === 0 || locais.length === 0) {
        console.log('⏳ [Reserva] Aguardando clientes/locais carregarem...');
        return;
      }

      setIsLoadingReserva(true);
      try {
        console.log('🔍 [Reserva] Buscando reserva ID:', id);
        const reserva = await getReserva(id);
        
        if (!reserva) {
          console.error('❌ [Reserva] Reserva não encontrada');
          toast.error('Reserva não encontrada');
          navigate('/eventos/reserva');
          return;
        }

        console.log('✅ [Reserva] Reserva carregada:', reserva);

        // Preencher formulário com dados da reserva
        setFormData({
          clienteId: reserva.clienteId,
          localId: reserva.localId,
          date: new Date(reserva.dataInicio),
          startTime: reserva.dataInicio?.split('T')[1]?.substring(0, 5) || '',
          endTime: reserva.dataFim?.split('T')[1]?.substring(0, 5) || '',
          observations: reserva.observacoes || '',
          amount: reserva.valor.toString(),
          recurring: false,
          recurringType: '',
          customRecurringDays: '',
          esporte: reserva.esporte || '',
          usuarioId: reserva.usuarioId || null
        });

        console.log('✅ [Reserva] Formulário preenchido');
      } catch (error) {
        console.error('❌ [Reserva] Erro ao carregar reserva:', error);
        toast.error('Erro ao carregar reserva');
        navigate('/eventos/reserva');
      } finally {
        setIsLoadingReserva(false);
      }
    };

    loadReserva();
  }, [id, clientes.length, locais.length, searchParams, getReserva, navigate]);

  // ============================================================================
  // TIMELINE - Buscar eventos quando data ou local mudarem
  // ============================================================================
  
  useEffect(() => {
    // Aguardar clientes e locais carregarem
    if (clientes.length === 0 || locais.length === 0) {
      console.log('⏳ [Timeline] Aguardando clientes/locais carregarem...');
      return;
    }
    
    // Aguardar formulário ter data e local
    if (!formData.date || !formData.localId) {
      console.log('⏭️ [Timeline] Aguardando data/local serem definidos...');
      return;
    }

    console.log('📊 [Timeline] Buscando eventos:', {
      date: formatDateLocal(formData.date),
      localId: formData.localId,
      isEditMode: !!id,
      totalClientes: clientes.length,
      totalLocais: locais.length,
      clientesDisponiveis: clientes.map(c => ({ id: c.id, nome: c.nome })),
      locaisDisponiveis: locais.map(l => ({ id: l.id, nome: l.nome }))
    });

    buscarReservasTimeline(formData.date, formData.localId, locais, clientes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, formData.localId]);

  // ============================================================================
  // COMPUTAÇÕES E HELPERS
  // ============================================================================

  // Obter dados do local selecionado
  const localSelecionado = useMemo(() => {
    return locais.find(l => l.id === formData.localId);
  }, [locais, formData.localId]);

  // Calcular total de horas e valor
  const { totalHours, totalMinutes, totalValue } = useMemo(() => {
    if (!formData.startTime || !formData.endTime) {
      return { totalHours: 0, totalMinutes: 0, totalValue: 0 };
    }
    
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
      return { totalHours: 0, totalMinutes: 0, totalValue: 0 };
    }
    
    const totalMinutes = endTotalMinutes - startTotalMinutes;
    const totalHours = totalMinutes / 60;
    const valorHora = localSelecionado?.valorHora || 80;
    const totalValue = totalHours * valorHora;
    
    return { totalHours, totalMinutes, totalValue };
  }, [formData.startTime, formData.endTime, localSelecionado]);

  // Formatar duração
  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutos`;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  }, []);

  // Calcular horário final baseado no intervalo do local
  const calculateEndTime = useCallback((startTime: string, localId: string) => {
    if (!startTime || !localId) return '';
    
    const local = locais.find(l => l.id === localId);
    if (!local) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + (local.intervalo || 30);
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }, [locais]);

  // Preparar eventos para a timeline
  const timelineEventsFormatted = useMemo(() => {
    return timelineEvents.map(event => ({
      id: event.id,
      client: event.client,
      venue: event.venue,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
      color: event.color,
      sport: event.sport || '',
      notes: event.notes || ''
    }));
  }, [timelineEvents]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClienteChange = useCallback((value: string, item: any) => {
    setFormData(prev => ({ ...prev, clienteId: item?.id || value }));
  }, []);

  const handleLocalChange = useCallback((value: string, item: any) => {
    const localId = item?.id || value;
    setFormData(prev => ({ 
      ...prev, 
      localId,
      startTime: '', // Reset horários
      endTime: ''
    }));
    
    // Se está editando e mudou o local, sair do modo de edição
    if (editingEventId) {
      setEditingEventId(null);
    }
  }, [editingEventId]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      date,
      startTime: '', // Reset horários
      endTime: ''
    }));
    
    // Se está editando e mudou a data, sair do modo de edição
    if (editingEventId) {
      setEditingEventId(null);
    }
  }, [editingEventId]);

  const handleStartTimeChange = useCallback((time: string) => {
    const endTime = calculateEndTime(time, formData.localId);
    setFormData(prev => ({ 
      ...prev, 
      startTime: time,
      endTime: endTime
    }));
  }, [calculateEndTime, formData.localId]);

  const handleEndTimeChange = useCallback((time: string) => {
    setFormData(prev => ({ ...prev, endTime: time }));
  }, []);

  const handleTimeSlotClick = useCallback((time: string) => {
    if (!isEditMode && formData.localId) {
      handleStartTimeChange(time);
    }
  }, [isEditMode, formData.localId, handleStartTimeChange]);

  const handleEventClick = useCallback((event: any) => {
    console.log('🎯 [Timeline] Evento clicado na própria timeline:', event);
    
    // Se o evento clicado já está em edição, não fazer nada
    if (editingEventId === event.id) {
      console.log('⏭️ Evento já está em edição');
      return;
    }
    
    // Preencher formulário diretamente com os dados do evento
    const cliente = clientes.find(c => c.nome === event.client);
    const local = locais.find(l => l.nome === event.venue);
    
    if (!cliente || !local) {
      console.error('❌ Cliente ou local não encontrado para o evento');
      return;
    }
    
    // Extrair a data do selectedDate
    const [year, month, day] = formatDateLocal(formData.date).split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    
    console.log('✅ Preenchendo formulário com dados do evento:', {
      id: event.id,
      cliente: cliente.nome,
      local: local.nome,
      date: eventDate,
      startTime: event.startTime,
      endTime: event.endTime
    });
    
    // Atualizar formulário (sem navegar)
    setFormData({
      clienteId: cliente.id,
      localId: local.id,
      date: eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      observations: event.notes || event.sport || '',
      esporte: event.sport || '',
      amount: '',
      recurring: false,
      recurringType: '',
      customRecurringDays: '',
      usuarioId: null
    });
    
    // Marcar como editando (sem navegar)
    setEditingEventId(event.id);
  }, [editingEventId, clientes, locais, formData.date, formatDateLocal]);

  const handleCancelEdit = useCallback(() => {
    console.log('❌ [Reserva] Cancelando edição');
    
    // Se está editando via timeline (sem id na URL), limpar mantendo data e local
    if (editingEventId && !id) {
      const currentDate = formData.date;
      const currentLocalId = formData.localId;
      
      setEditingEventId(null);
      setFormData({
        ...INITIAL_FORM_STATE,
        date: currentDate,
        localId: currentLocalId
      });
      return;
    }
    
    // Se está editando via URL (vem da agenda), voltar para agenda
    if (id) {
      navigate('/eventos/agenda');
      return;
    }
  }, [editingEventId, id, formData.date, formData.localId, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.localId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const reservaData = {
      clienteId: formData.clienteId,
      localId: formData.localId,
      usuarioId: formData.usuarioId,
      dataInicio: `${formatDateLocal(formData.date)}T${formData.startTime}:00Z`,
      dataFim: `${formatDateLocal(formData.date)}T${formData.endTime}:00Z`,
      situacao: SituacaoReserva.Pendente,
      cor: localSelecionado?.cor || '#3b82f6',
      esporte: formData.esporte,
      observacoes: formData.observations,
      valor: parseFloat(formData.amount) || totalValue
    };

    try {
      const reservaId = id || editingEventId;
      
      if (isEditMode && reservaId) {
        console.log('📝 [Reserva] Atualizando reserva:', reservaData);
        await updateReserva(reservaId, reservaData);
        toast.success('Reserva atualizada com sucesso!');
      } else {
        console.log('➕ [Reserva] Criando reserva:', reservaData);
        await createReserva(reservaData);
        toast.success('Reserva criada com sucesso!');
      }
      
      // Limpar estado de edição e voltar para agenda
      setEditingEventId(null);
      navigate('/eventos/agenda');
    } catch (error) {
      console.error('❌ [Reserva] Erro ao salvar:', error);
      toast.error('Erro ao salvar reserva');
    }
  }, [formData, localSelecionado, totalValue, isEditMode, id, editingEventId, updateReserva, createReserva, navigate]);

  const handleDelete = useCallback(async (eventId: string) => {
    try {
      await deleteReserva(eventId);
      toast.success('Reserva excluída com sucesso!');
      
      // Limpar estado de edição
      setEditingEventId(null);
      setFormData(INITIAL_FORM_STATE);
      
      // Se veio da URL, voltar para agenda
      if (id) {
        navigate('/eventos/agenda');
      }
    } catch (error) {
      console.error('❌ [Reserva] Erro ao excluir:', error);
      toast.error('Erro ao excluir reserva');
    }
  }, [deleteReserva, id, navigate]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const recurringOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'custom', label: 'Personalizado' }
  ];

  // Obter configurações do local para os seletores de hora
  const venueConfig = useMemo(() => {
    if (!localSelecionado) return null;
    return {
      interval: localSelecionado.intervalo || 30,
      minTime: localSelecionado.horaAbertura || "07:00",
      maxTime: localSelecionado.horaFechamento || "21:00"
    };
  }, [localSelecionado]);

  const pageTitle = isEditMode ? "Editar Reserva" : "Nova Reserva";
  const pageIcon = isEditMode ? <Edit className="h-6 w-6" /> : <Calendar className="h-6 w-6" />;

  if (isLoadingReserva) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ModuleHeader
          title="Carregando..."
          icon={<Calendar className="h-6 w-6" />}
          moduleColor={MODULE_COLORS.events}
          backTo='/eventos'
          backLabel="Voltar"
        />
        <main className="max-w-none mx-auto px-6 py-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados da reserva...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <Card className={`${isEditMode ? 'border-module-events/90 border-2 rounded-lg' : ''} flex-1 flex flex-col`}>
              <CardHeader className="flex-shrink-0">
                {isEditMode && (
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Cliente */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <CampoBusca
                        id="client"
                        label="Cliente"
                        value={formData.clienteId}
                        selectedId={formData.clienteId}
                        onChange={handleClienteChange}
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

                  {/* Local */}
                  <CampoBusca
                    id="venue"
                    label="Local"
                    value={formData.localId}
                    selectedId={formData.localId}
                    onChange={handleLocalChange}
                    items={locais.map(local => ({
                      id: local.id,
                      label: local.nome,
                      subtitle: local.descricao || local.nome
                    }))}
                    displayField="label"
                    placeholder="Selecione o local..."
                    required
                  />

                  {/* Data */}
                  <SeletorData
                    id="date"
                    label="Data"
                    value={formData.date}
                    onChange={handleDateChange}
                    required
                  />

                  {/* Horários */}
                  <div className="grid grid-cols-2 gap-4">
                    <SeletorHora
                      id="startTime"
                      label="Início"
                      value={formData.startTime}
                      onChange={handleStartTimeChange}
                      interval={venueConfig?.interval || 30}
                      minTime={venueConfig?.minTime || "07:00"}
                      maxTime={venueConfig?.maxTime || "21:00"}
                      occupiedTimes={[]}
                      venueSelected={!!formData.localId}
                      dateSelected={!!formData.date}
                      required
                    />

                    <SeletorHora
                      id="endTime"
                      label="Término"
                      value={formData.endTime}
                      onChange={handleEndTimeChange}
                      interval={venueConfig?.interval || 30}
                      minTime={venueConfig?.minTime || "07:00"}
                      maxTime={venueConfig?.maxTime || "21:00"}
                      occupiedTimes={[]}
                      venueSelected={!!formData.localId}
                      dateSelected={!!formData.date}
                      required
                    />
                  </div>

                  {/* Observações */}
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

                  {/* Evento Recorrente */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800/30">
                          <Repeat className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <Label htmlFor="recurring" className="text-sm font-semibold cursor-pointer">
                            Evento Recorrente
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Criar várias reservas baseadas em um padrão
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="recurring"
                        checked={formData.recurring}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recurring: checked }))}
                      />
                    </div>
                    
                    {formData.recurring && (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50/30 dark:bg-gray-900/10">
                        <div className="space-y-2">
                          <Label htmlFor="recurringType">Frequência de repetição</Label>
                          <Select 
                            value={formData.recurringType} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, recurringType: value }))}
                          >
                            <SelectTrigger>
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
                            <Label htmlFor="customRecurringDays">Dias personalizados</Label>
                            <Input
                              id="customRecurringDays"
                              value={formData.customRecurringDays}
                              onChange={(e) => setFormData(prev => ({ ...prev, customRecurringDays: e.target.value }))}
                              placeholder="Ex: Segunda, Quarta, Sexta"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Esporte/Atividade */}
                  <div>
                    <Label htmlFor="esporte">Esporte/Atividade</Label>
                    <Input
                      id="esporte"
                      value={formData.esporte}
                      onChange={(e) => setFormData(prev => ({ ...prev, esporte: e.target.value }))}
                      placeholder="Ex: Futebol, Vôlei, Basquete..."
                    />
                  </div>

                  {/* Resumo */}
                  {totalMinutes > 0 && (
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <h3 className="font-semibold mb-3">Resumo da Reserva</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Duração:</span>
                          <span>{formatDuration(totalMinutes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa por hora:</span>
                          <span>R$ {(localSelecionado?.valorHora || 80).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base border-t pt-2">
                          <span>Valor Total:</span>
                          <span>R$ {totalValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!formData.clienteId || !formData.localId || !formData.date || !formData.startTime || !formData.endTime}
                    >
                      {isEditMode ? 'Atualizar' : 'Salvar'} Reserva
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/eventos/recebiveis/novo?payNow=true')}
                            className="px-3"
                            disabled={!formData.clienteId || !formData.localId}
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
                      onClick={() => navigate('/eventos/agenda')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardContent className="h-full p-0 flex flex-col">
                <EventTimeline
                  selectedDate={formatDateLocal(formData.date)}
                  events={timelineEventsFormatted}
                  selectedVenue={localSelecionado?.nome || ''}
                  loading={timelineLoading}
                  locais={locais}
                  onTimeSlotClick={handleTimeSlotClick}
                  onEventEdit={handleEventClick}
                  editingEventId={editingEventId || id || null}
                  onEventSelect={handleEventClick}
                  onCancelEdit={handleCancelEdit}
                  onDeleteEvent={handleDelete}
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
