# Funcionalidade: Navegar no Histórico

## Visão Geral

A funcionalidade "Navegar no Histórico" permite que os usuários visualizem e analisem todas as práticas de idiomas realizadas anteriormente. A interface é elegante, intuitiva e oferece recursos de filtragem e estatísticas.

## Características Principais

### 1. Visualização de Exercícios
- Lista ordenada por data (mais recentes primeiro)
- Cards visuais com ícones para cada tipo de prática
- Indicadores visuais de status (✅ acerto, ❌ erro, ⚠️ parcial)
- Cores diferenciadas por resultado

### 2. Filtros
- **Por Idioma**: Alemão, Inglês ou Todos
- **Por Tipo de Prática**: Tradução, Audição, Pronúncia, Diálogo, Pronúncia de Números ou Todos

### 3. Estatísticas em Tempo Real
- Total de exercícios realizados
- Número de acertos
- Taxa de acerto percentual
- Atualização automática conforme filtros

### 4. Detalhes do Exercício
- Modal com informações completas
- Visualização do resultado em formato JSON
- Dados técnicos para análise detalhada

## Estrutura de Arquivos

```
frontend/src/
├── types/
│   └── historico.ts          # Tipos TypeScript para o histórico
├── hooks/
│   └── useHistorico.ts       # Hook customizado para buscar dados
├── components/
│   └── NavegadorHistorico.tsx # Componente principal
└── App.tsx                    # Integração com o app
```

## Tipos de Prática Suportados

1. **Tradução** (📝)
   - Exibe campos preenchidos e resultados
   - Status: correto se todos os campos estiverem certos

2. **Audição** (👂)
   - Mostra transcrição do usuário vs. texto original
   - Indica velocidade utilizada

3. **Pronúncia** (🗣️)
   - Apresenta transcrição STT
   - Status: Sim, Parcial ou Não
   - Inclui comentário sobre a pronúncia

4. **Diálogo** (💬)
   - Status: Sim, Parcial ou Não

5. **Pronúncia de Números** (🔢)
   - Número de referência
   - Link para áudio do usuário
   - Transcrição correta


## Como Usar

1. **Acessar**: Na tela inicial, clique no card "Navegar no Histórico"
2. **Visualizar**: Veja a lista de exercícios com estatísticas no topo
3. **Filtrar**: Use os dropdowns para filtrar por idioma e tipo de prática
4. **Detalhes**: Clique em qualquer exercício para ver informações completas
5. **Voltar**: Use o botão "Voltar" para retornar ao menu principal

## Estados da Interface

### Loading
- Spinner animado com mensagem "Carregando histórico..."

### Erro
- Mensagem de erro clara
- Botão "Tentar Novamente" para refetch
- Botão "Voltar" para retornar ao menu

### Vazio
- Mensagem amigável quando não há exercícios
- Diferencia entre "nenhum exercício" e "nenhum resultado nos filtros"

### Sucesso
- Lista de exercícios com cards interativos
- Estatísticas atualizadas
- Filtros funcionais

## Integração com Backend

### Endpoint Utilizado
```
GET /api/historico_de_pratica
```

### Resposta Esperada
```json
{
  "exercicios": [
    {
      "data_hora": "2025-11-13T09:15:00Z",
      "exercicio_id": "uuid",
      "conhecimento_id": "uuid",
      "idioma": "alemao",
      "tipo_pratica": "traducao",
      "resultado_exercicio": { ... }
    }
  ]
}
```

## Melhorias Futuras

1. **Exportação**: Permitir exportar histórico em CSV/PDF
2. **Gráficos**: Adicionar visualizações gráficas de progresso
3. **Busca**: Campo de busca por texto
4. **Ordenação**: Opções de ordenação personalizadas
5. **Comparação**: Comparar desempenho entre períodos
6. **Anotações**: Permitir adicionar notas aos exercícios

## Tecnologias Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Custom Hooks**: Gerenciamento de estado e dados
- **Fetch API**: Comunicação com backend

---

**Implementado em**: 2025-11-19  
**Versão**: 1.0.0
