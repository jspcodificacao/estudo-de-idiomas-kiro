import { useState, useMemo } from 'react';
import { useConhecimento } from '../hooks/useConhecimento';
import { ConhecimentoIdioma, Idioma, TipoConhecimento } from '../types/conhecimento';

interface EditorConhecimentoProps {
  onVoltar: () => void;
}

type ModoEdicao = 'visualizar' | 'editar' | 'criar';

export function EditorConhecimento({ onVoltar }: EditorConhecimentoProps) {
  const { conhecimentos, loading, error, refetch, salvarConhecimentos } = useConhecimento();
  const [conhecimentoSelecionado, setConhecimentoSelecionado] = useState<ConhecimentoIdioma | null>(null);
  const [modoEdicao, setModoEdicao] = useState<ModoEdicao>('visualizar');
  const [conhecimentoEditando, setConhecimentoEditando] = useState<ConhecimentoIdioma | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroIdioma, setFiltroIdioma] = useState<Idioma | 'todos'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<TipoConhecimento | 'todos'>('todos');
  const [salvando, setSalvando] = useState(false);

  // Filtrar conhecimentos
  const conhecimentosFiltrados = useMemo(() => {
    return conhecimentos.filter(c => {
      const matchBusca = busca === '' || 
        c.texto_original.toLowerCase().includes(busca.toLowerCase()) ||
        c.traducao.toLowerCase().includes(busca.toLowerCase());
      const matchIdioma = filtroIdioma === 'todos' || c.idioma === filtroIdioma;
      const matchTipo = filtroTipo === 'todos' || c.tipo_conhecimento === filtroTipo;
      return matchBusca && matchIdioma && matchTipo;
    });
  }, [conhecimentos, busca, filtroIdioma, filtroTipo]);

  const handleNovoConhecimento = () => {
    const novoConhecimento: ConhecimentoIdioma = {
      conhecimento_id: crypto.randomUUID(),
      data_hora: new Date().toISOString(),
      idioma: 'alemao',
      tipo_conhecimento: 'palavra',
      texto_original: '',
      traducao: '',
      transcricao_ipa: '',
      divisao_silabica: ''
    };
    setConhecimentoEditando(novoConhecimento);
    setModoEdicao('criar');
  };

  const handleEditarConhecimento = (conhecimento: ConhecimentoIdioma) => {
    setConhecimentoEditando({ ...conhecimento });
    setModoEdicao('editar');
  };

  const handleVisualizarConhecimento = (conhecimento: ConhecimentoIdioma) => {
    setConhecimentoSelecionado(conhecimento);
    setModoEdicao('visualizar');
  };

  const handleSalvar = async () => {
    if (!conhecimentoEditando) return;

    // Validações
    if (!conhecimentoEditando.texto_original.trim()) {
      alert('Texto original é obrigatório');
      return;
    }
    if (!conhecimentoEditando.traducao.trim()) {
      alert('Tradução é obrigatória');
      return;
    }

    setSalvando(true);

    try {
      let novosConhecimentos: ConhecimentoIdioma[];

      if (modoEdicao === 'criar') {
        novosConhecimentos = [...conhecimentos, { 
          ...conhecimentoEditando, 
          data_hora: new Date().toISOString() 
        }];
      } else {
        novosConhecimentos = conhecimentos.map(c => 
          c.conhecimento_id === conhecimentoEditando.conhecimento_id 
            ? { ...conhecimentoEditando, data_hora: new Date().toISOString() }
            : c
        );
      }

      const sucesso = await salvarConhecimentos(novosConhecimentos);
      
      if (sucesso) {
        setModoEdicao('visualizar');
        setConhecimentoSelecionado(conhecimentoEditando);
        setConhecimentoEditando(null);
      } else {
        alert('Erro ao salvar conhecimento');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (conhecimentoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este conhecimento?')) return;

    setSalvando(true);
    const novosConhecimentos = conhecimentos.filter(c => c.conhecimento_id !== conhecimentoId);
    const sucesso = await salvarConhecimentos(novosConhecimentos);
    
    if (sucesso) {
      setConhecimentoSelecionado(null);
      setModoEdicao('visualizar');
    } else {
      alert('Erro ao excluir conhecimento');
    }
    setSalvando(false);
  };

  const handleCancelar = () => {
    setConhecimentoEditando(null);
    setModoEdicao('visualizar');
  };

  const obterNomeIdioma = (idioma: Idioma) => {
    return idioma === 'alemao' ? 'Alemão' : 'Inglês';
  };

  const obterNomeTipo = (tipo: TipoConhecimento) => {
    return tipo === 'frase' ? 'Frase' : 'Palavra';
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600">Carregando conhecimentos...</span>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao Carregar Conhecimentos</h2>
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
            <h2 className="text-2xl font-bold text-gray-800">Editor de Base de Conhecimento</h2>
            <p className="text-gray-600 mt-1">Gerencie palavras e frases de idiomas</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium mb-1">Total</div>
            <div className="text-3xl font-bold text-blue-700">{conhecimentos.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium mb-1">Alemão</div>
            <div className="text-3xl font-bold text-green-700">
              {conhecimentos.filter(c => c.idioma === 'alemao').length}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-purple-600 text-sm font-medium mb-1">Inglês</div>
            <div className="text-3xl font-bold text-purple-700">
              {conhecimentos.filter(c => c.idioma === 'ingles').length}
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por texto ou tradução..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={filtroIdioma}
            onChange={(e) => setFiltroIdioma(e.target.value as Idioma | 'todos')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="todos">Todos os idiomas</option>
            <option value="alemao">Alemão</option>
            <option value="ingles">Inglês</option>
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoConhecimento | 'todos')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="todos">Todos os tipos</option>
            <option value="palavra">Palavra</option>
            <option value="frase">Frase</option>
          </select>
          <button
            onClick={handleNovoConhecimento}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conhecimentos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Conhecimentos ({conhecimentosFiltrados.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {conhecimentosFiltrados.map((conhecimento) => (
                <button
                  key={conhecimento.conhecimento_id}
                  onClick={() => handleVisualizarConhecimento(conhecimento)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    conhecimentoSelecionado?.conhecimento_id === conhecimento.conhecimento_id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                      {obterNomeIdioma(conhecimento.idioma)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                      {obterNomeTipo(conhecimento.tipo_conhecimento)}
                    </span>
                  </div>
                  <div className="font-medium text-gray-800 text-sm truncate">
                    {conhecimento.texto_original}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {conhecimento.traducao}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel de Detalhes/Edição */}
        <div className="lg:col-span-2">
          {(modoEdicao === 'editar' || modoEdicao === 'criar') && conhecimentoEditando ? (
            /* Modo Edição/Criação */
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {modoEdicao === 'criar' ? 'Criar Novo Conhecimento' : 'Editar Conhecimento'}
              </h3>

              <div className="space-y-4">
                {/* Idioma e Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma *
                    </label>
                    <select
                      value={conhecimentoEditando.idioma}
                      onChange={(e) => setConhecimentoEditando({ 
                        ...conhecimentoEditando, 
                        idioma: e.target.value as Idioma 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="alemao">Alemão</option>
                      <option value="ingles">Inglês</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      value={conhecimentoEditando.tipo_conhecimento}
                      onChange={(e) => setConhecimentoEditando({ 
                        ...conhecimentoEditando, 
                        tipo_conhecimento: e.target.value as TipoConhecimento 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="palavra">Palavra</option>
                      <option value="frase">Frase</option>
                    </select>
                  </div>
                </div>

                {/* Texto Original */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto Original *
                  </label>
                  <input
                    type="text"
                    value={conhecimentoEditando.texto_original}
                    onChange={(e) => setConhecimentoEditando({ 
                      ...conhecimentoEditando, 
                      texto_original: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: Hallo"
                  />
                </div>

                {/* Tradução */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tradução *
                  </label>
                  <input
                    type="text"
                    value={conhecimentoEditando.traducao}
                    onChange={(e) => setConhecimentoEditando({ 
                      ...conhecimentoEditando, 
                      traducao: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: Olá"
                  />
                </div>

                {/* Transcrição IPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcrição IPA (opcional)
                  </label>
                  <input
                    type="text"
                    value={conhecimentoEditando.transcricao_ipa || ''}
                    onChange={(e) => setConhecimentoEditando({ 
                      ...conhecimentoEditando, 
                      transcricao_ipa: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: haˈloː"
                  />
                </div>

                {/* Divisão Silábica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Divisão Silábica (opcional)
                  </label>
                  <input
                    type="text"
                    value={conhecimentoEditando.divisao_silabica || ''}
                    onChange={(e) => setConhecimentoEditando({ 
                      ...conhecimentoEditando, 
                      divisao_silabica: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: Hal-lo"
                  />
                </div>

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
          ) : conhecimentoSelecionado ? (
            /* Modo Visualização */
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {conhecimentoSelecionado.texto_original}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditarConhecimento(conhecimentoSelecionado)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(conhecimentoSelecionado.conhecimento_id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {obterNomeIdioma(conhecimentoSelecionado.idioma)}
                  </span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    {obterNomeTipo(conhecimentoSelecionado.tipo_conhecimento)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Texto Original</h4>
                  <p className="text-lg text-gray-800">{conhecimentoSelecionado.texto_original}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Tradução</h4>
                  <p className="text-lg text-gray-800">{conhecimentoSelecionado.traducao}</p>
                </div>

                {conhecimentoSelecionado.transcricao_ipa && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Transcrição IPA</h4>
                    <p className="text-lg text-gray-800 font-mono">{conhecimentoSelecionado.transcricao_ipa}</p>
                  </div>
                )}

                {conhecimentoSelecionado.divisao_silabica && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Divisão Silábica</h4>
                    <p className="text-lg text-gray-800">{conhecimentoSelecionado.divisao_silabica}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Data/Hora</h4>
                  <p className="text-gray-800">{formatarData(conhecimentoSelecionado.data_hora)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">ID</h4>
                  <p className="text-xs text-gray-600 font-mono">{conhecimentoSelecionado.conhecimento_id}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Nenhum conhecimento selecionado */
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Selecione um conhecimento
              </h3>
              <p className="text-gray-600">
                Escolha um conhecimento da lista ou crie um novo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
