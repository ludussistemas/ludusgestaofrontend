
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Building2, Calendar, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login realizado com sucesso!', {
          description: 'Bem-vindo ao sistema de gestão esportiva.',
        });
        navigate('/inicio');
      } else {
        toast.error('Erro no login', {
          description: result.message || 'Não foi possível realizar o login.',
        });
      }
    } catch (error) {
      toast.error('Erro no sistema', {
        description: 'Tente novamente em alguns minutos.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInternalSystemAccess = () => {
    navigate('/sistema-interno');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/90 dark:via-primary/80 dark:to-primary/70 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgb3BhY2l0eT0iMC4xIj4KPGZ0bGwgZD0iTTAgMEw0MCA0MEgwVjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+Cjwvc3ZnPgo=')] opacity-10"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
              Ludus<br />
              <span className="text-white/90 dark:text-white/95">Gestão</span>
            </h1>
            <p className="text-xl text-white/90 dark:text-white/95 mb-8 max-w-md drop-shadow-md">
              Sistema completo de gestão esportiva e administrativa
            </p>
          </div>

          <div className="space-y-4 text-white/80 dark:text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/80 dark:bg-white/90 rounded-full shadow-sm"></div>
              <span className="drop-shadow-sm">Gestão de eventos e reservas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/80 dark:bg-white/90 rounded-full shadow-sm"></div>
              <span className="drop-shadow-sm">Controle financeiro completo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/80 dark:bg-white/90 rounded-full shadow-sm"></div>
              <span className="drop-shadow-sm">Sistema de bar integrado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white/80 dark:bg-white/90 rounded-full shadow-sm"></div>
              <span className="drop-shadow-sm">Escola esportiva</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="p-2 bg-primary/80 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Ludus Gestão</h1>
            <p className="text-muted-foreground mt-2">Sistema de Gestão Esportiva</p>
          </div>

          <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-8">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-semibold">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-base">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-muted-foreground/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-12 border-muted-foreground/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar no Sistema'
                  )}
                </Button>
              </form>

              {/* Novo botão para Sistema Interno */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline"
                onClick={handleInternalSystemAccess}
                className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 font-medium text-base shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Acessar Sistema Interno
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Credenciais de teste</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-muted-foreground/10">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Use as credenciais abaixo para testar:</p>
                  <div className="space-y-1">
                    <p className="text-xs font-mono bg-background px-2 py-1 rounded border">
                      <strong>Email:</strong> admin@exemplo.com
                    </p>
                    <p className="text-xs font-mono bg-background px-2 py-1 rounded border">
                      <strong>Senha:</strong> 123456
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
