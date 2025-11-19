import { useState, useEffect } from 'react';
import { ConhecimentoIdioma } from '../types/conhecimento';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5010';

interface UseConhecimentoReturn {
  conhecimentos: ConhecimentoIdioma[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  salvarConhecimentos: (novosConhecimentos: ConhecimentoIdioma[]) => Promise<boolean>;
}

export function useConhecimento(): UseConhecimentoReturn {
  const [conhecimentos, setConhecimentos] = useState<ConhecimentoIdioma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConhecimentos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/base_de_conhecimento`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar conhecimentos: ${response.statusText}`);
      }

      const data: ConhecimentoIdioma[] = await response.json();
      setConhecimentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setConhecimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const salvarConhecimentos = async (novosConhecimentos: ConhecimentoIdioma[]): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/base_de_conhecimento`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novosConhecimentos)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro ao salvar: ${response.statusText}`);
      }

      const conhecimentosAtualizados: ConhecimentoIdioma[] = await response.json();
      setConhecimentos(conhecimentosAtualizados);
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar conhecimentos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar conhecimentos');
      return false;
    }
  };

  useEffect(() => {
    fetchConhecimentos();
  }, []);

  return {
    conhecimentos,
    loading,
    error,
    refetch: fetchConhecimentos,
    salvarConhecimentos
  };
}
