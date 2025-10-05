import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface UsuarioAgenda {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  situacao: number; // Mudou para number conforme API
  dataCriacao: string;
  dataAtualizacao: string | null;
  tenantId: number;
  cargo?: string; // Campo adicional da API
  empresaId?: string; // Campo adicional da API
  grupoPermissaoId?: string; // Campo adicional da API
  ultimoAcesso?: string; // Campo adicional da API
  foto: string | null; // Campo para foto do usuário (pode ser null)
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: UsuarioAgenda[];
  errors: any;
  timestamp?: string;
  validationErrors?: any;
}

export function useUsuariosAgenda() {
  const [usuarios, setUsuarios] = useState<UsuarioAgenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuariosAgenda = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/usuarios/com-permissao-agenda');
      const responseData = (response as any).data;
      
      // Verificar se a resposta é um array diretamente
      if (Array.isArray(responseData)) {
        setUsuarios(responseData);
      } else {
        throw new Error('Estrutura de resposta inesperada da API');
      }
    } catch (error: any) {
      let errorMessage = 'Erro ao carregar usuários com permissão de agenda';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar usuários automaticamente
  useEffect(() => {
    fetchUsuariosAgenda();
  }, [fetchUsuariosAgenda]);

  // Função para buscar usuário por ID
  const getUsuarioById = useCallback((id: string) => {
    return usuarios.find(usuario => usuario.id === id);
  }, [usuarios]);

  // Função para buscar usuário por email
  const getUsuarioByEmail = useCallback((email: string) => {
    return usuarios.find(usuario => usuario.email === email);
  }, [usuarios]);

  // Função para recarregar usuários
  const recarregar = useCallback(() => {
    fetchUsuariosAgenda();
  }, [fetchUsuariosAgenda]);

  return {
    usuarios,
    loading,
    error,
    getUsuarioById,
    getUsuarioByEmail,
    recarregar,
    fetchUsuariosAgenda
  };
}
