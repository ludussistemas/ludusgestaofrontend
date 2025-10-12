import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Toaster as ShadcnToaster } from './components/ui/toaster';
import Bar from './pages/Bar';
import Events from './pages/Events';
import Financial from './pages/Financial';
import Index from './pages/Index';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import School from './pages/School';
import Settings from './pages/Settings';

// Eventos
import Cliente from './pages/eventos/clientes/Cliente';
import Clientes from './pages/eventos/clientes/Clientes';
import HistoricoCliente from './pages/eventos/clientes/HistoricoCliente';
import Agenda from './pages/eventos/eventos/Agenda';
import Reserva from './pages/eventos/eventos/Reserva';
import Locais from './pages/eventos/locais/Locais';
import Local from './pages/eventos/locais/Local';
import ReceberPagamento from './pages/eventos/recebiveis/ReceberPagamento';
import Recebiveis from './pages/eventos/recebiveis/Recebiveis';
import Recebivel from './pages/eventos/recebiveis/Recebivel';
import RelatoriosEventos from './pages/eventos/relatorios/Relatorios';

// Bar
import Checkout from './pages/bar/Checkout';
import Comanda from './pages/bar/Comanda';
import Comandas from './pages/bar/Comandas';
import EditProduct from './pages/bar/EditProduct';
import Inventory from './pages/bar/Inventory';
import NewProduct from './pages/bar/NewProduct';
import NewSale from './pages/bar/NewSale';
import Products from './pages/bar/Products';
import ReportsBar from './pages/bar/Reports';
import UnifiedSale from './pages/bar/UnifiedSale';

// Escolinha
import AttendanceCall from './pages/escolinha/AttendanceCall';
import ClassStudents from './pages/escolinha/ClassStudents';
import Classes from './pages/escolinha/Classes';
import ClientesEscolinha from './pages/escolinha/ClientesEscolinha';
import EditClass from './pages/escolinha/EditClass';
import EditStudent from './pages/escolinha/EditStudent';
import EditTeacher from './pages/escolinha/EditTeacher';
import NewClass from './pages/escolinha/NewClass';
import NewStudent from './pages/escolinha/NewStudent';
import NewTeacher from './pages/escolinha/NewTeacher';
import Payments from './pages/escolinha/Payments';
import PublicAttendanceCall from './pages/escolinha/PublicAttendanceCall';
import ReceivePayment from './pages/escolinha/ReceivePayment';
import ReportsSchool from './pages/escolinha/Reports';
import StudentHistory from './pages/escolinha/StudentHistory';
import Students from './pages/escolinha/Students';
import TeacherReport from './pages/escolinha/TeacherReport';
import Teachers from './pages/escolinha/Teachers';

// Financeiro
import AccountsPayable from './pages/financeiro/AccountsPayable';
import AccountsReceivable from './pages/financeiro/AccountsReceivable';
import CashFlow from './pages/financeiro/CashFlow';
import CustomReport from './pages/financeiro/CustomReport';
import Expenses from './pages/financeiro/Expenses';
import NewExpense from './pages/financeiro/NewExpense';
import NewPayable from './pages/financeiro/NewPayable';
import NewReceivable from './pages/financeiro/NewReceivable';
import NewRevenue from './pages/financeiro/NewRevenue';
import ReceivePaymentFinancial from './pages/financeiro/ReceivePayment';
import Reports from './pages/financeiro/Reports';
import Revenues from './pages/financeiro/Revenues';
import TeacherPaymentReport from './pages/financeiro/TeacherPaymentReport';

// Sistema Interno
import InternalSystem from './pages/InternalSystem';
import Clients from './pages/sistema-interno/Clients';
import ListaClientes from './pages/sistema-interno/clientes/ListaClientes';
import NovoCliente from './pages/sistema-interno/clientes/NovoCliente';
import ContasReceber from './pages/sistema-interno/contas/ContasReceber';
import ConfigurarModulos from './pages/sistema-interno/modulos/ConfigurarModulos';

