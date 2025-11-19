import { useState, useEffect } from 'react';
import { HistoricoPratica, ExercicioPratica } from '../types/historico';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5010';

interface UseHistoricoReturn {
  exercicios: ExercicioPratica[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHistorico(): UseHistoricoReturn {
  const [exercicios, setExercicios] = useState<ExercicioPratica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorico = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/historico_de_pratica`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar histórico: ${response.statusText}`);
      }

      const data: HistoricoPratica = await response.json();
      
      // Ordenar por data mais recente primeiro
      const exerciciosOrdenados = [...data.exercicios].sort((a, b) => {
        return new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime();
      });

      setExercicios(exerciciosOrdenados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setExercicios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  return {
    exercicios,
    loading,
    error,
    refetch: fetchHistorico
  };
}
