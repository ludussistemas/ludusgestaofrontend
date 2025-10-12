// ============================================================================
// ABSTRAÇÃO DA API - SISTEMA LUDUS GESTÃO
// ============================================================================

import { toast } from 'sonner';

// ============================================================================
// CONFIGURAÇÕES DA API
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7000/api';
/* const API_TIMEOUT = 10000; // 10 segundos */
const API_TIMEOUT = 60000; // 1 minuto

// ============================================================================
// TIPOS DE RESPOSTA DA API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiPagedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiPagedResponseV2<T> {
  success: boolean;
  message?: string;
  items: T[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// CLASSE PRINCIPAL DA API
// ============================================================================

class Api {
  private baseURL: string;
  private timeout: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private filialId: string | null = null;
  private showNotifications: boolean = true;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.loadTokens();
  }

  // ============================================================================
  // CONFIGURAÇÕES DE NOTIFICAÇÃO
  // ============================================================================

  setNotificationsEnabled(enabled: boolean) {
    this.showNotifications = enabled;
  }

  private showErrorNotification(error: ApiError, retryAction?: () => void) {
    if (!this.showNotifications) return;

    let message = error.message;
    let details = '';

    switch (error.status) {
      case 400:
        details = 'Dados inválidos fornecidos';
        break;
      case 401:
        message = 'Não autorizado. Faça login novamente.';
        break;
      case 403:
        message = 'Acesso negado. Você não tem permissão para esta ação.';
        break;
      case 404:
        message = 'Recurso não encontrado';
        break;
      case 408:
        message = 'Tempo limite excedido. A requisição demorou muito para responder.';
        break;
      case 409:
        message = 'Conflito. O recurso já existe ou está em uso.';
        break;
      case 422:
        message = 'Dados inválidos. Verifique as informações fornecidas.';
        break;
      case 500:
        message = 'Erro interno do servidor. Tente novamente mais tarde.';
        break;
      default:
        details = `Erro ${error.status}`;
    }

    const fullMessage = details ? `${message}\n${details}` : message;
    
    const toastOptions: any = {
      duration: 8000,
      action: {
        label: 'Fechar',
        onClick: () => toast.dismiss(),
      },
    };

    // Adicionar botão de retry para timeouts e erros de conexão
    if ((error.status === 408 || error.status === 0) && retryAction) {
      toastOptions.action = {
        label: 'Tentar Novamente',
        onClick: retryAction,
      };
    }
    
    toast.error(fullMessage, toastOptions);
  }

  private showSuccessNotification(message: string) {
    if (!this.showNotifications) return;
    
    toast.success(message, {
      duration: 4000,
    });
  }

  private showWarningNotification(message: string) {
    if (!this.showNotifications) return;
    
    toast.warning(message, {
      duration: 5000,
    });
  }

  // ============================================================================
  // MÉTODOS HTTP PRINCIPAIS
  // ============================================================================

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  // ============================================================================
  // MÉTODOS DE AUTENTICAÇÃO
  // ============================================================================

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.filialId = localStorage.getItem('filialId');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  setFilial(filialId: string) {
    this.filialId = filialId;
    localStorage.setItem('filialId', filialId);
  }

  getFilial(): string | null {
    return this.filialId;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.filialId = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('filialId');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Normalizar o endpoint removendo barras duplicadas
    const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove barras iniciais
    
    // Construir URL completa evitando barras duplicadas
    const fullUrl = this.baseURL.endsWith('/') 
      ? `${this.baseURL}${cleanEndpoint}`
      : `${this.baseURL}/${cleanEndpoint}`;
    
    const url = new URL(fullUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Adicionar headers obrigatórios automaticamente
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      // Header de autorização
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      // Header de filial (obrigatório conforme documentação)
      if (this.filialId) {
        headers['Filial'] = this.filialId;
      }

      options.headers = headers;

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        console.log('🔒 401 detectado na URL:', url);
        
        // NÃO tentar refresh se for o próprio endpoint de login ou refresh
        const isLoginEndpoint = url.includes('/autenticacao/entrar') || url.includes('/login');
        const isRefreshEndpoint = url.includes('/autenticacao/refresh') || url.includes('/auth/refresh');
        
        if (isLoginEndpoint || isRefreshEndpoint) {
          console.log('⚠️ Erro 401 no endpoint de autenticação, não tentar refresh');
          // Retornar o JSON do erro da API
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          }
          return {
            success: false,
            message: 'Credenciais inválidas',
            data: null
          } as any;
        }
        
        // Tentar refresh do token apenas se temos um refresh token
        if (!this.refreshToken) {
          console.log('⚠️ Sem refresh token disponível, redirecionando para login');
          this.handleUnauthorized();
          return {
            success: false,
            message: 'Sessão expirada. Faça login novamente.',
            data: null
          } as any;
        }
        
        console.log('🔄 Tentando refresh token...');
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          console.log('✅ Token renovado, reexecutando requisição...');
          // Reexecutar a requisição original com o novo token
          return this.request(url, options);
        } else {
          console.log('❌ Falha no refresh token, fazendo logout...');
          // Qualquer erro no refresh = logout automático
          this.handleUnauthorized();
          return {
            success: false,
            message: 'Sessão expirada. Faça login novamente.',
            data: null
          } as any;
        }
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        // Se não for ok, mas o backend retornou um JSON, repasse para o frontend tratar
        if (!response.ok) {
          return json;
        }
        return json;
      }

      // Se não for JSON, trate como texto
      if (!response.ok) {
        // Retorne um objeto de erro genérico
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          data: null
        } as any;
      }
      return (await response.text()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Detectar tipo de erro e mostrar notificação apropriada
      if (error && error.name === 'AbortError') {
        // Timeout da requisição
        const timeoutError: ApiError = {
          message: 'Tempo limite excedido. A requisição demorou muito para responder.',
          status: 408
        };
        
        // Mostrar notificação com botão de retry
        this.showErrorNotification(timeoutError, () => {
          // Retry da requisição
          return this.request(url, options);
        });
        
        // Retornar estrutura consistente
        return {
          success: false,
          message: timeoutError.message,
          data: null,
          timestamp: new Date().toISOString(),
          validationErrors: null
        } as T;
      }
      
      if (error && error.name === 'TypeError') {
        // Erro de rede/conexão
        const networkError: ApiError = {
          message: 'Erro de conexão. Verifique sua internet.',
          status: 0
        };
        
        // Mostrar notificação com botão de retry
        this.showErrorNotification(networkError, () => {
          // Retry da requisição
          return this.request(url, options);
        });
        
        // Retornar estrutura consistente
        return {
          success: false,
          message: networkError.message,
          data: null,
          timestamp: new Date().toISOString(),
          validationErrors: null
        } as T;
      }
      
      // Outros erros - retornar estrutura consistente
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Erro desconhecido ao processar requisição';
      
      return {
        success: false,
        message: errorMessage,
        data: null,
        timestamp: new Date().toISOString(),
        validationErrors: null
      } as T;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.log('❌ Nenhum refresh token disponível');
      return false;
    }

    try {
      console.log('🔄 Tentando renovar token...');
      // Usar o mesmo padrão do endpoint de login: autenticacao/
      const url = this.buildUrl('autenticacao/refresh');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      console.log('📡 Status da resposta do refresh:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Resposta do refresh:', data);
        
        if (data.success && data.data && data.data.accessToken && data.data.refreshToken) {
          this.setTokens(data.data.accessToken, data.data.refreshToken);
          console.log('✅ Token renovado com sucesso');
          return true;
        } else {
          console.error('❌ Resposta de refresh inválida:', data);
          return false;
        }
      } else {
        console.error('❌ Erro HTTP no refresh:', response.status, response.statusText);
        // Tentar ler a resposta de erro
        try {
          const errorData = await response.json();
          console.error('❌ Erro do servidor:', errorData);
        } catch (e) {
          console.error('❌ Não foi possível ler resposta de erro');
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      return false;
    }
  }

  private handleUnauthorized() {
    console.log('🚪 Fazendo logout automático por sessão expirada...');
    
    // Limpar tokens
    this.clearTokens();
    
    // Redirecionar para login apenas se não estiver já na página de login
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      console.log('🔄 Redirecionando para login...');
      
      // Mostrar notificação apenas se não estamos na página de login
      this.showWarningNotification('Sessão expirada. Faça login novamente.');
      
      // Usar setTimeout para garantir que o toast seja mostrado antes do redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    } else {
      console.log('⚠️ Já está na página de login, não redirecionar');
    }
  }

  private async handleError(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || `HTTP ${response.status}`,
        status: response.status,
        code: errorData.code,
        errors: errorData.errors
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }
  }

  private handleRequestError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Timeout da requisição',
        status: 408
      };
    }

    if (error instanceof TypeError) {
      return {
        message: 'Erro de rede',
        status: 0
      };
    }

    return {
      message: error.message || 'Erro desconhecido',
      status: 0
    };
  }

}

// ============================================================================
// INSTÂNCIA GLOBAL DA API
// ============================================================================

export const api = new Api();

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default api;
export { Api };


