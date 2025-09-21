
import ModuleHeader from '@/components/ModuleHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { usePermissoesUsuario } from '@/contexts/PermissoesUsuarioContext';
import { api } from '@/lib/api';
import { BarChart3, Calendar, CreditCard, MapPin, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaces para os dados dos cards
interface ReservaRecente {
  id: string;
  cliente: {
    id: string;
    nome: string;
    telefone?: string;
  };
  local: {
    id: string;
    nome: string;
    tipo: string;
  };
  dataReserva: string;
  dataInicio: string;
  dataFim: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  valor: number;
  observacoes?: string;
}

interface EstatisticasEventos {
  totalReservas: number;
  receitaHoje: number;
  receitaMes: number;
  taxaOcupacao: number;
  clientesAtivos: number;
  reservasCanceladas: number;
  reservasPendentes: number;
  reservasConfirmadas: number;
  mediaReservasPorDia: number;
  receitaMediaPorReserva: number;
}

interface ProximasReservas {
  reservasHoje: number;
  reservasAmanha: number;
  reservasEstaSemana: number;
  proximasReservas: Array<{
    id: string;
    data: string;
    hora: string;
    local: string;
    cliente: string;
    status: string;
  }>;
}

const Events = () => {
  const navigate = useNavigate();
  const { hasClientesAccess, hasReservasAccess, hasLocaisAccess, hasRecebiveisAccess } = usePermissoesUsuario();

  // Estados para os dados dos cards
  const [reservasRecentes, setReservasRecentes] = useState<ReservaRecente[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasEventos | null>(null);
  const [proximasReservas, setProximasReservas] = useState<ProximasReservas | null>(null);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(false);
  const [loadingProximas, setLoadingProximas] = useState(false);

  // Funções para carregar dados das APIs
  const carregarReservasRecentes = async () => {
    if (!hasReservasAccess()) return;
    
    try {
      setLoadingReservas(true);
      const response = await api.get<{ success: boolean; data: ReservaRecente[] }>('reservas/recentes?limit=5');
      
      // Verificar se a resposta é válida e tem dados
      if (response && response.success && response.data && Array.isArray(response.data)) {
        setReservasRecentes(response.data);
      } else {
        console.warn('Resposta inválida para reservas recentes:', response);
        setReservasRecentes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar reservas recentes:', error);
      setReservasRecentes([]);
    } finally {
      setLoadingReservas(false);
    }
  };

  const carregarEstatisticas = async () => {
    if (!hasReservasAccess()) return;
    
    try {
      setLoadingEstatisticas(true);
      const response = await api.get<{ success: boolean; data: EstatisticasEventos }>('eventos/estatisticas?periodo=mes');
      
      // Verificar se a resposta é válida e tem os campos obrigatórios
      if (response && response.success && response.data && typeof response.data === 'object' && 
          typeof response.data.totalReservas === 'number' &&
          typeof response.data.receitaHoje === 'number' &&
          typeof response.data.taxaOcupacao === 'number' &&
          typeof response.data.clientesAtivos === 'number') {
        setEstatisticas(response.data);
      } else {
        console.warn('Resposta inválida para estatísticas:', response);
        setEstatisticas(null);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setEstatisticas(null);
    } finally {
      setLoadingEstatisticas(false);
    }
  };

  const carregarProximasReservas = async () => {
    if (!hasReservasAccess()) return;
    
    try {
      setLoadingProximas(true);
      const response = await api.get<{ success: boolean; data: ProximasReservas }>('reservas/proximas?dias=7&status=confirmed');
      
      // Verificar se a resposta é válida e tem os campos obrigatórios
      if (response && response.success && response.data && typeof response.data === 'object' &&
          typeof response.data.reservasHoje === 'number' &&
          typeof response.data.reservasAmanha === 'number' &&
          typeof response.data.reservasEstaSemana === 'number') {
        setProximasReservas(response.data);
      } else {
        console.warn('Resposta inválida para próximas reservas:', response);
        setProximasReservas(null);
      }
    } catch (error) {
      console.error('Erro ao carregar próximas reservas:', error);
      setProximasReservas(null);
    } finally {
      setLoadingProximas(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    carregarReservasRecentes();
    carregarEstatisticas();
    carregarProximasReservas();
  }, []);

  const quickActions = [
    {
      title: 'Nova Reserva',
      description: 'Criar uma nova reserva',
      icon: Plus,
      color: 'bg-module-events',
      action: () => navigate('/eventos/reserva/novo'),
      hasAccess: hasReservasAccess()
    },
    {
      title: 'Locais',
      description: 'Gerenciar locais esportivos',
      icon: MapPin,
      color: 'bg-module-events',
      action: () => navigate('/eventos/locais'),
      hasAccess: hasLocaisAccess()
    },
    {
      title: 'Clientes',
      description: 'Gerenciar clientes',
      icon: Users,
      color: 'bg-module-events',
      action: () => navigate('/eventos/clientes'),
      hasAccess: hasClientesAccess()
    },
    {
      title: 'Agenda',
      description: 'Visualizar agenda',
      icon: Calendar,
      color: 'bg-module-events',
      action: () => navigate('/eventos/agenda'),
      hasAccess: hasReservasAccess() // Agenda é parte das reservas
    },
    {
      title: 'Recebíveis',
      description: 'Contas a receber',
      icon: CreditCard,
      color: 'bg-module-events',
      action: () => navigate('/eventos/recebiveis'),
      hasAccess: hasRecebiveisAccess()
    },
    {
      title: 'Relatórios',
      description: 'Análises e estatísticas',
      icon: BarChart3,
      color: 'bg-module-events',
      action: () => navigate('/eventos/relatorios'),
      hasAccess: hasReservasAccess() // Relatórios são parte das reservas
    }
  ];

  // Função para formatar data
  const formatarData = (data: string) => {
    try {
      if (!data) return 'Data não informada';
      return new Date(data).toLocaleDateString('pt-BR');
    } catch (error) {
      console.warn('Erro ao formatar data:', data, error);
      return 'Data inválida';
    }
  };

  // Função para formatar hora
  const formatarHora = (dataInicio: string, dataFim: string) => {
    try {
      if (!dataInicio || !dataFim) return 'Horário não informado';
      const inicio = dataInicio.split('T')[1]?.substring(0, 5) || '';
      const fim = dataFim.split('T')[1]?.substring(0, 5) || '';
      return `${inicio}-${fim}`;
    } catch (error) {
      console.warn('Erro ao formatar hora:', dataInicio, dataFim, error);
      return 'Horário inválido';
    }
  };

  // Função para formatar valor monetário
  const formatarValor = (valor: number) => {
    try {
      if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
      return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    } catch (error) {
      console.warn('Erro ao formatar valor:', valor, error);
      return 'R$ 0,00';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ModuleHeader
        title="Eventos"
        icon={<Calendar className="h-6 w-6" />}
        moduleColor={MODULE_COLORS.events}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card
                  key={index}
                  className={`transition-all duration-300 border ${
                    action.hasAccess 
                      ? 'cursor-pointer hover:shadow-lg hover:scale-105' 
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={action.hasAccess ? action.action : undefined}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="mb-1">
                      <h3 className="font-semibold text-card-foreground">{action.title}</h3>
                      {!action.hasAccess && (
                        <Badge className="mt-1 bg-red-500 text-white">
                          Sem Permissão
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Inicio Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Reservas Recentes</CardTitle>
              <CardDescription>
                Últimas reservas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingReservas ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reservasRecentes.length > 0 ? (
                <div className="space-y-3">
                  {reservasRecentes.map((reserva) => (
                    <div key={reserva.id} className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
                      <div>
                        <div className="font-medium text-card-foreground">
                          {reserva.cliente?.nome || 'Cliente não informado'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {reserva.local?.nome || 'Local não informado'} - {formatarHora(reserva.dataInicio, reserva.dataFim)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{formatarData(reserva.dataReserva)}</div>
                        <div className={`text-xs font-medium ${getStatusColor(reserva.status || 'pending')}`}>
                          {getStatusText(reserva.status || 'pending')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma reserva recente encontrada</p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/eventos/agenda')}
                disabled={!hasReservasAccess()}
              >
                Ver Todas as Reservas
              </Button>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Estatísticas do Mês</CardTitle>
              <CardDescription>
                Visão geral do desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEstatisticas ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : estatisticas ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de Reservas</span>
                    <span className="font-semibold text-green-600">{estatisticas.totalReservas || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita Hoje</span>
                    <span className="font-semibold text-blue-600">{formatarValor(estatisticas.receitaHoje || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Ocupação</span>
                    <span className="font-semibold text-purple-600">{(estatisticas.taxaOcupacao || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Clientes Ativos</span>
                    <span className="font-semibold text-orange-600">{estatisticas.clientesAtivos || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Erro ao carregar estatísticas</p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/eventos/relatorios')}
                disabled={!hasReservasAccess()}
              >
                Gerar Relatório Detalhado
              </Button>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Próximas Reservas</CardTitle>
              <CardDescription>
                Agenda dos próximos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProximas ? (
                <div className="text-center animate-pulse">
                  <div className="h-8 bg-muted rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-muted rounded w-32 mx-auto mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="h-6 bg-muted rounded w-8 mx-auto mb-1"></div>
                      <div className="h-3 bg-muted rounded w-12 mx-auto"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-6 bg-muted rounded w-8 mx-auto mb-1"></div>
                      <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ) : proximasReservas ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{proximasReservas.reservasHoje || 0}</div>
                  <div className="text-sm text-muted-foreground mb-4">Reservas confirmadas hoje</div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-card-foreground">{proximasReservas.reservasAmanha || 0}</div>
                      <div className="text-muted-foreground">Amanhã</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-card-foreground">{proximasReservas.reservasEstaSemana || 0}</div>
                      <div className="text-muted-foreground">Esta Semana</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Erro ao carregar próximas reservas</p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/eventos/agenda')}
                disabled={!hasReservasAccess()}
              >
                Ver Agenda Completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Events;
