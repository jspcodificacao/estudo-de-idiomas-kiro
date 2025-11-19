import { useState, useEffect } from 'react';
import { ColecaoPrompts, Prompt } from '../types/prompts';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5010';

interface UsePromptsReturn {
  colecao: ColecaoPrompts | null;
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  salvarPrompts: (novosPrompts: Prompt[]) => Promise<boolean>;
}

export function usePrompts(): UsePromptsReturn {
  const [colecao, setColecao] = useState<ColecaoPrompts | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/prompts`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar prompts: ${response.statusText}`);
      }

      const data: ColecaoPrompts = await response.json();
      setColecao(data);
      setPrompts(data.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setColecao(null);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const salvarPrompts = async (novosPrompts: Prompt[]): Promise<boolean> => {
    if (!colecao) return false;

    try {
      const novaColecao: ColecaoPrompts = {
        ...colecao,
        prompts: novosPrompts,
        data_atualizacao: new Date().toISOString()
      };

      // TODO: Implementar endpoint PUT/POST no backend
      // Por enquanto, apenas atualiza localmente
      setColecao(novaColecao);
      setPrompts(novosPrompts);
      
      console.log('Prompts atualizados (local):', novaColecao);
      return true;
    } catch (err) {
      console.error('Erro ao salvar prompts:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  return {
    colecao,
    prompts,
    loading,
    error,
    refetch: fetchPrompts,
    salvarPrompts
  };
}
