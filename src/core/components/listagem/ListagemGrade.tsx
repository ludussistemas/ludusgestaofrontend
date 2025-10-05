import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListagemCelula } from './ListagemCelula';
import { useListagem } from './ListagemContext';
import { ListagemPaginacao } from './ListagemPaginacao';

export function ListagemGrade() {
  const navigate = useNavigate();
  const {
    config,
    dados,
    paginacao,
    visibilidadeColunas,
    excluirItem,
  } = useListagem();
  
  // Garantir que dados seja um array
  const dadosSeguros = Array.isArray(dados) ? dados : [];
  
  // Colunas visíveis
  const colunasVisiveis = useMemo(() => {
    return config.colunas.filter(col => visibilidadeColunas[String(col.chave)] !== false);
  }, [config.colunas, visibilidadeColunas]);
  
  // Ações padrão
  const acoesComPadrao = useMemo(() => {
    const acoesDefault = [
      {
        titulo: 'Editar',
        onClick: (item: any) => navigate(`${config.rotaEntidade}/${item.id}`),
        variante: 'outline' as const,
        mostrar: undefined,
        icone: undefined,
        className: undefined,
      }
    ];
    
    return [...acoesDefault, ...(config.acoes || [])];
  }, [config.acoes, config.rotaEntidade, navigate]);
  
  // Handler para exclusão
  const handleDelete = async (item: any) => {
    if (confirm(`Tem certeza que deseja excluir este ${config.nomeEntidade.toLowerCase()}?`)) {
      await excluirItem(item);
    }
  };
  
  // Pegar colunas principais para o card
  const colunaTitulo = colunasVisiveis[0];
  const colunasSecundarias = colunasVisiveis.slice(1, 6); // Mostrar até 5 colunas adicionais
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {dadosSeguros.map((item: any) => (
            <Card
              key={item.id || JSON.stringify(item)}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                  {colunaTitulo && (
                    <ListagemCelula
                      item={item}
                      chave={String(colunaTitulo.chave)}
                      tipo={colunaTitulo.tipo}
                      opcoesSituacao={colunaTitulo.opcoesSituacao}
                      mapeamentoValores={colunaTitulo.mapeamentoValores}
                      tipoEntidade={colunaTitulo.tipoEntidade}
                      cortarTextoComQuantCaracteres={colunaTitulo.cortarTextoComQuantCaracteres}
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Informações principais em linhas individuais */}
                  {colunasSecundarias.filter(coluna => 
                    !coluna.chave.toString().includes('situacao') && 
                    !coluna.chave.toString().includes('dataCriacao')
                  ).map((coluna) => (
                    <div key={String(coluna.chave)} className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {coluna.titulo}
                      </span>
                      <div className="text-sm font-medium">
                        <ListagemCelula
                          item={item}
                          chave={String(coluna.chave)}
                          tipo={coluna.tipo}
                          opcoesSituacao={coluna.opcoesSituacao}
                          mapeamentoValores={coluna.mapeamentoValores}
                          tipoEntidade={coluna.tipoEntidade}
                          cortarTextoComQuantCaracteres={coluna.cortarTextoComQuantCaracteres}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Situação e Data de Cadastro na mesma linha */}
                  <div className="flex gap-4 pt-2">
                    {/* Situação */}
                    {colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao')) && (
                      <div className="flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                          {colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.titulo}
                        </span>
                        <div className="text-sm font-medium">
                          <ListagemCelula
                            item={item}
                            chave={String(colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.chave || '')}
                            tipo={colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.tipo}
                            opcoesSituacao={colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.opcoesSituacao}
                            mapeamentoValores={colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.mapeamentoValores}
                            tipoEntidade={colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.tipoEntidade}
                            cortarTextoComQuantCaracteres={colunasSecundarias.find(coluna => coluna.chave.toString().includes('situacao'))?.cortarTextoComQuantCaracteres}
                            centralizar={false}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Data de Cadastro */}
                    {colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao')) && (
                      <div className="flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                          {colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.titulo}
                        </span>
                        <div className="text-sm font-medium">
                          <ListagemCelula
                            item={item}
                            chave={String(colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.chave || '')}
                            tipo={colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.tipo}
                            opcoesSituacao={colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.opcoesSituacao}
                            mapeamentoValores={colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.mapeamentoValores}
                            tipoEntidade={colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.tipoEntidade}
                            cortarTextoComQuantCaracteres={colunasSecundarias.find(coluna => coluna.chave.toString().includes('dataCriacao'))?.cortarTextoComQuantCaracteres}
                            centralizar={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              {acoesComPadrao.length > 0 && (
                <CardFooter className="pt-4 border-t bg-muted/30">
                  <div className="flex gap-2 w-full">
                    {acoesComPadrao.map((acao, index) => {
                      if (acao.mostrar && !acao.mostrar(item)) {
                        return null;
                      }
                      
                      return (
                        <Button
                          key={index}
                          variant={acao.variante || 'outline'}
                          size="sm"
                          onClick={() => {
                            if (acao.titulo === 'Excluir') {
                              handleDelete(item);
                            } else {
                              acao.onClick(item);
                            }
                          }}
                          className={cn("flex-1 text-xs", acao.className)}
                        >
                          {acao.icone}
                          {acao.titulo}
                        </Button>
                      );
                    })}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
      
      {/* Paginação usando o novo componente */}
      {paginacao && (
        <div className="flex-shrink-0 mt-2 bg-background p-4">
          <ListagemPaginacao />
        </div>
      )}
    </div>
  );
} 