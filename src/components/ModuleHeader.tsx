
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { ArrowLeft, LogOut, Search, Settings, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickSearch from './QuickSearch';

interface ModuleHeaderProps {
  title: string;
  icon: React.ReactNode;
  moduleColor: string;
  mustReturn?: boolean;
  backTo?: string; // Mantido para compatibilidade, mas não será usado
  backLabel?: string;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  icon,
  moduleColor,
  mustReturn = true,
  backTo, // Não será usado, mas mantido para compatibilidade
  backLabel = 'Voltar'
}) => {
  const navigate = useNavigate();
  const { user, company, currentBranch, filialAtual } = useAuth();
  const { goBack } = useNavigationHistory();
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Verificar se é o inicio para usar cores diferentes
  const isInicio = moduleColor === 'hsl(var(--background))';
  const textColor = isInicio ? 'text-foreground' : 'text-white';
  const buttonHoverColor = isInicio ? 'hover:bg-foreground/10' : 'hover:bg-white/20';

  // Adicionar listener para o atalho F2
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        setIsQuickSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleBackClick = () => {
    goBack();
  };

  return (
    <>
      <header
        className="shadow-sm border-b"
        style={{ backgroundColor: moduleColor }}
      >
        <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {mustReturn && <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className={`gap-2 ${textColor} ${buttonHoverColor}`}
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
              }
              <div className="flex items-center gap-2">
                <div className={textColor}>
                  {icon}
                </div>
                <h1 className={`text-xl font-semibold ${textColor}`}>{title}</h1>
              </div>
            </div>

            {/* Company - Branch Info (Centered) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
              <div className="text-center">
                <p className={`text-sm font-medium ${textColor}`}>
                  {filialAtual?.nome || company?.name || 'Arena Sports Club'}
                  {currentBranch && (
                    <>
                      <span className={`mx-2 ${isInicio ? 'text-muted-foreground' : 'text-white/60'}`}>-</span>
                      {currentBranch.name}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              {/* Quick Search Button - Estilo conforme anexo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsQuickSearchOpen(true)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md
                  ${isInicio 
                    ? 'bg-muted/50 text-foreground hover:bg-muted/70 border border-border/30' 
                    : 'bg-black/10 text-white hover:bg-black/20 border border-white/20'
                  }
                  transition-all duration-200 min-w-[100px] h-8
                `}
                title="Busca Rápida (F2)"
              >
                <Search className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">Buscar</span>
                <kbd className={`
                  ml-auto text-xs px-1.5 py-0.5 rounded border
                  ${isInicio 
                    ? 'bg-background border-border/50 text-muted-foreground' 
                    : 'bg-white/10 border-white/20 text-white/70'
                  }
                  font-mono
                `}>
                  F2
                </kbd>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${textColor}`}>
                        {user?.name || 'Administrador'}
                      </p>
                      <p className={`text-xs ${isInicio ? 'text-muted-foreground' : 'text-white/80'}`}>
                        {user?.email || 'admin@exemplo.com'}
                      </p>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-foreground border border-border">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate(`/configuracoes/usuarios/${user?.id || '1'}/editar`)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Editar Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Drawer */}
      <QuickSearch 
        isOpen={isQuickSearchOpen} 
        onClose={() => setIsQuickSearchOpen(false)} 
      />
    </>
  );
};

export default ModuleHeader;
