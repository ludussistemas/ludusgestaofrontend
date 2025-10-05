import ExportButton from '@/components/ExportButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Columns, Filter, Grid, List, Plus, Search, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useListagem } from './ListagemContext';

export function ListagemFiltros() {
  const navigate = useNavigate();
  const {
    config,
    termoBusca,
    filtros,
    filtrosAtivos,
    modoVisualizacao,
    visibilidadeColunas,
    dados,
    definirTermoBusca,
    definirFiltro,
    limparFiltros,
    definirModoVisualizacao,
    definirVisibilidadeColuna,
    resetarColunas,
  } = useListagem();
  
  // Preparar filtros disponíveis
  const filtrosDisponiveis = React.useMemo(() => {
    return config.colunas
      .filter(col => col.filtravel && col.tipoFiltro === 'select')
      .map(col => {
        const chaveColuna = String(col.chave);
        const valoresAtuais = filtros[chaveColuna] || [];
        
        // Gerar opções baseadas nos dados
        const valoresUnicos = Array.from(new Set(
          (Array.isArray(dados) ? dados : []).map(item => {
            const valor = item[chaveColuna as keyof typeof item];
            return valor !== undefined && valor !== null ? String(valor) : '';
          }).filter(Boolean)
        )).sort();
        
        const opcoes = valoresUnicos.map(valor => ({
          valor,
          titulo: valor,
          quantidade: (Array.isArray(dados) ? dados : []).filter(item => String(item[chaveColuna as keyof typeof item]) === valor).length
        }));
        
        return {
          id: chaveColuna,
          titulo: col.titulo,
          opcoes,
          valores: valoresAtuais
        };
      });
  }, [config.colunas, filtros, dados]);
  
  const handleCriar = () => {
    if (config.botaoCriar) {
      sessionStorage.setItem('returnUrl', window.location.pathname);
      navigate(config.botaoCriar.rota);
    }
  };
  
  const handleFiltroChange = (filtroId: string, valor: string, marcado: boolean) => {
    const filtro = filtrosDisponiveis.find(f => f.id === filtroId);
    if (filtro) {
      const novosValores = marcado 
        ? [...filtro.valores, valor]
        : filtro.valores.filter(v => v !== valor);
      definirFiltro(filtroId, novosValores);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Controles principais */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Lado esquerdo - Busca e Filtros */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={config.placeholderBusca || `Buscar ${config.nomeEntidadePlural.toLowerCase()}...`}
              value={termoBusca}
              onChange={(e) => definirTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros Avançados */}
          {filtrosDisponiveis.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {filtrosAtivos.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                      {filtrosAtivos.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none">Filtros Avançados</h4>
                    {filtrosAtivos.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={limparFiltros}
                        className="h-auto p-1 text-xs"
                      >
                        Limpar tudo
                      </Button>
                    )}
                  </div>
                  
                  {filtrosDisponiveis.map(filtro => (
                    <div key={filtro.id} className="space-y-2">
                      <Label className="text-sm font-medium">{filtro.titulo}</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {filtro.opcoes.map(opcao => (
                          <div key={opcao.valor} className="flex items-center justify-between space-x-2">
                            <div className="flex items-center space-x-2 flex-1">
                              <Checkbox
                                id={`${filtro.id}-${opcao.valor}`}
                                checked={filtro.valores.includes(opcao.valor)}
                                onCheckedChange={(checked) => 
                                  handleFiltroChange(filtro.id, opcao.valor, !!checked)
                                }
                              />
                              <Label 
                                htmlFor={`${filtro.id}-${opcao.valor}`}
                                className="text-sm font-normal cursor-pointer flex-1"
                              >
                                {opcao.titulo}
                              </Label>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {opcao.quantidade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Visibilidade de Colunas */}
          {modoVisualizacao === 'tabela' && config.colunas.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Columns className="h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background">
                <DropdownMenuLabel>Visibilidade das Colunas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                  {config.colunas.filter(coluna => coluna.podeOcultar !== false).map((coluna) => (
                    <DropdownMenuCheckboxItem
                      key={String(coluna.chave)}
                      checked={visibilidadeColunas[String(coluna.chave)] !== false}
                      onCheckedChange={(value) => definirVisibilidadeColuna(String(coluna.chave), !!value)}
                      onSelect={(e) => e.preventDefault()} // Previne fechamento do dropdown
                    >
                      {coluna.titulo}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onSelect={(e) => {
                    e.preventDefault();
                    resetarColunas();
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Resetar Colunas
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Lado direito - Ações e Visualização */}
        <div className="flex items-center gap-3">
          {/* Exportar */}
          {config.mostrarExportar && (
            <ExportButton 
              data={dados} 
              filename={config.nomeArquivoExportar || config.nomeEntidadePlural.toLowerCase()}
              title={config.nomeEntidadePlural}
            />
          )}
          
          {/* Botão Criar */}
          {config.botaoCriar && (
            <Button 
              onClick={handleCriar}
              className="gap-2"
            >
              {config.botaoCriar.icone || <Plus className="h-4 w-4" />}
              {config.botaoCriar.titulo}
            </Button>
          )}
          
          {/* Modo de Visualização */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={modoVisualizacao === 'tabela' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => definirModoVisualizacao('tabela')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={modoVisualizacao === 'grade' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => definirModoVisualizacao('grade')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros Ativos */}
      {(termoBusca || filtrosAtivos.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {termoBusca && (
            <Badge variant="secondary" className="gap-1">
              Busca: {termoBusca}
              <button
                onClick={() => definirTermoBusca('')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filtrosAtivos.map(filtro => (
            <Badge key={filtro.id} variant="secondary" className="gap-1">
              {filtro.titulo}
              <button
                onClick={() => {
                  const [filtroId] = filtro.id.split('-');
                  const filtroObj = filtrosDisponiveis.find(f => f.id === filtroId);
                  if (filtroObj) {
                    const novosValores = filtroObj.valores.filter(v => v !== filtro.valor);
                    definirFiltro(filtroId, novosValores);
                  }
                }}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(termoBusca || filtrosAtivos.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="h-auto px-2 py-1 text-xs"
            >
              Limpar tudo
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 