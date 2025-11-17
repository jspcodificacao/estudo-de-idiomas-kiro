import { useState } from 'react'

type Funcionalidade = 
  | 'editar-prompts'
  | 'mudar-base'
  | 'navegar-historico'
  | 'editar-frases'
  | null

function App() {
  const [funcionalidadeSelecionada, setFuncionalidadeSelecionada] = useState<Funcionalidade>(null)

  const funcionalidades = [
    {
      id: 'editar-prompts' as const,
      titulo: 'Editar Prompts',
      descricao: 'Gerenciar e editar prompts do sistema',
      icone: '📝'
    },
    {
      id: 'mudar-base' as const,
      titulo: 'Mudar Base de Conhecimento',
      descricao: 'Adicionar ou modificar conhecimentos de idiomas',
      icone: '📚'
    },
    {
      id: 'navegar-historico' as const,
      titulo: 'Navegar no Histórico',
      descricao: 'Visualizar histórico de práticas realizadas',
      icone: '📊'
    },
    {
      id: 'editar-frases' as const,
      titulo: 'Editar Frases do Diálogo',
      descricao: 'Gerenciar frases usadas nos diálogos',
      icone: '💬'
    }
  ]

  const handleFuncionalidadeClick = (id: Funcionalidade) => {
    setFuncionalidadeSelecionada(id)
  }

  const handleVoltar = () => {
    setFuncionalidadeSelecionada(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-indigo-600">
            Sistema de Estudo de Idiomas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus conhecimentos e práticas de idiomas
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {funcionalidadeSelecionada === null ? (
          /* Tela Inicial - Grid de Funcionalidades */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {funcionalidades.map((func) => (
              <button
                key={func.id}
                onClick={() => handleFuncionalidadeClick(func.id)}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {func.icone}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {func.titulo}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {func.descricao}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-indigo-600 font-medium">
                  <span className="text-sm">Acessar</span>
                  <svg 
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Tela de Funcionalidade Não Implementada */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Funcionalidade Não Implementada
                </h2>
                <p className="text-gray-600 mb-6">
                  A funcionalidade "{funcionalidades.find(f => f.id === funcionalidadeSelecionada)?.titulo}" 
                  ainda não foi implementada.
                </p>
                <button
                  onClick={handleVoltar}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 inline-flex items-center"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar ao Menu Principal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-600">
        <p className="text-sm">
          Sistema de Estudo de Idiomas - v1.0.0
        </p>
      </footer>
    </div>
  )
}

export default App
