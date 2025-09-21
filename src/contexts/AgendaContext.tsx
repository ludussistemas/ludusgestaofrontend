import { useAgenda } from '@/hooks/useAgenda';
import React, { createContext, useContext } from 'react';

const ContextoAgenda = createContext<ReturnType<typeof useAgenda> | null>(null);

export function ProvedorAgenda({ children }: { children: React.ReactNode }) {
  const agenda = useAgenda();
  return <ContextoAgenda.Provider value={agenda}>{children}</ContextoAgenda.Provider>;
}

export function useContextoAgenda() {
  const ctx = useContext(ContextoAgenda);
  if (!ctx) {
    throw new Error('useContextoAgenda deve ser usado dentro de <ProvedorAgenda>');
  }
  return ctx;
} 