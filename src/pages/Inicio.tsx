
import FilialSelector from '@/components/FilialSelector';
import ModuleHeader from '@/components/ModuleHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissoesUsuario } from '@/contexts/PermissoesUsuarioContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { BarChart3, Building2, Calendar, HomeIcon, Moon, Settings, Sun, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inicio = () => {
  const navigate = useNavigate();
  const { user, empresa, filialAtual, logout } = useAuth();
  const { hasModuleAccess, hasConfiguracoesAccess } = usePermissoesUsuario();
  const { theme, toggleTheme } = useTheme();
  const { goBack } = useNavigationHistory();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const modules = [
    {
      id: 'Eventos',
      title: 'Eventos',
      description: 'Gerencie reservas esportivas, locais, agendas e análises financeiras',
      icon: Calendar,
      color: MODULE_COLORS.events,
      textColor: 'text-gray-600 dark:text-gray-300',
      features: [
        'Agenda com visualização diária, semanal e mensal',
        'Cadastro de locais esportivos',
        'Reservas recorrentes automáticas',
        'Relatórios financeiros detalhados',
        'Gestão de clientes e histórico'
      ],
      path: '/eventos'
    },
    {
      id: 'Bar',
      title: 'Bar',
      description: 'Controle completo do bar, estoque, comandas e caixa',
      icon: BarChart3,
      color: MODULE_COLORS.bar,
      textColor: 'text-gray-600 dark:text-gray-300',
      features: [
        'Cadastro de produtos e controle de estoque',
        'Sistema de comandas digitais',
        'Caixa integrado para pagamentos',
        'Relatórios de vendas em tempo real',
        'Gestão de funcionários e turnos'
      ],
      path: '/bar'
    },
    {
      id: 'Escolinha',
      title: 'Escola',
      description: 'Gestão completa de alunos, mensalidades e turmas',
      icon: Users2,
      color: MODULE_COLORS.school,
      textColor: 'text-gray-600 dark:text-gray-300',
      features: [
        'Cadastro e gestão de alunos',
        'Controle de mensalidades e pagamentos',
        'Histórico financeiro dos alunos',
        'Gestão de turmas e horários',
        'Relatórios de inadimplência'
      ],
      path: '/escolinha'
    },
    {
      id: 'Financeiro',
      title: 'Financeiro',
      description: 'Controle financeiro completo da empresa',
      icon: BarChart3,
      color: MODULE_COLORS.financial,
      textColor: 'text-gray-600 dark:text-gray-300',
      features: [
        'Gestão de contas a pagar e receber',
        'Relatórios financeiros detalhados',
        'Controle de fluxo de caixa',
        'Integração bancária',
        'Análise de receitas e despesas'
      ],
      path: '/financeiro'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ModuleHeader
        title="Início"
        icon={<HomeIcon className="h-6 w-6" />}
        moduleColor={MODULE_COLORS.inicio}
        mustReturn={false}
      />

      {/* Main Content */}
      <main className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Bem-vindo, {user?.nome}!
            </h1>
            <p className="text-muted-foreground">
              Escolha um módulo para começar a trabalhar
            </p>
            
            {/* Informações da empresa e filial */}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              {empresa && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{empresa.nome}</span>
                </div>
              )}
              {filialAtual && (
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span>{filialAtual.nome}</span>
                  {filialAtual.cidade && filialAtual.estado && (
                    <span className="text-xs">({filialAtual.cidade} - {filialAtual.estado})</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Controles superiores */}
          <div className="flex items-center gap-4">
            {/* Seletor de filial */}
            <FilialSelector showLabel={false} />
            
            {/* Switch de tema */}
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Botão de Configurações */}
            <Button
              onClick={() => hasConfiguracoesAccess() && navigate('/configuracoes')}
              variant="outline"
              className={`gap-2 ${!hasConfiguracoesAccess() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasConfiguracoesAccess()}
            >
              <Settings className="h-4 w-4" />
              Configurações
              {!hasConfiguracoesAccess() && (
                <Badge className="ml-1 bg-red-500 text-white text-xs">
                  Sem Permissão
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {modules.map((module) => {
            const hasAccess = hasModuleAccess(module.id);
            const IconComponent = module.icon;

            return (
              <Card
                key={module.id}
                className={`relative overflow-hidden transition-all duration-300 border ${hasAccess
                  ? 'cursor-pointer hover:shadow-xl hover:scale-105'
                  : 'opacity-60 cursor-not-allowed'
                  }`}
                onClick={() => hasAccess && navigate(module.path)}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full transform translate-x-8 -translate-y-8`} 
                     style={{ backgroundColor: module.color }} />

                <CardHeader className="relative h-40 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-lg`} style={{ backgroundColor: module.color }}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-card-foreground">{module.title}</CardTitle>
                      {!hasAccess && (
                        <Badge className="mt-1 bg-red-500 text-white">
                          Sem Acesso
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-base text-muted-foreground pt-1">
                    {module.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative h-48 p-4">
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative bottom-0 left-0 w-full">
                  {(hasAccess) && (
                    <Button
                      className={`w-full text-white transition-colors hover:opacity-90`}
                      style={{ backgroundColor: module.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(module.path);
                      }}
                    >
                      Acessar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-module-events/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-module-events" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reservas Hoje</p>
                  <p className="text-2xl font-bold text-card-foreground">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-module-bar/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-module-bar" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendas do Bar</p>
                  <p className="text-2xl font-bold text-card-foreground">R$ 2.450</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-module-school/20 rounded-lg">
                  <Users2 className="h-5 w-5 text-module-school" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos Matriculados</p>
                  <p className="text-2xl font-bold text-card-foreground">150</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-module-financial/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-module-financial" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Hoje</p>
                  <p className="text-2xl font-bold text-card-foreground">R$ 15.000</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Inicio;