// Configurações
import Auditoria from './pages/configuracoes/Auditoria';
import EditGroup from './pages/configuracoes/EditGroup';
import Empresa from './pages/configuracoes/Empresa';
import Filiais from './pages/configuracoes/Filiais';
import FinanceiroGlobal from './pages/configuracoes/FinanceiroGlobal';
import FormUsuario from './pages/configuracoes/FormUsuario';
import Grupos from './pages/configuracoes/Grupos';
import Integracoes from './pages/configuracoes/Integracoes';
import NovaFilial from './pages/configuracoes/NovaFilial';
import NovoGrupo from './pages/configuracoes/NovoGrupo';
import Parametros from './pages/configuracoes/Parametros';
import ParametrosPorFilial from './pages/configuracoes/ParametrosPorFilial';
import Permissoes from './pages/configuracoes/Permissoes';
import PermissoesUsuario from './pages/configuracoes/PermissoesUsuario';
import Usuarios from './pages/configuracoes/Usuarios';

import UniversalReceivePayment from './pages/UniversalReceivePayment';

import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          
          {/* Rotas de Eventos */}
          <Route path="/eventos" element={<Events />} />
          <Route path="/eventos/agenda" element={<Agenda />} />
          <Route path="/eventos/reserva" element={<Reserva />} />
          <Route path="/eventos/reserva/novo" element={<Reserva />} />
          <Route path="/eventos/reserva/:id" element={<Reserva />} />
          <Route path="/eventos/clientes" element={<Clientes />} />
          <Route path="/eventos/clientes/novo" element={<Cliente />} />
          <Route path="/eventos/clientes/:id" element={<Cliente />} />
          <Route path="/eventos/clientes/:id/historico" element={<HistoricoCliente />} />
          <Route path="/eventos/locais" element={<Locais />} />
          <Route path="/eventos/locais/novo" element={<Local />} />
          <Route path="/eventos/locais/:id" element={<Local />} />
          <Route path="/eventos/recebiveis" element={<Recebiveis />} />
          <Route path="/eventos/recebiveis/novo" element={<Recebivel />} />
          <Route path="/eventos/recebiveis/:id" element={<Recebivel />} />
          <Route path="/eventos/recebiveis/:id/receber" element={<ReceberPagamento />} />
          <Route path="/eventos/relatorios" element={<RelatoriosEventos />} />

          {/* Bar */}
          <Route path="/bar" element={<Bar />} />
          <Route path="/bar/produtos" element={<Products />} />
          <Route path="/bar/produtos/novo" element={<NewProduct />} />
          <Route path="/bar/produtos/:id/editar" element={<EditProduct />} />
          <Route path="/bar/estoque" element={<Inventory />} />
          <Route path="/bar/comandas" element={<Comandas />} />
          <Route path="/bar/comandas/:id" element={<Comanda />} />
          <Route path="/bar/vendas/nova" element={<NewSale />} />
          <Route path="/bar/vendas/unificada" element={<UnifiedSale />} />
          <Route path="/bar/checkout" element={<Checkout />} />
          <Route path="/bar/relatorios" element={<ReportsBar />} />

          {/* Escolinha */}
          <Route path="/escolinha" element={<School />} />
          <Route path="/escolinha/clientes" element={<ClientesEscolinha />} />
          <Route path="/escolinha/alunos" element={<Students />} />
          <Route path="/escolinha/alunos/novo" element={<NewStudent />} />
          <Route path="/escolinha/alunos/:id/editar" element={<EditStudent />} />
          <Route path="/escolinha/alunos/:id/historico" element={<StudentHistory />} />
          <Route path="/escolinha/professores" element={<Teachers />} />
          <Route path="/escolinha/professores/novo" element={<NewTeacher />} />
          <Route path="/escolinha/professores/:id/editar" element={<EditTeacher />} />
          <Route path="/escolinha/professores/:id/relatorio" element={<TeacherReport />} />
          <Route path="/escolinha/turmas" element={<Classes />} />
          <Route path="/escolinha/turmas/nova" element={<NewClass />} />
          <Route path="/escolinha/turmas/:id/editar" element={<EditClass />} />
          <Route path="/escolinha/turmas/:id/alunos" element={<ClassStudents />} />
          <Route path="/escolinha/turmas/:id/chamada" element={<AttendanceCall />} />
          <Route path="/escolinha/chamada-publica" element={<PublicAttendanceCall />} />
          <Route path="/escolinha/mensalidades" element={<Payments />} />
          <Route path="/escolinha/mensalidades/receber" element={<ReceivePayment />} />
          <Route path="/escolinha/relatorios" element={<ReportsSchool />} />

          {/* Financeiro */}
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/financeiro/contas-receber" element={<AccountsReceivable />} />
          <Route path="/financeiro/contas-receber/novo" element={<NewReceivable />} />
          <Route path="/financeiro/contas-pagar" element={<AccountsPayable />} />
          <Route path="/financeiro/contas-pagar/novo" element={<NewPayable />} />
          <Route path="/financeiro/receitas" element={<Revenues />} />
          <Route path="/financeiro/receitas/nova" element={<NewRevenue />} />
          <Route path="/financeiro/despesas" element={<Expenses />} />
          <Route path="/financeiro/despesas/nova" element={<NewExpense />} />
          <Route path="/financeiro/fluxo-caixa" element={<CashFlow />} />
          <Route path="/financeiro/relatorios" element={<Reports />} />
          <Route path="/financeiro/relatorios/personalizado" element={<CustomReport />} />
          <Route path="/financeiro/receber-pagamento" element={<ReceivePaymentFinancial />} />
          <Route path="/financeiro/relatorio-pagamento-professores" element={<TeacherPaymentReport />} />

          {/* Sistema Interno */}
          <Route path="/sistema-interno" element={<InternalSystem />} />
          <Route path="/sistema-interno/clientes" element={<Clients />} />
          <Route path="/sistema-interno/clientes/lista" element={<ListaClientes />} />
          <Route path="/sistema-interno/clientes/novo" element={<NovoCliente />} />
          <Route path="/sistema-interno/contas/receber" element={<ContasReceber />} />
          <Route path="/sistema-interno/modulos/configurar" element={<ConfigurarModulos />} />
          
          {/* Configurações */}
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/configuracoes/empresa" element={<Empresa />} />
          <Route path="/configuracoes/filiais" element={<Filiais />} />
          <Route path="/configuracoes/filiais/nova" element={<NovaFilial />} />
          <Route path="/configuracoes/filiais/:id/editar" element={<NovaFilial />} />
          <Route path="/configuracoes/usuarios" element={<Usuarios />} />
          <Route path="/configuracoes/usuarios/novo" element={<FormUsuario />} />
          <Route path="/configuracoes/usuarios/:id/editar" element={<FormUsuario />} />
          <Route path="/configuracoes/usuarios/:id/permissoes" element={<PermissoesUsuario />} />
          <Route path="/configuracoes/grupos" element={<Grupos />} />
          <Route path="/configuracoes/grupos/novo" element={<NovoGrupo />} />
          <Route path="/configuracoes/grupos/:id/editar" element={<EditGroup />} />
          <Route path="/configuracoes/parametros" element={<ParametrosPorFilial />} />
          <Route path="/configuracoes/parametros/:filialId" element={<Parametros />} />
          <Route path="/configuracoes/integracoes" element={<Integracoes />} />
          <Route path="/configuracoes/financeiro-global" element={<FinanceiroGlobal />} />
          <Route path="/configuracoes/auditoria" element={<Auditoria />} />
          <Route path="/configuracoes/permissoes" element={<Permissoes />} />

          {/* Pagamento Universal */}
          <Route path="/receber-pagamento" element={<UniversalReceivePayment />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <ShadcnToaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
