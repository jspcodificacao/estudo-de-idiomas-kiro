import { useState, useEffect } from 'react';
import { useFrases } from '../hooks/useFrases';
import { FrasesDialogo } from '../types/frases';

interface EditorFrasesProps {
  onVoltar: () => void;
}

export function EditorFrases({ onVoltar }: EditorFrasesProps) {
  const { frases, loading, error, refetch, salvarFrases } = useFrases();
  const [editando, setEditando] = useState(false);
  const [frasesEditando, setFrasesEditando] = useState<FrasesDialogo | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (frases && !frasesEditando) {
      setFrasesEditando({ ...frases });
    }
  }, [frases]);

  const handleEditar = () => {
    if (frases) {
      setFrasesEditando({ ...frases });
      setEditando(true);
    }
  };

  const handleSalvar = async () => {
    if (!frasesEditando) return;

    // Validações
    if (!frasesEditando.saudacao.trim()) {
      alert('Saudação é obrigatória');
      return;
    }
    if (!frasesEditando.despedida.trim()) {
      alert('Despedida é obrigatória');
      return;
    }
    if (frasesEditando.intermediarias.length === 0) {
      alert('Deve haver pelo menos uma frase intermediária');
      return;
    }
    if (frasesEditando.intermediarias.some(f => !f.trim())) {
      alert('Todas as frases intermediárias devem estar preenchidas');
      return;
    }

    setSalvando(true);
    const sucesso = await salvarFrases(frasesEditando);
    
    if (sucesso) {
      setEditando(false);
    } else {
      alert('Erro ao salvar frases');
    }
    setSalvando(false);
  };

  const handleCancelar = () => {
    if (frases) {
      setFrasesEditando({ ...frases });
    }
    setEditando(false);
  };

  const adicionarIntermediaria = () => {
    if (!frasesEditando) return;
    setFrasesEditando({
      ...frasesEditando,
      intermediarias: [...frasesEditando.intermediarias, '']
    });
  };

  const removerIntermediaria = (index: number) => {
    if (!frasesEditando) return;
    if (frasesEditando.intermediarias.length <= 1) {
      alert('Deve haver pelo menos uma frase intermediária');
      return;
    }
    setFrasesEditando({
      ...frasesEditando,
      intermediarias: frasesEditando.intermediarias.filter((_, i) => i !== index)
    });
  };

  const atualizarIntermediaria = (index: number, valor: string) => {
    if (!frasesEditando) return;
    const novasIntermediarias = [...frasesEditando.intermediarias];
    novasIntermediarias[index] = valor;
    setFrasesEditando({
      ...frasesEditando,
      intermediarias: novasIntermediarias
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600">Carregando frases...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao Carregar Frases</h2>
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

  if (!frasesEditando) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Editor de Frases do Diálogo</h2>
            <p className="text-gray-600 mt-1">Gerencie as frases usadas nos diálogos</p>
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
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {editando ? (
          /* Modo Edição */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Editando Frases</h3>
            </div>

            {/* Saudação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saudação *
              </label>
              <input
                type="text"
                value={frasesEditando.saudacao}
                onChange={(e) => setFrasesEditando({ 
                  ...frasesEditando, 
                  saudacao: e.target.value 
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Hallo"
              />
              <p className="text-xs text-gray-500 mt-1">
                Frase usada para iniciar o diálogo
              </p>
            </div>

            {/* Despedida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Despedida *
              </label>
              <input
                type="text"
                value={frasesEditando.despedida}
                onChange={(e) => setFrasesEditando({ 
                  ...frasesEditando, 
                  despedida: e.target.value 
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Tschüss"
              />
              <p className="text-xs text-gray-500 mt-1">
                Frase usada para finalizar o diálogo
              </p>
            </div>

            {/* Frases Intermediárias */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Frases Intermediárias * (mínimo 1)
                </label>
                <button
                  onClick={adicionarIntermediaria}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {frasesEditando.intermediarias.map((frase, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-gray-500 font-medium">
                      {index + 1}.
                    </div>
                    <input
                      type="text"
                      value={frase}
                      onChange={(e) => atualizarIntermediaria(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: Wie heißen Sie?"
                    />
                    <button
                      onClick={() => removerIntermediaria(index)}
                      className="flex-shrink-0 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Frases usadas durante o diálogo, entre a saudação e a despedida
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                onClick={handleCancelar}
                disabled={salvando}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* Modo Visualização */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Frases Atuais</h3>
              <button
                onClick={handleEditar}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>

            {/* Saudação */}
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="text-sm font-medium text-green-800 mb-2">🙋 Saudação</h4>
              <p className="text-lg text-green-900 font-medium">{frasesEditando.saudacao}</p>
            </div>

            {/* Frases Intermediárias */}
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="text-sm font-medium text-blue-800 mb-3">💬 Frases Intermediárias ({frasesEditando.intermediarias.length})</h4>
              <div className="space-y-2">
                {frasesEditando.intermediarias.map((frase, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-blue-900 flex-1">{frase}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Despedida */}
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="text-sm font-medium text-purple-800 mb-2">👋 Despedida</h4>
              <p className="text-lg text-purple-900 font-medium">{frasesEditando.despedida}</p>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">ℹ️ Informação</h4>
              <p className="text-sm text-gray-600">
                Estas frases são usadas nos exercícios de diálogo. A saudação inicia a conversa, 
                as frases intermediárias são usadas durante o diálogo, e a despedida finaliza.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
