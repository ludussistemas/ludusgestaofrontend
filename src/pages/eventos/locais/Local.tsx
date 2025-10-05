import BaseFormPage from '@/components/BaseFormPage';
import { TourStep } from '@/components/PageTour';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MODULE_COLORS } from '@/constants/moduleColors';
import { useLocais } from '@/hooks/useLocais';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { SituacaoLocal } from '@/types/enums/situacao-local';
import { TipoLocal } from '@/types/enums/tipo-local';
import type { Local } from '@/types/local';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface LocalFormData {
  nome: string;
  tipo: string;
  cor: string;
  valorHora: string;
  capacidade: string;
  descricao: string;
  comodidades: string[];
  intervalo: string;
  horaAbertura: string;
  horaFechamento: string;
}

const Local = () => {
  const { goBack } = useNavigationHistory();
  const { id } = useParams();
  const isEdit = !!id;

  const { getLocalById, getLocal, createLocal, updateLocal } = useLocais();

  const [formData, setFormData] = useState<LocalFormData>({
    nome: '',
    tipo: '',
    cor: '#10B981',
    valorHora: '',
    capacidade: '',
    descricao: '',
    comodidades: [],
    intervalo: '60',
    horaAbertura: '08:00',
    horaFechamento: '22:00'
  });

  // Carregar dados do local se for edição
  useEffect(() => {
    if (isEdit && id) {
      const carregarLocal = async () => {
        try {
          const local = await getLocal(id);
          if (local) {
            setFormData({
              nome: local.nome || '',
              tipo: local.tipo || '',
              cor: local.cor || '#10B981',
              valorHora: local.valorHora?.toString() || '',
              capacidade: local.capacidade?.toString() || '',
              descricao: local.descricao || '',
              comodidades: local.comodidades || [],
              intervalo: local.intervalo?.toString() || '60',
              horaAbertura: local.horaAbertura || '08:00',
              horaFechamento: local.horaFechamento || '22:00'
            });
          }
        } catch (error) {
          console.error('Erro ao carregar local:', error);
          toast.error('Erro ao carregar dados do local');
        }
      };
      carregarLocal();
    }
  }, [isEdit, id, getLocal]);

  const tourSteps: TourStep[] = [
    {
      target: '[data-card="info-basicas"]',
      title: 'Informações do Local',
      content: 'Preencha os dados básicos do local.',
      placement: 'bottom'
    },
    {
      target: '#nome',
      title: 'Nome do Local',
      content: 'Digite o nome identificador do local.',
      placement: 'bottom'
    },
    {
      target: '[data-card="configuracoes"]',
      title: 'Configurações',
      content: 'Configure horários e intervalos de reserva.',
      placement: 'top'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome do local é obrigatório');
      return;
    }

    if (!formData.tipo.trim()) {
      toast.error('Tipo do local é obrigatório');
      return;
    }

    try {
      const localData = {
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        cor: formData.cor,
        valorHora: parseFloat(formData.valorHora) || 0,
        capacidade: formData.capacidade ? parseInt(formData.capacidade) : 0,
        descricao: formData.descricao.trim(),
        comodidades: formData.comodidades,
        intervalo: parseInt(formData.intervalo) || 60,
        horaAbertura: formData.horaAbertura,
        horaFechamento: formData.horaFechamento
      };

      if (isEdit && id) {
        await updateLocal(id, localData);
        toast.success('Local atualizado com sucesso!');
      } else {
        await createLocal(localData);
        toast.success('Local criado com sucesso!');
      }

      goBack();
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      toast.error('Erro ao salvar local');
    }
  };

  const handleChange = (field: keyof LocalFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComodidadeChange = (comodidade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      comodidades: checked 
        ? [...prev.comodidades, comodidade]
        : prev.comodidades.filter(c => c !== comodidade)
    }));
  };

  const comodidadesDisponiveis = [
    'Ar condicionado',
    'Iluminação LED',
    'Piso profissional',
    'Vestiário',
    'Estacionamento',
    'Café/Água',
    'Wi-Fi',
    'Som ambiente',
    'Espelhos',
    'Barras de apoio'
  ];

  const tiposLocal = [
    'Quadra de Tênis',
    'Quadra de Futebol',
    'Quadra de Vôlei',
    'Quadra de Basquete',
    'Quadra Poliesportiva',
    'Campo de Futebol',
    'Piscina',
    'Academia',
    'Sala de Reunião',
    'Auditório',
    'Outro'
  ];

  const formSections = [
    {
      id: 'info-basicas',
      title: 'Informações Básicas',
      alwaysOpen: true,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Local</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Quadra Central"
              className="h-11"
              required
            />
          </div>


          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value)}
            >
              <SelectTrigger id="tipo" className="h-11">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposLocal.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor">Cor de Identificação</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={formData.cor}
                onChange={(e) => handleChange('cor', e.target.value)}
                className="w-16 h-11 p-1"
              />
              <Input
                value={formData.cor}
                onChange={(e) => handleChange('cor', e.target.value)}
                placeholder="#10B981"
                className="h-11"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'configuracoes',
      title: 'Configurações de Horário',
      defaultOpen: false,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaAbertura">Horário de Abertura</Label>
              <Input
                type="time"
                id="horaAbertura"
                value={formData.horaAbertura}
                onChange={(e) => handleChange('horaAbertura', e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFechamento">Horário de Fechamento</Label>
              <Input
                type="time"
                id="horaFechamento"
                value={formData.horaFechamento}
                onChange={(e) => handleChange('horaFechamento', e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervalo">Intervalo de Reserva</Label>
            <Select
              value={formData.intervalo}
              onValueChange={(value) => handleChange('intervalo', value)}
            >
              <SelectTrigger id="intervalo" className="h-11">
                <SelectValue placeholder="Selecione o intervalo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: 'financeiro',
      title: 'Informações Financeiras',
      defaultOpen: false,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="valorHora">Valor por Hora (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              id="valorHora"
              value={formData.valorHora}
              onChange={(e) => handleChange('valorHora', e.target.value)}
              placeholder="0,00"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade Máxima</Label>
            <Input
              type="number"
              min="1"
              id="capacidade"
              value={formData.capacidade}
              onChange={(e) => handleChange('capacidade', e.target.value)}
              placeholder="Ex: 20"
              className="h-11"
            />
          </div>
        </div>
      )
    },
    {
      id: 'comodidades',
      title: 'Comodidades',
      defaultOpen: false,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {comodidadesDisponiveis.map((comodidade) => (
              <div key={comodidade} className="flex items-center space-x-2">
                <Checkbox
                  id={comodidade}
                  checked={formData.comodidades.includes(comodidade)}
                  onCheckedChange={(checked) => 
                    handleComodidadeChange(comodidade, checked as boolean)
                  }
                />
                <Label htmlFor={comodidade} className="text-sm">
                  {comodidade}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'adicionais',
      title: 'Informações Adicionais',
      defaultOpen: false,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva o local, suas características e regras de uso..."
              rows={4}
            />
          </div>

          {null}
        </div>
      )
    }
  ];

  return (
    <BaseFormPage
      title={isEdit ? "Editar Local" : "Novo Local"}
      icon={<MapPin className="h-6 w-6" />}
      moduleColor={MODULE_COLORS.events}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Atualizar Local" : "Criar Local"}
      description={isEdit ? "Edite as informações do local existente." : "Preencha os campos para criar um novo local."}
    >
      <div className="space-y-6">
        {formSections.map((section) => (
          <Card key={section.id} data-card={section.id} className="border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </BaseFormPage>
  );
};

export default Local;