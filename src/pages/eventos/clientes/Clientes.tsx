
import { usePermissoesUsuario } from '@/contexts/PermissoesUsuarioContext';
import { Listagem } from '@/core/components/listagem';
import { useClientes } from '@/hooks/useClientes';
import type { Cliente } from '@/types';
import { Calendar, UserCheck, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Clientes() {
  const navigate = useNavigate();
  const hook = useClientes();
  const { hasClientesAccess } = usePermissoesUsuario();

  return (
    <Listagem<Cliente>
      titulo="Clientes"
      descricao="Visualize e gerencie todos os clientes do módulo de eventos"
      icone={<Users className="h-6 w-6" />}
      corModulo="rgb(var(--module-events))"
      nomeEntidade="Cliente"
      nomeEntidadePlural="Clientes"
      rotaEntidade="/eventos/clientes"
      rotaResumo="/eventos/clientes/resumo"
      hook={hook}
      colunas={[
        {
          chave: 'nome',
          titulo: 'Nome',
          ordenavel: true,
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'texto',
          visivelPorPadrao: true
        },
        {
          chave: 'email',
          titulo: 'E-mail',
          ordenavel: true,
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'email',
          visivelPorPadrao: true
        },
        {
          chave: 'telefone',
          titulo: 'Telefone',
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'telefone',
          visivelPorPadrao: true
        },
        {
          chave: 'documento',
          titulo: 'Documento',
          ordenavel: true,
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'documento',
          visivelPorPadrao: false
        },
        {
          chave: 'endereco',
          titulo: 'Endereço',
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'texto',
          cortarTextoComQuantCaracteres: 35,
          visivelPorPadrao: true
        },
        {
          chave: 'observacoes',
          titulo: 'Observações',
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'texto',
          cortarTextoComQuantCaracteres: 40,
          visivelPorPadrao: false
        },
        {
          chave: 'situacao',
          titulo: 'Situação',
          ordenavel: true,
          filtravel: true,
          tipoFiltro: 'select',
          tipo: 'situacao',
          visivelPorPadrao: true,
          mapeamentoValores: {
            1: 'ativo',
            2: 'inativo',
            3: 'bloqueado'
          },
          opcoesSituacao: {
            ativo: { label: 'Ativo', variant: 'default' },
            inativo: { label: 'Inativo', variant: 'destructive' },
            bloqueado: { label: 'Bloqueado', variant: 'secondary' }
          }
        },
        {
          chave: 'dataCriacao',
          titulo: 'Data Cadastro',
          ordenavel: true,
          tipo: 'data',
          visivelPorPadrao: true
        },
        {
          chave: 'dataAtualizacao',
          titulo: 'Última Atualização',
          ordenavel: true,
          renderizar: (cliente) => cliente.dataAtualizacao ? new Date(cliente.dataAtualizacao).toLocaleDateString('pt-BR') : 'N/A',
          tipo: 'data'
        }
      ]}
      acoes={hasClientesAccess() ? [
        {
          titulo: 'Editar',
          onClick: (cliente) => navigate(`/eventos/clientes/${cliente.id}`),
          variante: 'outline',
        },
      ] : []}
      botaoCriar={hasClientesAccess() ? {
        titulo: 'Novo Cliente',
        icone: <UserPlus className="h-4 w-4" />,
        rota: '/eventos/clientes/novo',
      } : undefined}
      cardsResumo={[
        {
          titulo: 'Total de Clientes',
          valor: (_data, _pagination, summaryData) => summaryData?.totalClientes ?? 0,
          descricao: 'Base total de clientes',
          icone: Users,
          cor: 'bg-blue-500',
          tendencia: {
            valor: 8,
            label: 'vs mês anterior',
            tipo: 'positivo'
          }
        },
        {
          titulo: 'Taxa de Ativação',
          valor: (_data, _pagination, summaryData) => {
            const ativos = summaryData?.ativos ?? 0;
            const total = summaryData?.totalClientes ?? 1;
            return `${Math.round((ativos / total) * 100)}%`;
          },
          descricao: 'Clientes ativos do total',
          icone: UserCheck,
          cor: 'bg-green-500',
          tendencia: {
            valor: 5,
            label: 'vs mês anterior',
            tipo: 'positivo'
          }
        },
        {
          titulo: 'Crescimento Mensal',
          valor: (_data, _pagination, summaryData) => summaryData?.novosMes ?? 0,
          descricao: 'Novos clientes este mês',
          icone: UserPlus,
          cor: 'bg-emerald-500',
          tendencia: {
            valor: 12,
            label: 'vs mês anterior',
            tipo: 'positivo'
          }
        },
        {
          titulo: 'Mix de Clientes',
          valor: (_data, _pagination, summaryData) => {
            const pj = summaryData?.pessoaJuridica ?? 0;
            const pf = (summaryData?.totalClientes ?? 0) - pj;
            return `${pf} PF / ${pj} PJ`;
          },
          descricao: 'Pessoa Física vs Jurídica',
          icone: Calendar,
          cor: 'bg-purple-500',
          tendencia: {
            valor: -2,
            label: 'PJ vs mês anterior',
            tipo: 'negativo'
          }
        },
      ]}
      camposBusca={['nome', 'email', 'documento']}
      placeholderBusca="Buscar clientes..."
      mostrarExportar={true}
      nomeArquivoExportar="clientes-eventos"
      ordenacaoPadrao="nome"
      tamanhoPaginaPadrao={10}
    />
  );
}
