import { Listagem } from '@/core/components/listagem';
import { useReservas } from '@/hooks/useReservas';
import type { Reserva } from '@/types';
import { Calendar, Clock, MapPin, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reservas = () => {
  const navigate = useNavigate();
  const hook = useReservas();

  return (
    <Listagem<Reserva>
      titulo="Reservas"
      descricao="Visualize e gerencie todas as reservas do módulo de eventos"
      icone={<Calendar className="h-6 w-6" />}
      corModulo="rgb(var(--module-events))"
      nomeEntidade="Reserva"
      nomeEntidadePlural="Reservas"
      rotaEntidade="/eventos/reservas"
      rotaResumo="/eventos/reservas/resumo"
      hook={hook}
      colunas={[
        {
          chave: 'clienteId',
          titulo: 'Cliente',
          ordenavel: true,
          filtravel: true,
          tipoFiltro: 'select',
          renderizar: (reserva) => reserva.cliente?.nome || 'Cliente não encontrado',
          tipo: 'texto',
          visivelPorPadrao: true
        },
        {
          chave: 'localId',
          titulo: 'Local',
          ordenavel: true,
          filtravel: true,
          tipoFiltro: 'select',
          renderizar: (reserva) => reserva.local?.nome || 'Local não encontrado',
          tipo: 'texto',
          visivelPorPadrao: true
        },
        {
          chave: 'dataInicio',
          titulo: 'Data/Hora Início',
          ordenavel: true,
          renderizar: (reserva) => {
            const data = new Date(reserva.dataInicio);
            return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          },
          tipo: 'data',
          visivelPorPadrao: true
        },
        {
          chave: 'dataFim',
          titulo: 'Data/Hora Fim',
          ordenavel: true,
          renderizar: (reserva) => {
            const data = new Date(reserva.dataFim);
            return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          },
          tipo: 'data',
          visivelPorPadrao: false
        },
        {
          chave: 'valor',
          titulo: 'Valor',
          ordenavel: true,
          renderizar: (reserva) => `R$ ${reserva.valor.toFixed(2)}`,
          tipo: 'valor',
          visivelPorPadrao: true
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
            1: 'pendente',
            2: 'confirmada',
            3: 'cancelada',
            4: 'finalizada',
            5: 'expirada'
          },
          opcoesSituacao: {
            pendente: { label: 'Pendente', variant: 'secondary' },
            confirmada: { label: 'Confirmada', variant: 'default' },
            cancelada: { label: 'Cancelada', variant: 'destructive' },
            finalizada: { label: 'Finalizada', variant: 'default' },
            expirada: { label: 'Expirada', variant: 'outline' }
          }
        },
        {
          chave: 'esporte',
          titulo: 'Esporte',
          filtravel: true,
          tipoFiltro: 'text',
          renderizar: (reserva) => reserva.esporte || 'N/A',
          tipo: 'texto'
        },
        {
          chave: 'cor',
          titulo: 'Cor',
          tipo: 'cor',
          visivelPorPadrao: false,
          tamanhoMaximo: 100
        },
        {
          chave: 'observacoes',
          titulo: 'Observações',
          filtravel: true,
          tipoFiltro: 'text',
          tipo: 'texto',
          cortarTextoComQuantCaracteres: 40
        },
        {
          chave: 'usuarioId',
          titulo: 'Usuário',
          renderizar: (reserva) => reserva.usuario?.nome || reserva.usuarioId || 'N/A',
          tipo: 'texto'
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
          renderizar: (reserva) => reserva.dataAtualizacao ? new Date(reserva.dataAtualizacao).toLocaleDateString('pt-BR') : 'N/A',
          tipo: 'data'
        }
      ]}
      acoes={[
        {
          titulo: 'Editar',
          onClick: (reserva) => navigate(`/eventos/reserva/${reserva.id}/editar`),
          variante: 'outline'
        },
        {
          titulo: 'Visualizar',
          onClick: (reserva) => navigate(`/eventos/reserva/${reserva.id}`),
          variante: 'default'
        }
      ]}
      botaoCriar={{
        titulo: 'Nova Reserva',
        icone: <Plus className="h-4 w-4" />,
        rota: '/eventos/reserva/novo'
      }}
      cardsResumo={[
        {
          titulo: 'Total de Reservas',
          valor: (_data, _pagination, summaryData) => summaryData?.totalReservas ?? 0,
          descricao: 'Total de reservas cadastradas',
          icone: Calendar,
          cor: 'bg-blue-500',
          tendencia: {
            valor: 15,
            label: 'vs mês anterior',
            tipo: 'positivo'
          }
        },
        {
          titulo: 'Reservas Confirmadas',
          valor: (_data, _pagination, summaryData) => {
            const confirmadas = summaryData?.confirmadas ?? 0;
            const total = summaryData?.totalReservas ?? 1;
            return `${Math.round((confirmadas / total) * 100)}%`;
          },
          descricao: 'Taxa de confirmação',
          icone: Clock,
          cor: 'bg-green-500',
          tendencia: {
            valor: 8,
            label: 'vs mês anterior',
            tipo: 'positivo'
          }
        },
        {
          titulo: 'Receita Total',
          valor: (_data, _pagination, summaryData) => {
            const receita = summaryData?.receitaTotal ?? 0;
            return `R$ ${receita.toFixed(2)}`;
          },
          descricao: 'Valor total das reservas',
          icone: MapPin,
          cor: 'bg-purple-500',
          tendencia: {
            valor: 25,
            label: 'vs mês anterior',
            tipo: 'positivo'
          }
        }
      ]}
    />
  );
};

export default Reservas;
