import { useState, useMemo } from 'react';
import { useHistorico } from '../hooks/useHistorico';
import { 
  ExercicioPratica, 
  Idioma, 
  TipoPratica,
  ResultadoTraducao,
  ResultadoAudicao,
  ResultadoPronuncia,
  ResultadoDialogo,
  ResultadoPronunciaNumeros
} from '../types/historico';

interface NavegadorHistoricoProps {
  onVoltar: () => void;
}

export function NavegadorHistorico({ onVoltar }: NavegadorHistoricoProps) {
  const { exercicios, loading, error, refetch } = useHistorico();
  const [filtroIdioma, setFiltroIdioma] = useState<Idioma | 'todos'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<TipoPratica | 'todos'>('todos');
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioPratica | null>(null);

  // Filtrar exercícios
  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter(ex => {
      const matchIdioma = filtroIdioma === 'todos' || ex.idioma === filtroIdioma;
      const matchTipo = filtroTipo === 'todos' || ex.tipo_pratica === filtroTipo;
      return matchIdioma && matchTipo;
    });
  }, [exercicios, filtroIdioma, filtroTipo]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = exerciciosFiltrados.length;
    let acertos = 0;

    exerciciosFiltrados.forEach(ex => {
      if (ex.tipo_pratica === 'traducao') {
        const resultado = ex.resultado_exercicio as ResultadoTraducao;
        if (resultado.campos_resultados.every(r => r)) acertos++;
      } else if (ex.tipo_pratica === 'audicao') {
        const resultado = ex.resultado_exercicio as ResultadoAudicao;
        if (resultado.correto) acertos++;
      } else if (ex.tipo_pratica === 'pronuncia') {
        const resultado = ex.resultado_exercicio as ResultadoPronuncia;
        if (resultado.correto === 'Sim') acertos++;
      } else if (ex.tipo_pratica === 'dialogo') {
        const resultado = ex.resultado_exercicio as ResultadoDialogo;
        if (resultado.correto === 'Sim') acertos++;
      } else if (ex.tipo_pratica === 'pronuncia_de_numeros') {
        const resultado = ex.resultado_exercicio as ResultadoPronunciaNumeros;
        if (resultado.acertou) acertos++;
      }
    });

    return {
      total,
      acertos,
      percentual: total > 0 ? Math.round((acertos / total) * 100) : 0
    };
  }, [exerciciosFiltrados]);

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const obterIconeTipo = (tipo: TipoPratica) => {
    const icones = {
      traducao: '📝',
      audicao: '👂',
      pronuncia: '🗣️',
      dialogo: '💬',
      pronuncia_de_numeros: '🔢'
    };
    return icones[tipo];
  };

  const obterNomeTipo = (tipo: TipoPratica) => {
    const nomes = {
      traducao: 'Tradução',
      audicao: 'Audição',
      pronuncia: 'Pronúncia',
      dialogo: 'Diálogo',
      pronuncia_de_numeros: 'Pronúncia de Números'
    };
    return nomes[tipo];
  };

  const obterNomeIdioma = (idioma: Idioma) => {
    return idioma === 'alemao' ? 'Alemão' : 'Inglês';
  };

  const obterStatusExercicio = (exercicio: ExercicioPratica) => {
    if (exercicio.tipo_pratica === 'traducao') {
      const resultado = exercicio.resultado_exercicio as ResultadoTraducao;
      const todosCorretos = resultado.campos_resultados.every(r => r);
      return todosCorretos ? 'success' : 'error';
    } else if (exercicio.tipo_pratica === 'audicao') {
      const resultado = exercicio.resultado_exercicio as ResultadoAudicao;
      return resultado.correto ? 'success' : 'error';
    } else if (exercicio.tipo_pratica === 'pronuncia') {
      const resultado = exercicio.resultado_exercicio as ResultadoPronuncia;
      return resultado.correto === 'Sim' ? 'success' : resultado.correto === 'Parcial' ? 'partial' : 'error';
    } else if (exercicio.tipo_pratica === 'dialogo') {
      const resultado = exercicio.resultado_exercicio as ResultadoDialogo;
      return resultado.correto === 'Sim' ? 'success' : resultado.correto === 'Parcial' ? 'partial' : 'error';
    } else if (exercicio.tipo_pratica === 'pronuncia_de_numeros') {
      const resultado = exercicio.resultado_exercicio as ResultadoPronunciaNumeros;
      return resultado.acertou ? 'success' : 'error';
    }
    return 'error';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600">Carregando histórico...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao Carregar Histórico</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={refetch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onVoltar}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Histórico de Práticas</h2>
            <p className="text-gray-600 mt-1">Visualize e analise suas práticas anteriores</p>
          </div>
          <button
            onClick={onVoltar}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium mb-1">Total de Exercícios</div>
            <div className="text-3xl font-bold text-blue-700">{estatisticas.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium mb-1">Acertos</div>
            <div className="text-3xl font-bold text-green-700">{estatisticas.acertos}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium mb-1">Taxa de Acerto</div>
            <div className="text-3xl font-bold text-purple-700">{estatisticas.percentual}%</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
            <select
              value={filtroIdioma}
              onChange={(e) => setFiltroIdioma(e.target.value as Idioma | 'todos')}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="alemao">Alemão</option>
              <option value="ingles">Inglês</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Prática</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoPratica | 'todos')}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="traducao">Tradução</option>
              <option value="audicao">Audição</option>
              <option value="pronuncia">Pronúncia</option>
              <option value="dialogo">Diálogo</option>
              <option value="pronuncia_de_numeros">Pronúncia de Números</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Exercícios */}
      {exerciciosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum exercício encontrado</h3>
          <p className="text-gray-600">
            {exercicios.length === 0 
              ? 'Você ainda não realizou nenhuma prática.'
              : 'Nenhum exercício corresponde aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exerciciosFiltrados.map((exercicio) => {
            const status = obterStatusExercicio(exercicio);
            const statusColors = {
              success: 'bg-green-50 border-green-200',
              partial: 'bg-yellow-50 border-yellow-200',
              error: 'bg-red-50 border-red-200'
            };
            const statusIcons = {
              success: '✅',
              partial: '⚠️',
              error: '❌'
            };

            return (
              <div
                key={exercicio.exercicio_id}
                className={`bg-white rounded-lg shadow-md border-2 ${statusColors[status]} p-6 hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => setExercicioSelecionado(exercicio)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{obterIconeTipo(exercicio.tipo_pratica)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {obterNomeTipo(exercicio.tipo_pratica)}
                        </h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                          {obterNomeIdioma(exercicio.idioma)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatarData(exercicio.data_hora)}
                      </p>
                    </div>
                  </div>
                  <div className="text-3xl">{statusIcons[status]}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      {exercicioSelecionado && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setExercicioSelecionado(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Detalhes do Exercício</h3>
                <button
                  onClick={() => setExercicioSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipo:</span>
                  <p className="text-lg text-gray-800">{obterNomeTipo(exercicioSelecionado.tipo_pratica)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Idioma:</span>
                  <p className="text-lg text-gray-800">{obterNomeIdioma(exercicioSelecionado.idioma)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Data e Hora:</span>
                  <p className="text-lg text-gray-800">{formatarData(exercicioSelecionado.data_hora)}</p>
                </div>

                <div className="border-t pt-4 mt-4">
                  <span className="text-sm font-medium text-gray-600 block mb-2">Resultado:</span>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(exercicioSelecionado.resultado_exercicio, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setExercicioSelecionado(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
