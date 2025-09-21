
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { PermissoesUsuarioProvider } from './contexts/PermissoesUsuarioContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <AuthProvider>
        <PermissoesUsuarioProvider>
          <App />
        </PermissoesUsuarioProvider>
      </AuthProvider>
    </ThemeProvider>
);
