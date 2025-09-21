
import ModuleHeader from '@/components/ModuleHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { toast } from '@/hooks/use-toast';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Camera, CheckCircle, Edit, Shield, Star, Upload, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface UserGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getUsuarioById } = useUsuarios();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'ativo',
    userGroupId: '',
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Mock user groups
  const userGroups: UserGroup[] = [
    {
      id: '1',
      name: 'Administradores',
      description: 'Acesso total ao sistema',
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      permissions: ['Todas as permissões']
    },
    {
      id: '2',
      name: 'Gerentes',
      description: 'Acesso de gerenciamento',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      permissions: ['Bar', 'Eventos', 'Escolinha', 'Relatórios']
    },
    {
      id: '3',
      name: 'Funcionários Bar',
      description: 'Acesso ao módulo bar',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      permissions: ['Bar', 'Caixa']
    },
    {
      id: '4',
      name: 'Professores',
      description: 'Acesso ao módulo escolinha',
      color: 'bg-gradient-to-r from-purple-500 to-violet-500',
      permissions: ['Escolinha', 'Chamadas']
    }
  ];

  // Load user data on component mount
  useEffect(() => {
    if (id) {
      const carregarUsuario = async () => {
        try {
          const usuario = getUsuarioById(id);
          if (usuario) {
            setFormData({
              name: usuario.nome || '',
              email: usuario.email || '',
              status: usuario.situacao === 'Ativo' ? 'ativo' : 'inativo',
              userGroupId: usuario.grupoPermissaoId || '',
              avatar: usuario.foto || ''
            });
            setAvatarPreview(usuario.foto || '');
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar dados do usuário",
            variant: "destructive"
          });
        }
      };
      carregarUsuario();
    }
  }, [id, getUsuarioById]);

  const selectedGroup = userGroups.find(group => group.id === formData.userGroupId);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userGroupId) {
      toast({
        title: "Erro",
        description: "Selecione um grupo de usuários.",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating user:', formData);
    
    toast({
      title: "Usuário atualizado",
      description: "O usuário foi atualizado com sucesso.",
    });
    
    navigate('/configuracoes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <ModuleHeader
        title="Editar Usuário"
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
            Editar Usuário
          </h1>
          <p className="text-muted-foreground mt-2">
            Atualize as informações e permissões do usuário
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar and Basic Info */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                  <CardDescription>Atualize o perfil básico do usuário</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                      <AvatarImage src={avatarPreview} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-2xl">
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button type="button" variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Upload className="h-4 w-4" />
                      Alterar Foto
                    </Button>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground text-center">
                    PNG, JPG até 2MB<br />
                    Recomendado: 400x400px
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status" className="text-sm font-semibold">Status do Usuário</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="h-11 max-w-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Ativo
                          </div>
                        </SelectItem>
                        <SelectItem value="inativo">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Inativo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Grupo de Permissões</CardTitle>
                  <CardDescription>Atualize o nível de acesso do usuário no sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {userGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setFormData(prev => ({ ...prev, userGroupId: group.id }))}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      formData.userGroupId === group.id
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    {formData.userGroupId === group.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${group.color} flex items-center justify-center shadow-lg`}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {group.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedGroup && (
                <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary text-lg">Grupo Atual</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-4 h-4 rounded-full ${selectedGroup.color}`} />
                    <span className="font-semibold">{selectedGroup.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{selectedGroup.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.permissions.map((permission) => (
                      <Badge key={permission} variant="default" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
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

export default EditUser;
