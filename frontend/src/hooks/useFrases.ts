import { useState, useEffect } from 'react';
import { FrasesDialogo } from '../types/frases';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5010';

interface UseFrasesReturn {
  frases: FrasesDialogo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  salvarFrases: (novasFrases: FrasesDialogo) => Promise<boolean>;
}

export function useFrases(): UseFrasesReturn {
  const [frases, setFrases] = useState<FrasesDialogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFrases = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/frases_do_dialogo`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar frases: ${response.statusText}`);
      }

      const data: FrasesDialogo = await response.json();
      setFrases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setFrases(null);
    } finally {
      setLoading(false);
    }
  };

  const salvarFrases = async (novasFrases: FrasesDialogo): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/frases_do_dialogo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novasFrases)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erro ao salvar: ${response.statusText}`);
      }

      const frasesAtualizadas: FrasesDialogo = await response.json();
      setFrases(frasesAtualizadas);
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar frases:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar frases');
      return false;
    }
  };

  useEffect(() => {
    fetchFrases();
  }, []);

  return {
    frases,
    loading,
    error,
    refetch: fetchFrases,
    salvarFrases
  };
}
