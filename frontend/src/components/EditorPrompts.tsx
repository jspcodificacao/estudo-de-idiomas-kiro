import { useState } from 'react';
import { usePrompts } from '../hooks/usePrompts';
import { Prompt } from '../types/prompts';

interface EditorPromptsProps {
  onVoltar: () => void;
}

type ModoEdicao = 'visualizar' | 'editar' | 'criar';

export function EditorPrompts({ onVoltar }: EditorPromptsProps) {
  const { colecao, prompts, loading, error, refetch, salvarPrompts } = usePrompts();
  const [promptSelecionado, setPromptSelecionado] = useState<Prompt | null>(null);
  const [modoEdicao, setModoEdicao] = useState<ModoEdicao>('visualizar');
  const [promptEditando, setPromptEditando] = useState<Prompt | null>(null);
  const [busca, setBusca] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Filtrar prompts pela busca
  const promptsFiltrados = prompts.filter(p => 
    p.prompt_id.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  const handleNovoPrompt = () => {
    const novoPrompt: Prompt = {
      prompt_id: '',
      descricao: '',
      template: '',
      parametros: [],
      resposta_estruturada: false,
      ultima_edicao: new Date().toISOString()
    };
    setPromptEditando(novoPrompt);
    setModoEdicao('criar');
  };

  const handleEditarPrompt = (prompt: Prompt) => {
    setPromptEditando({ ...prompt });
    setModoEdicao('editar');
  };

  const handleVisualizarPrompt = (prompt: Prompt) => {
    setPromptSelecionado(prompt);
    setModoEdicao('visualizar');
  };

  const handleSalvar = async () => {
    if (!promptEditando) return;

    // Validações
    if (!promptEditando.prompt_id.trim()) {
      alert('ID do prompt é obrigatório');
      return;
    }
    if (!promptEditando.descricao.trim()) {
      alert('Descrição é obrigatória');
      return;
    }
    if (!promptEditando.template.trim()) {
      alert('Template é obrigatório');
      return;
    }

    setSalvando(true);

    try {
      let novosPrompts: Prompt[];

      if (modoEdicao === 'criar') {
        // Verificar se ID já existe
        if (prompts.some(p => p.prompt_id === promptEditando.prompt_id)) {
          alert('Já existe um prompt com este ID');
          setSalvando(false);
          return;
        }
        novosPrompts = [...prompts, { ...promptEditando, ultima_edicao: new Date().toISOString() }];
      } else {
        // Atualizar prompt existente
        novosPrompts = prompts.map(p => 
          p.prompt_id === promptEditando.prompt_id 
            ? { ...promptEditando, ultima_edicao: new Date().toISOString() }
            : p
        );
      }

      const sucesso = await salvarPrompts(novosPrompts);
      
      if (sucesso) {
        setModoEdicao('visualizar');
        setPromptSelecionado(promptEditando);
        setPromptEditando(null);
      } else {
        alert('Erro ao salvar prompt');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (promptId: string) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    setSalvando(true);
    const novosPrompts = prompts.filter(p => p.prompt_id !== promptId);
    const sucesso = await salvarPrompts(novosPrompts);
    
    if (sucesso) {
      setPromptSelecionado(null);
      setModoEdicao('visualizar');
    } else {
      alert('Erro ao excluir prompt');
    }
    setSalvando(false);
  };

  const handleCancelar = () => {
    setPromptEditando(null);
    setModoEdicao('visualizar');
  };

  const adicionarParametro = () => {
    if (!promptEditando) return;
    setPromptEditando({
      ...promptEditando,
      parametros: [...promptEditando.parametros, '']
    });
  };

  const removerParametro = (index: number) => {
    if (!promptEditando) return;
    setPromptEditando({
      ...promptEditando,
      parametros: promptEditando.parametros.filter((_, i) => i !== index)
    });
  };

  const atualizarParametro = (index: number, valor: string) => {
    if (!promptEditando) return;
    const novosParametros = [...promptEditando.parametros];
    novosParametros[index] = valor;
    setPromptEditando({
      ...promptEditando,
      parametros: novosParametros
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600">Carregando prompts...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao Carregar Prompts</h2>
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Editor de Prompts</h2>
            <p className="text-gray-600 mt-1">Gerencie os prompts do sistema</p>
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

        {/* Info da Coleção */}
        {colecao && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Descrição:</strong> {colecao.descricao}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Marcador de Parâmetros:</strong> {colecao.marcador_de_paramentros}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Última Atualização:</strong> {new Date(colecao.data_atualizacao).toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        {/* Busca e Novo */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar prompts..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleNovoPrompt}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Prompt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Prompts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Prompts ({promptsFiltrados.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {promptsFiltrados.map((prompt) => (
                <button
                  key={prompt.prompt_id}
                  onClick={() => handleVisualizarPrompt(prompt)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    promptSelecionado?.prompt_id === prompt.prompt_id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-800 text-sm truncate">
                    {prompt.prompt_id}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {prompt.descricao}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel de Detalhes/Edição */}
        <div className="lg:col-span-2">
          {(modoEdicao === 'editar' || modoEdicao === 'criar') && promptEditando ? (
            /* Modo Edição/Criação */
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {modoEdicao === 'criar' ? 'Criar Novo Prompt' : 'Editar Prompt'}
              </h3>

              <div className="space-y-4">
                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Prompt *
                  </label>
                  <input
                    type="text"
                    value={promptEditando.prompt_id}
                    onChange={(e) => setPromptEditando({ ...promptEditando, prompt_id: e.target.value })}
                    disabled={modoEdicao === 'editar'}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="ex: gerador_resumo_v1"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={promptEditando.descricao}
                    onChange={(e) => setPromptEditando({ ...promptEditando, descricao: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva o propósito deste prompt..."
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template *
                  </label>
                  <textarea
                    value={promptEditando.template}
                    onChange={(e) => setPromptEditando({ ...promptEditando, template: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    rows={5}
                    placeholder="Use {{parametro}} para marcar parâmetros..."
                  />
                </div>

                {/* Parâmetros */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Parâmetros
                    </label>
                    <button
                      onClick={adicionarParametro}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      + Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {promptEditando.parametros.map((param, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={param}
                          onChange={(e) => atualizarParametro(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="nome_do_parametro"
                        />
                        <button
                          onClick={() => removerParametro(index)}
                          className="text-red-600 hover:text-red-700 px-3"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resposta Estruturada */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={promptEditando.resposta_estruturada}
                      onChange={(e) => setPromptEditando({ 
                        ...promptEditando, 
                        resposta_estruturada: e.target.checked 
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Resposta Estruturada (JSON)
                    </span>
                  </label>
                </div>

                {/* Estrutura Esperada */}
                {promptEditando.resposta_estruturada && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estrutura Esperada (JSON Schema)
                    </label>
                    <textarea
                      value={JSON.stringify(promptEditando.estrutura_esperada || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const estrutura = JSON.parse(e.target.value);
                          setPromptEditando({ ...promptEditando, estrutura_esperada: estrutura });
                        } catch {
                          // Ignora erro de parsing enquanto digita
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                      rows={8}
                    />
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
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
            </div>
          ) : promptSelecionado ? (
            /* Modo Visualização */
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {promptSelecionado.prompt_id}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditarPrompt(promptSelecionado)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(promptSelecionado.prompt_id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Descrição</h4>
                  <p className="text-gray-800">{promptSelecionado.descricao}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Template</h4>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                    {promptSelecionado.template}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Parâmetros</h4>
                  <div className="flex flex-wrap gap-2">
                    {promptSelecionado.parametros.map((param, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Resposta Estruturada</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    promptSelecionado.resposta_estruturada 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {promptSelecionado.resposta_estruturada ? 'Sim' : 'Não'}
                  </span>
                </div>

                {promptSelecionado.resposta_estruturada && promptSelecionado.estrutura_esperada && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Estrutura Esperada</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 overflow-auto">
                        {JSON.stringify(promptSelecionado.estrutura_esperada, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Última Edição</h4>
                  <p className="text-gray-800">
                    {new Date(promptSelecionado.ultima_edicao).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Nenhum prompt selecionado */
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Selecione um prompt
              </h3>
              <p className="text-gray-600">
                Escolha um prompt da lista ou crie um novo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
