import { toast } from 'sonner';
import { api, ApiResponse } from '../lib/api';

export interface EnderecoCEP {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  numero: string;
}

export const useUtilitarios = () => {
  const buscarCEP = async (cep: string): Promise<EnderecoCEP | null> => {
    try {
      // Remover caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '');
      
      if (cepLimpo.length !== 8) {
        toast.error('CEP deve conter 8 dígitos');
        return null;
      }

      const response = await api.get<ApiResponse<EnderecoCEP>>(`/api/utilitarios/cep/${cepLimpo}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast.error(response.message || 'CEP não encontrado');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar CEP';
      toast.error(errorMessage);
      return null;
    }
  };

  const executarSeed = async (): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<any>>('utilitarios/seed');
      
      if (response.success) {
        toast.success('Dados base inseridos com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Erro ao inserir dados base');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao executar seed';
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    buscarCEP,
    executarSeed,
  };
};
