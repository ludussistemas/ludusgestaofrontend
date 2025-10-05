import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocais } from '@/hooks/useLocais';
import { cn } from '@/lib/utils';
import type { Local } from '@/types';
import { Search } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';

interface ListaLocaisAgendaProps {
  locaisSelecionados: string[];
  locais: Local[];
  todosLocais: Local[];
  eventCountByVenue?: Record<string, number>;
  aoAlternarLocal: (localId: string) => void;
  estaLocalSelecionado: (localId: string) => boolean;
  modoCompacto?: boolean;
  loading?: boolean; // nova prop
}

const ListaLocaisAgenda = memo(({
  locaisSelecionados,
  locais,
  todosLocais,
  eventCountByVenue = {},
  aoAlternarLocal,
  estaLocalSelecionado,
  modoCompacto = false,
  loading = false,
}: ListaLocaisAgendaProps) => {
  const [consulta, setConsulta] = useState('');
  const { locais: locaisFiltrados, loading: locaisLoading, fetchLocais } = useLocais();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce para buscar locais no servidor
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters = [];
      
      if (consulta.trim()) {
        filters.push({
          property: 'nome',
          operator: 'contains',
          value: consulta.trim()
        });
      }
      
      fetchLocais({ 
        search: filters.length > 0 ? JSON.stringify(filters) : undefined,
        limit: 50
      });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [consulta, fetchLocais]);

  // Buscar todos os locais na primeira renderização
  useEffect(() => {
    fetchLocais({ limit: 50 });
  }, [fetchLocais]);

  const todosSelecionados = locaisFiltrados.length > 0 && locaisFiltrados.every(local => estaLocalSelecionado(local.id));

  const handleAlternarTodos = () => {
    if (todosSelecionados) {
      locaisFiltrados.forEach(local => {
        if (estaLocalSelecionado(local.id)) aoAlternarLocal(local.id);
      });
    } else {
      locaisFiltrados.forEach(local => {
        if (!estaLocalSelecionado(local.id)) aoAlternarLocal(local.id);
      });
    }
  };

  // SKELETON
  if (loading || locaisLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full mb-2" />
        ))}
      </div>
    );
  }

  if (modoCompacto) {
    // Versão compacta (apenas ícones)
    return (
      <div className="flex flex-col items-center gap-3 py-4 transition-all duration-500 ease-in-out">
        <button
          type="button"
          title={todosSelecionados ? 'Desselecionar todos' : 'Selecionar todos'}
          onClick={handleAlternarTodos}
          className={cn(
            'w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/60 mb-1 bg-white',
            todosSelecionados ? 'ring-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100'
          )}
        />
        {locaisFiltrados.map((local) => {
          const selecionado = estaLocalSelecionado(local.id);
          return (
            <button
              key={local.id}
              type="button"
              title={local.nome}
              onClick={() => aoAlternarLocal(local.id)}
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/60 mb-1',
                selecionado ? 'ring-2 ring-primary scale-110' : 'opacity-60 hover:opacity-100'
              )}
              style={{ backgroundColor: local.cor }}
            />
          );
        })}
      </div>
    );
  }

  // Versão expandida (com busca e nomes)
  return (
    <div className="h-full flex flex-col transition-all duration-500 ease-in-out">
      <div className="flex-shrink-0">
        <div className="relative p-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar locais..."
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            className="pl-9 h-9 text-sm border-border/50 bg-muted/80 transition-all duration-500"
            disabled={loading || locaisLoading}
          />
        </div>
        {consulta.trim() && (
          <div className="px-2 pb-2 text-xs text-muted-foreground transition-all duration-500">
            {locaisFiltrados.length} locais encontrados
          </div>
        )}
      </div>
      
      {/* Botão Selecionar Todos - Fora da área de scroll */}
      <div className="flex-shrink-0 px-2 pb-2">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl shadow-sm transition-all duration-500 border border-gray-200 cursor-pointer bg-white',
            todosSelecionados ? 'ring-2 ring-primary/40' : 'hover:bg-accent/40',
            (loading || locaisLoading) && 'opacity-60 pointer-events-none'
          )}
          onClick={handleAlternarTodos}
        >
          <Checkbox
            checked={todosSelecionados}
            onCheckedChange={handleAlternarTodos}
            className="mr-2 flex-shrink-0 border-gray-300 bg-white"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            disabled={loading || locaisLoading}
          />
          <span className="font-medium text-sm truncate text-gray-700">
            {todosSelecionados ? 'Desselecionar todos' : 'Selecionar todos'}
          </span>
        </div>
      </div>
      
      {/* Lista de Locais com Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-2 space-y-2 pb-4">
          {loading || locaisLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mb-2" />
            ))
          ) : (
            locaisFiltrados.map((local) => {
              const selecionado = estaLocalSelecionado(local.id);
              return (
                <div
                  key={local.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-xl shadow-sm transition-all duration-500 border border-transparent cursor-pointer',
                    selecionado ? 'ring-2 ring-primary/40 bg-white/90' : 'hover:bg-accent/40 bg-white/80',
                    (loading || locaisLoading) && 'opacity-60 pointer-events-none'
                  )}
                  style={{ backgroundColor: local.cor }}
                  onClick={() => aoAlternarLocal(local.id)}
                >
                  <Checkbox
                    checked={selecionado}
                    onCheckedChange={() => aoAlternarLocal(local.id)}
                    className="mr-2 flex-shrink-0 border-white/60 bg-white/80 transition-all duration-500"
                    style={{ accentColor: local.cor }}
                    tabIndex={-1}
                    onClick={e => e.stopPropagation()}
                    disabled={loading || locaisLoading}
                  />
                  <span className="font-medium text-sm truncate transition-all duration-500" style={{ color: '#222' }}>{local.nome}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

ListaLocaisAgenda.displayName = 'ListaLocaisAgenda';

export default ListaLocaisAgenda; 