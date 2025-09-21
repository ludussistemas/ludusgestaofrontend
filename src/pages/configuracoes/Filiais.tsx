
import { Badge } from '@/components/ui/badge';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { usePermissoesUsuario } from '@/contexts/PermissoesUsuarioContext';
import { Listagem } from '@/core/components/listagem';
import { useFiliais } from '@/hooks/useFiliais';
import { Filial } from '@/types/filial';
import { Building, Calendar, DollarSign, MapPin, Phone, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Filiais = () => {
  const navigate = useNavigate();
  const filiaisHook = useFiliais();
  const { hasFiliaisAccess } = usePermissoesUsuario();

  const colunas = [
    {
      chave: 'nome',
      titulo: 'Nome',
      ordenavel: true,
      filtravel: true,
      tipoFiltro: 'select' as const,
      renderizar: (filial: Filial) => (
        <div>
          <div className="font-medium">{filial.nome}</div>
          <div className="text-sm text-muted-foreground">{filial.endereco}, {filial.cidade}</div>
        </div>
      ),
    },
    {
      chave: 'telefone',
      titulo: 'Telefone',
      renderizar: (filial: Filial) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{filial.telefone}</span>
        </div>
      ),
    },
    {
      chave: 'ativo',
      titulo: 'Status',
      ordenavel: true,
      filtravel: true,
      tipoFiltro: 'select' as const,
      renderizar: (filial: Filial) => (
        <Badge variant={filial.situacao === 'Ativo' ? 'default' : 'secondary'}>
          {filial.situacao}
        </Badge>
      ),
    },
    {
      chave: 'modulos',
      titulo: 'Módulos Ativos',
      renderizar: (filial: Filial) => (
        <div className="flex gap-1 flex-wrap">
          {filial.modulos?.eventos && <Badge variant="outline" className="text-xs">Eventos</Badge>}
          {filial.modulos?.bar && <Badge variant="outline" className="text-xs">Bar</Badge>}
          {filial.modulos?.escolinha && <Badge variant="outline" className="text-xs">Escolinha</Badge>}
          {filial.modulos?.financeiro && <Badge variant="outline" className="text-xs">Financeiro</Badge>}
        </div>
      ),
    },
  ];

  const acoes = hasFiliaisAccess() ? [
    {
      titulo: 'Editar',
      icone: <Settings className="h-4 w-4" />,
      onClick: (filial: Filial) => navigate(`/configuracoes/filiais/${filial.id}/editar`),
      variante: 'outline' as const,
    },
  ] : [];

  const cardsResumo = [
    {
      titulo: 'Total de Filiais',
      valor: (data: Filial[] = []) => Array.isArray(data) ? data.length : 0,
      icone: Building,
      cor: 'bg-blue-500',
    },
    {
      titulo: 'Filiais Ativas',
      valor: (data: Filial[] = []) => Array.isArray(data) ? data.filter(f => f.situacao === 'Ativo').length : 0,
      icone: MapPin,
      cor: 'bg-green-500',
    },
    {
      titulo: 'Com Módulo Eventos',
      valor: (data: Filial[] = []) => Array.isArray(data) ? data.filter(f => f.modulos?.eventos).length : 0,
      icone: Calendar,
      cor: 'bg-purple-500',
    },
    {
      titulo: 'Com Módulo Financeiro',
      valor: (data: Filial[] = []) => Array.isArray(data) ? data.filter(f => f.modulos?.financeiro).length : 0,
      icone: DollarSign,
      cor: 'bg-orange-500',
    },
  ];

  return (
    <Listagem<Filial>
      titulo="Filiais"
      descricao="Gerencie as filiais da sua empresa"
      icone={<MapPin className="h-6 w-6" />}
      corModulo={MODULE_COLORS.settings}
      nomeEntidade="Filial"
      nomeEntidadePlural="Filiais"
      rotaEntidade="/configuracoes/filiais"
      rotaResumo="/configuracoes"
      hook={filiaisHook}
      colunas={colunas}
      acoes={acoes}
      botaoCriar={hasFiliaisAccess() ? {
        titulo: "Nova Filial",
        icone: <Plus className="h-4 w-4" />,
        rota: "/configuracoes/filiais/nova"
      } : undefined}
      cardsResumo={cardsResumo}
      mostrarExportar={true}
      nomeArquivoExportar="filiais"
      ordenacaoPadrao="nome"
      tamanhoPaginaPadrao={20}
      camposBusca={['nome', 'endereco', 'cidade']}
      placeholderBusca="Buscar filial..."
    />
  );
};

export default Filiais;
