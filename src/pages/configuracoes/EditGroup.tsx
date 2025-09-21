
import ModuleHeader from '@/components/ModuleHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { toast } from '@/hooks/use-toast';
import { useGruposPermissoes } from '@/hooks/useGruposPermissoes';
import { BarChart3, CheckCircle, Edit, Palette, Settings, Shield, Star, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getGrupoById } = useGruposPermissoes();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    permissions: [] as string[]
  });

  const colorOptions = [
    { value: 'bg-gradient-to-r from-red-500 to-pink-500', label: 'Vermelho', preview: 'from-red-500 to-pink-500' },
    { value: 'bg-gradient-to-r from-blue-500 to-cyan-500', label: 'Azul', preview: 'from-blue-500 to-cyan-500' },
    { value: 'bg-gradient-to-r from-green-500 to-emerald-500', label: 'Verde', preview: 'from-green-500 to-emerald-500' },
    { value: 'bg-gradient-to-r from-purple-500 to-violet-500', label: 'Roxo', preview: 'from-purple-500 to-violet-500' },
    { value: 'bg-gradient-to-r from-yellow-500 to-orange-500', label: 'Amarelo', preview: 'from-yellow-500 to-orange-500' },
    { value: 'bg-gradient-to-r from-orange-500 to-red-500', label: 'Laranja', preview: 'from-orange-500 to-red-500' },
    { value: 'bg-gradient-to-r from-pink-500 to-purple-500', label: 'Rosa', preview: 'from-pink-500 to-purple-500' },
    { value: 'bg-gradient-to-r from-gray-500 to-slate-500', label: 'Cinza', preview: 'from-gray-500 to-slate-500' }
  ];

  // Simplified permissions structure with icons
  const permissionModules = [
    {
      id: 'inicio',
      name: 'Inicio',
      description: 'Visualizar painel principal e estatísticas gerais',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      permissions: ['Visualizar Inicio', 'Estatísticas Gerais']
    },
    {
      id: 'bar',
      name: 'Bar',
      description: 'Módulo completo do bar e operações de venda',
      icon: <Users className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      permissions: ['Visualizar', 'Gerenciar Produtos', 'Operar Caixa', 'Gerenciar Comandas', 'Relatórios']
    },
    {
      id: 'events',
      name: 'Eventos',
      description: 'Gestão completa de eventos e reservas',
      icon: <Star className="h-5 w-5" />,
      color: 'from-purple-500 to-violet-500',
      permissions: ['Visualizar', 'Gerenciar Eventos', 'Gerenciar Locais', 'Gerenciar Clientes', 'Receber Pagamentos', 'Relatórios']
    },
    {
      id: 'school',
      name: 'Escolinha',
      description: 'Sistema de gestão escolar e chamadas',
      icon: <Users className="h-5 w-5" />,
      color: 'from-yellow-500 to-orange-500',
      permissions: ['Visualizar', 'Gerenciar Alunos', 'Gerenciar Professores', 'Gerenciar Turmas', 'Chamadas', 'Receber Pagamentos', 'Relatórios']
    },
    {
      id: 'financial',
      name: 'Financeiro',
      description: 'Controle financeiro e fluxo de caixa',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-500',
      permissions: ['Visualizar', 'Gerenciar Lançamentos', 'Contas a Pagar/Receber', 'Relatórios']
    },
    {
      id: 'settings',
      name: 'Configurações',
      description: 'Administração do sistema e usuários',
      icon: <Settings className="h-5 w-5" />,
      color: 'from-red-500 to-pink-500',
      permissions: ['Visualizar Configurações', 'Gerenciar Usuários', 'Editar Configurações']
    }
  ];

  // Load group data on component mount
  useEffect(() => {
    if (id) {
      const carregarGrupo = async () => {
        try {
          const grupo = getGrupoById(id);
          if (grupo) {
            setFormData({
              name: grupo.nome || '',
              description: grupo.descricao || '',
              color: grupo.cor || 'bg-gradient-to-r from-blue-500 to-cyan-500',
              permissions: grupo.permissoes?.map(p => p.id) || []
            });
          }
        } catch (error) {
          console.error('Erro ao carregar grupo:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar dados do grupo",
            variant: "destructive"
          });
        }
      };
      carregarGrupo();
    }
  }, [id, getGrupoById]);

  const handleModuleToggle = (moduleId: string) => {
    setFormData(prev => {
      const isSelected = prev.permissions.includes(moduleId);
      
      if (isSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== moduleId)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, moduleId]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.permissions.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um módulo para o grupo.",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating group:', formData);
    
    toast({
      title: "Grupo atualizado",
      description: "O grupo de permissões foi atualizado com sucesso.",
    });
    
    navigate('/configuracoes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <ModuleHeader
        title="Editar Grupo"
        icon={<Edit className="h-6 w-6" />}
        moduleColor={MODULE_COLORS.settings}
        mustReturn={true}
        backTo="/configuracoes"
        backLabel="Configurações"
      />

      <main className="container mx-auto p-6 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4">
            <Edit className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Editar Grupo
          </h1>
          <p className="text-muted-foreground mt-2">
            Atualize as configurações e permissões do grupo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Group Info */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Informações do Grupo</CardTitle>
                  <CardDescription>Atualize nome, descrição e visual do grupo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Nome do Grupo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Cor do Grupo</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`relative w-12 h-12 rounded-xl border-2 transition-all bg-gradient-to-r ${color.preview} ${
                            formData.color === color.value 
                              ? 'border-foreground scale-110 shadow-lg' 
                              : 'border-border hover:scale-105 hover:border-foreground/50'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          title={color.label}
                        >
                          {formData.color === color.value && (
                            <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border">
                    <Label className="text-sm font-semibold mb-3 block">Pré-visualização:</Label>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${formData.color} flex items-center justify-center shadow-lg`}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{formData.name || 'Nome do Grupo'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formData.description || 'Descrição do grupo...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Módulos e Permissões</CardTitle>
                  <CardDescription>Atualize quais módulos este grupo poderá acessar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionModules.map((module) => {
                  const isSelected = formData.permissions.includes(module.id);
                  
                  return (
                    <div
                      key={module.id}
                      className={`relative p-6 border-2 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-lg'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center shadow-lg text-white`}>
                          {module.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleModuleToggle(module.id)}
                            />
                            <h3 className="font-semibold text-lg">{module.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {module.permissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {formData.permissions.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-primary">
                      Módulos Ativos ({formData.permissions.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.permissions.map((moduleId) => {
                      const module = permissionModules.find(m => m.id === moduleId);
                      return (
                        <Badge key={moduleId} variant="default" className="text-sm px-3 py-1">
                          {module?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/configuracoes')}
              className="px-8"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditGroup;
