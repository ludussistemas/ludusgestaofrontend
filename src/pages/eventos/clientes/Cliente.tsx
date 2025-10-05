
import BaseFormPage from '@/components/BaseFormPage';
import { TourStep } from '@/components/PageTour';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MODULE_COLORS } from '@/constants/moduleColors';
import CampoDocumento from '@/core/components/CampoDocumento';
import CampoEmail from '@/core/components/CampoEmail';
import CampoTelefone from '@/core/components/CampoTelefone';
import { useClientes } from '@/hooks/useClientes';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { SituacaoCliente } from '@/types/enums/situacao-cliente';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  tipoDocumento: 'cpf' | 'cnpj';
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  // status removido do formulário; definido via ações na lista
}

const Cliente = () => {
  const navigate = useNavigate();
  const { goBack } = useNavigationHistory();
  const { id } = useParams();
  const isEdit = !!id;

  const { getClienteById, getCliente, createCliente, updateCliente } = useClientes();

  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    email: '',
    telefone: '',
    documento: '',
    tipoDocumento: 'cpf',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });

  // Carregar dados do cliente se for edição
  useEffect(() => {
    if (isEdit && id) {
      const carregarCliente = async () => {
        try {
          const cliente = await getCliente(id);
          if (cliente) {
            setFormData({
              nome: cliente.nome || '',
              email: cliente.email || '',
              telefone: cliente.telefone || '',
              documento: cliente.documento || '',
              tipoDocumento: cliente.documento.includes('/') ? 'cnpj' : 'cpf',
              endereco: cliente.endereco || '',
              cidade: '',
              estado: '',
              cep: '',
              observacoes: cliente.observacoes || ''
            });
          }
        } catch (error) {
          console.error('Erro ao carregar cliente:', error);
          toast.error('Erro ao carregar dados do cliente');
        }
      };
      carregarCliente();
    }
  }, [isEdit, id, getCliente]);

  const tourSteps: TourStep[] = [
    {
      target: '[data-card="info-pessoais"]',
      title: 'Informações Pessoais',
      content: 'Preencha os dados pessoais do cliente.',
      placement: 'bottom'
    },
    {
      target: '#nome',
      title: 'Nome Completo',
      content: 'Digite o nome completo do cliente.',
      placement: 'bottom'
    },
    {
      target: '[data-card="contato"]',
      title: 'Dados de Contato',
      content: 'Informe email e telefone para contato.',
      placement: 'top'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.documento) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    const clienteData = {
      nome: formData.nome,
      documento: formData.documento,
      email: formData.email,
      telefone: formData.telefone,
      endereco: formData.endereco,
      observacoes: formData.observacoes,
      // Situação será alterada via ações na lista
    };

    if (isEdit && id) {
      updateCliente(id, clienteData);
    } else {
      createCliente(clienteData);
    }

    // Verificar se existe URL de retorno
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl && !isEdit) {
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl);
    } else {
      goBack();
    }
  };

  const handleChange = (field: keyof ClienteFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formSections = [
    {
      id: 'info-pessoais',
      title: 'Informações Pessoais',
      alwaysOpen: true,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: João Silva"
              required
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
              <Select value={formData.tipoDocumento} onValueChange={(value) => handleChange('tipoDocumento', value as 'cpf' | 'cnpj')}>
                <SelectTrigger id="tipoDocumento" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CampoDocumento
              id="documento"
              label={formData.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'}
              value={formData.documento}
              onChange={(value) => handleChange('documento', value)}
              tipo={formData.tipoDocumento}
              required
            />
          </div>
        </div>
      )
    },
    {
      id: 'contato',
      title: 'Dados de Contato',
      defaultOpen: false,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoEmail
            id="email"
            label="E-mail"
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            placeholder="cliente@email.com"
          />

          <CampoTelefone
            id="telefone"
            label="Telefone"
            value={formData.telefone}
            onChange={(value) => handleChange('telefone', value)}
          />
        </div>
      )
    },
    {
      id: 'endereco',
      title: 'Endereço',
      defaultOpen: false,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Ex: Rua das Flores, 123"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Ex: São Paulo"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                placeholder="Ex: SP"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                placeholder="12345-678"
                className="h-11"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'observacoes',
      title: 'Observações',
      defaultOpen: false,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre o cliente..."
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
      title={isEdit ? "Editar Cliente" : "Novo Cliente"}
      icon={<User className="h-6 w-6" />}
      moduleColor={MODULE_COLORS.events}
      
      
      formSections={formSections}
      onSubmit={handleSubmit}
      tourSteps={tourSteps}
      submitLabel={isEdit ? "Atualizar Cliente" : "Criar Cliente"}
      description={isEdit ? "Edite as informações do cliente existente." : "Preencha os campos para criar um novo cliente."}
    />
  );
};

export default Cliente;
