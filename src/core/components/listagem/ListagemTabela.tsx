import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { FileX, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { ListagemCabecalho } from './ListagemCabecalho';
import { ListagemCelula } from './ListagemCelula';
import { useListagem } from './ListagemContext';
import { ListagemGrade } from './ListagemGrade';
import { ListagemPaginacao } from './ListagemPaginacao';

// Componente de skeleton integrado
function TabelaSkeleton({ colunas, linhas = 10 }: { colunas: number; linhas?: number }) {
  return (
    <div className="w-full h-full overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex border-b bg-muted/50 p-2">
        {Array.from({ length: colunas }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton className="h-4 w-full max-w-[150px]" />
          </div>
        ))}
      </div>
      
      {/* Linhas */}
      <div className="divide-y">
        {Array.from({ length: linhas }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex p-2">
            {Array.from({ length: colunas }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-2">
                <Skeleton className="h-4 w-full max-w-[200px]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de estado vazio integrado
function EstadoVazio() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <FileX className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">
          Nenhum registro encontrado
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente ajustar os filtros ou adicione um novo registro.
        </p>
      </div>
    </div>
  );
}

export function ListagemTabela() {
  const navigate = useNavigate();
  const {
    config,
    dados,
    carregando,
    paginacao,
    modoVisualizacao,
    visibilidadeColunas,
    ordemColunas,
    campoOrdenacao,
    direcaoOrdenacao,
    definirOrdenacao,
    definirOrdemColunas,
    excluirItem,
  } = useListagem();
  
  // Garantir que dados seja um array
  const dadosSeguros = Array.isArray(dados) ? dados : [];
  
  // Sensores para drag and drop
  const sensores = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  
  // Colunas visíveis e ordenadas
  const colunasVisiveis = useMemo(() => {
    return ordemColunas
      .map(chave => config.colunas.find(col => String(col.chave) === chave))
      .filter(col => col && visibilidadeColunas[String(col.chave)] !== false) as typeof config.colunas;
  }, [config.colunas, ordemColunas, visibilidadeColunas]);
  
  // Ações padrão
  const acoesComPadrao = useMemo(() => {
    const acoesDefault = [
      {
        titulo: 'Editar',
        onClick: (item: any) => navigate(`${config.rotaEntidade}/${item.id}`),
        variante: 'outline' as const,
        mostrar: undefined,
        icone: <Pencil className="h-4 w-4 mr-1" />,
        className: undefined,
      }
    ];
    
    return [...acoesDefault, ...(config.acoes || [])];
  }, [config.acoes, config.rotaEntidade, navigate]);
  
  // Handler para fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      definirOrdemColunas(
        arrayMove(
          ordemColunas,
          ordemColunas.indexOf(active.id as string),
          ordemColunas.indexOf(over.id as string)
        )
      );
    }
  };
  
  // Handler para ordenação
  const handleSort = (campo: string) => {
    if (campo === campoOrdenacao) {
      definirOrdenacao(campo, direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
    } else {
      definirOrdenacao(campo, 'asc');
    }
  };
  
  // Handler para exclusão
  const handleDelete = async (item: any) => {
    if (confirm(`Tem certeza que deseja excluir este ${config.nomeEntidade.toLowerCase()}?`)) {
      await excluirItem(item);
    }
  };
  
  // Renderizar conteúdo baseado no estado
  if (carregando) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0 border border-border rounded-md bg-background">
          <TabelaSkeleton colunas={colunasVisiveis.length + (acoesComPadrao.length > 0 ? 1 : 0)} />
        </div>
      </div>
    );
  }
  
  if (dadosSeguros.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0 border border-border rounded-md bg-background">
          <EstadoVazio />
        </div>
      </div>
    );
  }
  
  // Renderizar grade se modo grade estiver ativo
  if (modoVisualizacao === 'grade') {
    return <ListagemGrade />;
  }
  
  // Renderizar tabela
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 border border-border rounded-md bg-background">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensores}
        >
          <div className="relative h-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-20 bg-background border-b shadow-sm [&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <SortableContext
                    items={ordemColunas}
                    strategy={horizontalListSortingStrategy}
                  >
                    {colunasVisiveis.map((coluna) => (
                      <ListagemCabecalho
                        key={String(coluna.chave)}
                        coluna={coluna}
                        ordenacao={{
                          campo: campoOrdenacao,
                          direcao: direcaoOrdenacao
                        }}
                        onSort={handleSort}
                      />
                    ))}
                  </SortableContext>
                  {acoesComPadrao.length > 0 && (
                    <th className="h-10 px-3 text-center align-middle font-medium text-muted-foreground w-16 bg-background">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {dadosSeguros.map((item: any) => (
                  <tr
                    key={item.id || JSON.stringify(item)}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {colunasVisiveis.map((coluna) => (
                      <td key={String(coluna.chave)} className="h-10 px-3 align-middle [&:has([role=checkbox])]:pr-0">
                        {coluna.renderizar ? (
                          coluna.renderizar(item)
                        ) : (
                          <ListagemCelula
                            item={item}
                            chave={String(coluna.chave)}
                            tipo={coluna.tipo}
                            opcoesSituacao={coluna.opcoesSituacao}
                            mapeamentoValores={coluna.mapeamentoValores}
                            tipoEntidade={coluna.tipoEntidade}
                            cortarTextoComQuantCaracteres={coluna.cortarTextoComQuantCaracteres}
                          />
                        )}
                      </td>
                    ))}
                    {acoesComPadrao.length > 0 && (
                      <td className="h-10 px-3 text-center align-middle [&:has([role=checkbox])]:pr-0 w-16">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {acoesComPadrao.map((acao, index) => {
                              if (acao.mostrar && !acao.mostrar(item)) {
                                return null;
                              }
                              
                              return (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={() => {
                                    if (acao.titulo === 'Excluir') {
                                      handleDelete(item);
                                    } else {
                                      acao.onClick(item);
                                    }
                                  }}
                                  className={cn("gap-2", acao.className)}
                                >
                                  {acao.icone}
                                  {acao.titulo}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DndContext>
      </div>
      
      {/* Paginação usando o novo componente */}
      {paginacao && (
        <div className="flex-shrink-0 mt-2 bg-background">
          <ListagemPaginacao />
        </div>
      )}

    </div>
  );
} 