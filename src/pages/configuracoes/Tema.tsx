
import ModuleHeader from '@/components/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Palette, Save, Upload } from 'lucide-react';
import { useState } from 'react';

const Tema = () => {
  const { filialAtual } = useAuth();
  const [temaData, setTemaData] = useState({
    corPrimaria: '#3b82f6',
    corSecundaria: '#64748b',
    logo: '',
    imagemFundo: '',
    fonte: 'Inter',
    modoEscuro: false,
    bordaArredondada: 'medium'
  });

  const handleSave = () => {
    console.log('Salvando tema:', temaData);
    // Aqui faria a chamada para a API
  };

  const coresPrimarias = [
    { value: '#3b82f6', label: 'Azul', color: '#3b82f6' },
    { value: '#ef4444', label: 'Vermelho', color: '#ef4444' },
    { value: '#10b981', label: 'Verde', color: '#10b981' },
    { value: '#f59e0b', label: 'Laranja', color: '#f59e0b' },
    { value: '#8b5cf6', label: 'Roxo', color: '#8b5cf6' },
    { value: '#ec4899', label: 'Rosa', color: '#ec4899' },
  ];

  const fontes = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins'
  ];

  return (
    <div className="min-h-screen bg-background">
      <ModuleHeader
        title="Personalização Visual"
        icon={<Palette className="h-6 w-6" />}
        moduleColor={MODULE_COLORS.settings}
        mustReturn={true}
        backTo="/configuracoes"
        backLabel="Configurações"
      />

      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Personalização Visual</h2>
            <p className="text-muted-foreground">
              Customize a aparência do sistema conforme a identidade da sua empresa
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configurações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cores do Sistema</CardTitle>
                <CardDescription>
                  Defina as cores principais da interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Cor Primária</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {coresPrimarias.map((cor) => (
                      <button
                        key={cor.value}
                        onClick={() => setTemaData({...temaData, corPrimaria: cor.value})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          temaData.corPrimaria === cor.value
                            ? 'border-foreground shadow-md'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded"
                          style={{ backgroundColor: cor.color }}
                        />
                        <p className="text-xs mt-2 font-medium">{cor.label}</p>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cor-customizada">Cor Personalizada</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cor-customizada"
                        type="color"
                        value={temaData.corPrimaria}
                        onChange={(e) => setTemaData({...temaData, corPrimaria: e.target.value})}
                        className="w-16 h-11 p-1"
                      />
                      <Input
                        value={temaData.corPrimaria}
                        onChange={(e) => setTemaData({...temaData, corPrimaria: e.target.value})}
                        placeholder="#3b82f6"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor-secundaria">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor-secundaria"
                      type="color"
                      value={temaData.corSecundaria}
                      onChange={(e) => setTemaData({...temaData, corSecundaria: e.target.value})}
                      className="w-16 h-11 p-1"
                    />
                    <Input
                      value={temaData.corSecundaria}
                      onChange={(e) => setTemaData({...temaData, corSecundaria: e.target.value})}
                      placeholder="#64748b"
                      className="h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipografia</CardTitle>
                <CardDescription>
                  Escolha a fonte do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fonte">Fonte do Sistema</Label>
                  <Select value={temaData.fonte} onValueChange={(value) => setTemaData({...temaData, fonte: value})}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontes.map((fonte) => (
                        <SelectItem key={fonte} value={fonte} style={{ fontFamily: fonte }}>
                          {fonte}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>
                  Personalize com a marca da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo da Empresa</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Arraste uma imagem ou clique para selecionar
                      </p>
                      <Button variant="outline" size="sm">
                        Selecionar Arquivo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imagem-fundo">Imagem de Fundo (Dashboard)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Arraste uma imagem ou clique para selecionar
                      </p>
                      <Button variant="outline" size="sm">
                        Selecionar Arquivo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Resolução recomendada: 1920x1080px. Formatos: PNG, JPG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <CardTitle>Preview em Tempo Real</CardTitle>
                </div>
                <CardDescription>
                  Veja como ficará a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  {/* Header Preview */}
                  <div 
                    className="h-16 flex items-center px-4 text-white"
                    style={{ backgroundColor: temaData.corPrimaria }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Palette className="h-4 w-4" />
                      </div>
                      <span 
                        className="font-semibold"
                        style={{ fontFamily: temaData.fonte }}
                      >
                        {filialAtual?.nome || 'Arena Sports Club'}
                      </span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-4 bg-background">
                    <h3 
                      className="text-lg font-semibold mb-3"
                      style={{ fontFamily: temaData.fonte }}
                    >
                      Dashboard
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="border rounded-lg p-3">
                        <h4 
                          className="font-medium text-sm mb-2"
                          style={{ 
                            fontFamily: temaData.fonte,
                            color: temaData.corPrimaria 
                          }}
                        >
                          Reservas Hoje
                        </h4>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 
                          className="font-medium text-sm mb-2"
                          style={{ 
                            fontFamily: temaData.fonte,
                            color: temaData.corPrimaria 
                          }}
                        >
                          Receita
                        </h4>
                        <p className="text-2xl font-bold">R$ 2.450</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full mb-3"
                      style={{ 
                        backgroundColor: temaData.corPrimaria,
                        fontFamily: temaData.fonte
                      }}
                    >
                      Botão Primário
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      style={{ 
                        borderColor: temaData.corPrimaria,
                        color: temaData.corPrimaria,
                        fontFamily: temaData.fonte
                      }}
                    >
                      Botão Secundário
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Aplicadas</CardTitle>
                <CardDescription>
                  Resumo das personalizações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cor Primária:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: temaData.corPrimaria }}
                    />
                    <span className="text-sm font-mono">{temaData.corPrimaria}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cor Secundária:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: temaData.corSecundaria }}
                    />
                    <span className="text-sm font-mono">{temaData.corSecundaria}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fonte:</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ fontFamily: temaData.fonte }}
                  >
                    {temaData.fonte}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tema;
