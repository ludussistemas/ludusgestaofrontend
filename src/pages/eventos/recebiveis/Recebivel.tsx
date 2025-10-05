
import BaseFormPage from '@/components/BaseFormPage';
import { TourStep } from '@/components/PageTour';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MODULE_COLORS } from '@/constants/moduleColors';
import CampoBusca from '@/core/components/CampoBusca';
import CampoValor from '@/core/components/CampoValor';
import SeletorData from '@/core/components/SeletorData';
import { useClientes } from '@/hooks/useClientes';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useRecebiveis } from '@/hooks/useRecebiveis';
import { CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SituacaoRecebivel } from '@/types/enums/situacao-recebivel';

interface RecebivelFormData {
  clienteId: string;
  descricao: string;
  valor: string;
  dataVencimento: Date | undefined;
  reservaId?: string;
}

const Recebivel = () => {
  const navigate = useNavigate();
  const { goBack } = useNavigationHistory();
  const { id } = useParams();
  const isEdit = !!id;

  const { getClienteById, clientes } = useClientes();
  const { getRecebivelById, getRecebivel, createRecebivel, updateRecebivel } = useRecebiveis();

  const [formData, setFormData] = useState<RecebivelFormData>({
    clienteId: '',
    descricao: '',
    valor: '',
    dataVencimento: new Date(),
    reservaId: ''
  });

  const [currentSituacao, setCurrentSituacao] = useState<SituacaoRecebivel>(SituacaoRecebivel.Aberto);

  // Carregar dados do recebível se for edição
  useEffect(() => {
    if (isEdit && id) {
      const carregarRecebivel = async () => {
        try {
          const recebivel = await getRecebivel(id);
          if (recebivel) {
            setFormData({
              clienteId: recebivel.clienteId,
              descricao: recebivel.descricao,
              valor: recebivel.valor.toString(),
              dataVencimento: new Date(recebivel.dataVencimento),
              reservaId: recebivel.reservaId || ''
            });
            setCurrentSituacao(recebivel.situacao);
          }
        } catch (error) {
          console.error('Erro ao carregar recebível:', error);
          toast.error('Erro ao carregar dados do recebível');
        }
      };
      carregarRecebivel();
    }
  }, [isEdit, id, getRecebivel]);

  // Dados usando hooks
  const clientesExemplo = clientes.map(cliente => ({
    id: cliente.id,
    label: cliente.nome,
    subtitle: cliente.email
  }));

  const tourSteps: TourStep[] = [
    {
      target: '[data-card="info-basicas"]',
      title: 'Informações do Recebível',
      content: 'Preencha os dados básicos do valor a receber.',
      placement: 'bottom'
    },
    {
      target: '#cliente',
      title: 'Cliente Devedor',
      content: 'Selecione o cliente que deve o valor.',
      placement: 'bottom'
    },
    {
      target: '[data-card="detalhes"]',
      title: 'Detalhes do Recebível',
      content: 'Configure valor, vencimento e observações.',
      placement: 'top'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.descricao || !formData.valor || !formData.dataVencimento) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      const recebivelData = {
        clienteId: formData.clienteId,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor) || 0,
        dataVencimento: formData.dataVencimento.toISOString().split('T')[0],
        situacao: isEdit ? currentSituacao : SituacaoRecebivel.Aberto,
        reservaId: formData.reservaId || null
      };

      if (isEdit && id) {
        await updateRecebivel(id, recebivelData);
      } else {
        await createRecebivel(recebivelData);
      }

      goBack();
    } catch (error) {
      console.error('Erro ao salvar recebível:', error);
      alert('Erro ao salvar recebível. Tente novamente.');
    }
  };

  const handleChange = (field: keyof RecebivelFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formSections = [
    {
      id: 'info-basicas',
      title: 'Informações do Recebível',
      alwaysOpen: true,
      content: (
        <div className="space-y-6">
          <CampoBusca
            id="cliente"
            label="Cliente"
            selectedId={formData.clienteId}
            onChange={(value, item) => handleChange('clienteId', item?.id || value)}
            items={clientesExemplo}
            placeholder="Selecione o cliente..."
            onLoadById={async (id) => getClienteById(id)}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição do recebível..."
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservaId">ID da Reserva (opcional)</Label>
            <Input
              id="reservaId"
              value={formData.reservaId || ''}
              onChange={(e) => handleChange('reservaId', e.target.value)}
              placeholder="ID da reserva relacionada..."
              className="h-11"
            />
          </div>
        </div>
      )
    },
    {
      id: 'detalhes',
      title: 'Detalhes',
      defaultOpen: false,
      content: (
        <div className="space-y-6">
          <CampoValor
            id="valor"
            label="Valor"
            value={formData.valor}
            onChange={(value) => handleChange('valor', value)}
            required
          />

          <SeletorData
            id="dataVencimento"
            label="Data de Vencimento"
            value={formData.dataVencimento}
            onChange={(date) => handleChange('dataVencimento', date)}
            required
          />

          {null}
        </div>
      )
    }
  ];

  return (
    <BaseFormPage
      title={isEdit ? "Editar Recebível" : "Novo Recebível"}
      icon={<CreditCard className="h-6 w-6" />}
      moduleColor={MODULE_COLORS.events}
      formSections={formSections}
      onSubmit={handleSubmit}
      tourSteps={tourSteps}
      submitLabel={isEdit ? "Atualizar Recebível" : "Criar Recebível"}
      description={isEdit ? "Edite as informações do recebível existente." : "Preencha os campos para criar um novo recebível."}
    />
  );
};

export default Recebivel;
