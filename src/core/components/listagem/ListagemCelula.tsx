import { getSituacaoConfig } from '@/utils/enumUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, DollarSign, Hash, IdCard, Mail, Percent, Phone } from 'lucide-react';
import { TipoColuna } from './ListagemContext';

interface PropsCelula<T> {
  item: T;
  chave: string;
  tipo?: TipoColuna;
  opcoesSituacao?: Record<string | number, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }>;
  mapeamentoValores?: Record<string | number, string | number>;
  tipoEntidade?: 'recebivel' | 'cliente' | 'local' | 'reserva';
  cortarTextoComQuantCaracteres?: number; // Propriedade para controlar truncamento
  centralizar?: boolean; // Propriedade para controlar centralização
}

// Função auxiliar para renderizar texto com truncamento e tooltip
function TextoComTooltip({ texto, maxLength = 30 }: { texto: string; maxLength?: number }) {
  if (!texto || texto.length <= maxLength) {
    return <span>{texto || '-'}</span>;
  }

  const textoTruncado = texto.substring(0, maxLength) + '...';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{textoTruncado}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="whitespace-pre-wrap break-words">{texto}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ListagemCelula<T>({ item, chave, tipo, opcoesSituacao, mapeamentoValores, tipoEntidade, cortarTextoComQuantCaracteres, centralizar = true }: PropsCelula<T>) {
  let valor = (item as any)[chave];
  
  // Aplicar mapeamento de valores se existir
  if (mapeamentoValores && valor !== undefined && valor !== null) {
    valor = mapeamentoValores[valor] ?? valor;
  }
  
  if (!tipo) {
    return <span>{valor || '-'}</span>;
  }

  const formatarData = (data: any): string => {
    if (!data) return '-';
    try {
      const d = new Date(data);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatarHora = (hora: any): string => {
    if (!hora) return '-';
    try {
      const d = new Date(`2000-01-01T${hora}`);
      if (isNaN(d.getTime())) return hora;
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return hora;
    }
  };

  const formatarDataHora = (dataHora: any): string => {
    if (!dataHora) return '-';
    try {
      const d = new Date(dataHora);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatarValor = (valor: any): string => {
    if (valor === null || valor === undefined) return '-';
    const num = parseFloat(valor);
    if (isNaN(num)) return valor;
    return `R$ ${num.toFixed(2)}`;
  };

  const formatarNumero = (numero: any): string => {
    if (numero === null || numero === undefined) return '-';
    const num = parseFloat(numero);
    if (isNaN(num)) return numero;
    return num.toLocaleString('pt-BR');
  };

  const formatarPercentual = (percentual: any): string => {
    if (percentual === null || percentual === undefined) return '-';
    const num = parseFloat(percentual);
    if (isNaN(num)) return percentual;
    return `${num.toFixed(1)}%`;
  };

  const formatarTelefone = (telefone: any): string => {
    if (!telefone) return '-';
    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
  };

  const formatarDocumento = (documento: any): string => {
    if (!documento) return '-';
    // Remove tudo que não é número
    const numeros = documento.replace(/\D/g, '');
    if (numeros.length === 11) {
      // CPF
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    } else if (numeros.length === 14) {
      // CNPJ
      return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
    }
    return documento;
  };

  const renderizarSituacao = (situacao: any) => {
    if (!situacao) return '-';
    
    let config;
    
    // Se tem tipoEntidade, usar configuração automática
    if (tipoEntidade) {
      const situacaoConfig = getSituacaoConfig(tipoEntidade);
      config = situacaoConfig[situacao];
    }
    
    // Se não encontrou configuração automática, usar opcoesSituacao manual
    if (!config) {
      config = opcoesSituacao?.[situacao] || { label: situacao, variant: 'default' as const };
    }
    
    const variantClasses = {
      default: 'bg-green-100 text-green-800',
      destructive: 'bg-red-100 text-red-800',
      secondary: 'bg-gray-100 text-gray-800',
      outline: 'bg-blue-100 text-blue-800'
    };

    const maxLength = cortarTextoComQuantCaracteres || 12;
    const label = config.label.length > maxLength 
      ? config.label.substring(0, maxLength) + '...' 
      : config.label;

    return (
      <div className={centralizar ? "flex justify-center" : ""}>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[config.variant]}`}>
          {label}
        </span>
      </div>
    );
  };

  const renderizarBadge = (valor: any) => {
    if (!valor) return '-';
    return (
      <div className={centralizar ? "flex justify-center" : ""}>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {valor}
        </span>
      </div>
    );
  };

  switch (tipo) {
    case 'email':
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <TextoComTooltip texto={valor || ''} maxLength={cortarTextoComQuantCaracteres || 25} />
        </div>
      );

    case 'telefone':
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <TextoComTooltip texto={formatarTelefone(valor)} maxLength={cortarTextoComQuantCaracteres || 15} />
        </div>
      );

    case 'documento':
      return (
        <div className="flex items-center gap-2">
          <IdCard className="h-4 w-4 text-muted-foreground" />
          <TextoComTooltip texto={formatarDocumento(valor)} maxLength={cortarTextoComQuantCaracteres || 15} />
        </div>
      );

    case 'data':
      return (
        <div className={`flex items-center gap-2 ${centralizar ? 'justify-center' : ''}`}>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <TextoComTooltip texto={formatarData(valor)} maxLength={cortarTextoComQuantCaracteres || 12} />
        </div>
      );

    case 'hora':
      return (
        <div className={`flex items-center gap-2 ${centralizar ? 'justify-center' : ''}`}>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <TextoComTooltip texto={formatarHora(valor)} maxLength={cortarTextoComQuantCaracteres || 8} />
        </div>
      );

    case 'datahora':
      return (
        <div className={`flex items-center gap-2 ${centralizar ? 'justify-center' : ''}`}>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <TextoComTooltip texto={formatarDataHora(valor)} maxLength={cortarTextoComQuantCaracteres || 16} />
        </div>
      );

    case 'valor':
      return (
        <div className={`flex items-center gap-2 ${centralizar ? 'justify-center' : ''}`}>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{formatarValor(valor)}</span>
        </div>
      );

    case 'numero':
      return (
        <div className={`flex items-center gap-2 ${centralizar ? 'justify-center' : ''}`}>
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span>{formatarNumero(valor)}</span>
        </div>
      );

    case 'percentual':
      return (
        <div className={`flex items-center gap-2 ${centralizar ? 'justify-center' : ''}`}>
          <Percent className="h-4 w-4 text-muted-foreground" />
          <span>{formatarPercentual(valor)}</span>
        </div>
      );

    case 'situacao':
      return renderizarSituacao(valor);

    case 'badge':
      return renderizarBadge(valor);

    case 'cor':
      return (
        <div className="flex items-center justify-center">
          <div 
            className="w-8 h-5 border rounded-md" 
            style={{ backgroundColor: valor || '#3b82f6' }}
          />
        </div>
      );

    case 'texto':
    default:
      return <TextoComTooltip texto={valor || ''} maxLength={cortarTextoComQuantCaracteres || 30} />;
  }
} 