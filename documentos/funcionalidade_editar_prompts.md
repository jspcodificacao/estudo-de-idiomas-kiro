# Funcionalidade: Editar Prompts

## Visão Geral

A funcionalidade "Editar Prompts" oferece uma interface completa e elegante para gerenciar os prompts do sistema. Os usuários podem criar, visualizar, editar e excluir prompts de forma intuitiva.

## Características Principais

### 1. Visualização de Prompts
- Lista lateral com todos os prompts disponíveis
- Busca em tempo real por ID ou descrição
- Contador de prompts
- Scroll independente para listas longas

### 2. Criação de Prompts
- Formulário completo com validação
- Campos obrigatórios marcados com *
- ID único (não editável após criação)
- Descrição detalhada
- Template com suporte a parâmetros
- Lista dinâmica de parâmetros
- Opção de resposta estruturada (JSON)
- Editor de JSON Schema para estrutura esperada

### 3. Edição de Prompts
- Todos os campos editáveis (exceto ID)
- Preservação de dados durante edição
- Botão de cancelar para descartar mudanças
- Atualização automática da data de última edição

### 4. Exclusão de Prompts
- Confirmação antes de excluir
- Remoção permanente do prompt
- Feedback visual imediato

### 5. Visualização Detalhada
- Painel dedicado para cada prompt
- Formatação clara de template
- Tags visuais para parâmetros
- Indicador de resposta estruturada
- Visualização de JSON Schema formatado
- Data de última edição

## Estrutura de Arquivos

```
frontend/src/
├── types/
│   └── prompts.ts              # Tipos TypeScript para prompts
├── hooks/
│   └── usePrompts.ts           # Hook para gerenciar prompts
├── components/
│   └── EditorPrompts.tsx       # Componente principal
└── App.tsx                      # Integração
```

## Interface do Usuário

### Layout
- **Header**: Título, descrição e botão voltar
- **Info da Coleção**: Descrição, marcador de parâmetros e última atualização
- **Barra de Ferramentas**: Campo de busca e botão "Novo Prompt"
- **Grid Responsivo**: 
  - Coluna esquerda (1/3): Lista de prompts
  - Coluna direita (2/3): Painel de detalhes/edição

### Modos de Operação

#### Modo Visualização
- Exibe detalhes completos do prompt selecionado
- Botões "Editar" e "Excluir"
- Formatação elegante de dados

#### Modo Edição
- Formulário completo com todos os campos
- Validação em tempo real
- Botões "Salvar" e "Cancelar"
- ID desabilitado (não editável)

#### Modo Criação
- Formulário limpo para novo prompt
- Todos os campos habilitados
- Validação de ID único
- Botões "Salvar" e "Cancelar"

## Campos do Prompt

### Obrigatórios
1. **ID do Prompt**: Identificador único (ex: `gerador_resumo_v1`)
2. **Descrição**: Explicação do propósito do prompt
3. **Template**: Texto do prompt com marcadores de parâmetros

### Opcionais
4. **Parâmetros**: Lista de nomes de parâmetros usados no template
5. **Resposta Estruturada**: Checkbox indicando se espera JSON
6. **Estrutura Esperada**: JSON Schema quando resposta estruturada = true

### Automáticos
7. **Última Edição**: Timestamp ISO 8601 (atualizado automaticamente)

## Validações

### Ao Criar
- ID não pode estar vazio
- ID deve ser único
- Descrição não pode estar vazia
- Template não pode estar vazio

### Ao Editar
- Descrição não pode estar vazia
- Template não pode estar vazio
- ID não pode ser alterado

### Ao Excluir
- Confirmação obrigatória do usuário

## Gerenciamento de Parâmetros

### Adicionar Parâmetro
- Botão "+ Adicionar" no topo da seção
- Novo campo vazio adicionado à lista

### Editar Parâmetro
- Campo de texto editável inline
- Atualização em tempo real

### Remover Parâmetro
- Botão "✕" ao lado de cada parâmetro
- Remoção imediata sem confirmação

## Resposta Estruturada

### Quando Ativada
- Checkbox marcado
- Campo de JSON Schema aparece
- Editor de texto com syntax highlighting
- Validação de JSON em tempo real

### JSON Schema
- Formato padrão JSON Schema
- Suporte a tipos, propriedades, required, etc.
- Visualização formatada no modo visualização

## Estados da Interface

### Loading
- Spinner animado
- Mensagem "Carregando prompts..."

### Erro
- Ícone de erro
- Mensagem descritiva
- Botões "Tentar Novamente" e "Voltar"

### Vazio
- Mensagem quando nenhum prompt encontrado na busca
- Sugestão para criar novo prompt

### Salvando
- Botão "Salvar" desabilitado
- Texto muda para "Salvando..."
- Previne múltiplos cliques

## Integração com Backend

### Endpoint de Leitura
```
GET /api/prompts
```

**Resposta:**
```json
{
  "descricao": "Uma coleção de prompts...",
  "data_atualizacao": "2025-11-13T09:00:00Z",
  "marcador_de_paramentros": "{{param}}",
  "prompts": [...]
}
```

### Endpoint de Escrita (TODO)
```
PUT /api/prompts
```

**Body:**
```json
{
  "descricao": "...",
  "data_atualizacao": "...",
  "marcador_de_paramentros": "...",
  "prompts": [...]
}
```

**Nota:** Atualmente, as alterações são salvas apenas localmente. O endpoint de escrita precisa ser implementado no backend.

## Exemplo de Uso

### Criar Novo Prompt

1. Clicar em "Novo Prompt"
2. Preencher ID: `tradutor_contexto_v1`
3. Preencher Descrição: `Traduz texto considerando contexto`
4. Preencher Template: `Traduza "{{texto}}" de {{origem}} para {{destino}}`
5. Adicionar parâmetros: `texto`, `origem`, `destino`
6. Marcar "Resposta Estruturada" se necessário
7. Clicar em "Salvar"

### Editar Prompt Existente

1. Selecionar prompt da lista
2. Clicar em "Editar"
3. Modificar campos desejados
4. Clicar em "Salvar" ou "Cancelar"

### Excluir Prompt

1. Selecionar prompt da lista
2. Clicar em "Excluir"
3. Confirmar na caixa de diálogo

## Melhorias Futuras

1. **Persistência**: Implementar endpoint PUT no backend
2. **Validação Avançada**: Validar sintaxe do template
3. **Preview**: Visualizar prompt com parâmetros preenchidos
4. **Duplicar**: Criar cópia de prompt existente
5. **Histórico**: Versioning de prompts
6. **Importar/Exportar**: Suporte a JSON/YAML
7. **Testes**: Testar prompt com dados reais
8. **Categorias**: Organizar prompts por categoria
9. **Favoritos**: Marcar prompts mais usados
10. **Drag & Drop**: Reordenar prompts

## Tecnologias Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Custom Hooks**: Gerenciamento de estado
- **Fetch API**: Comunicação com backend

## Acessibilidade

- Labels descritivos em todos os campos
- Placeholders informativos
- Feedback visual claro
- Botões com ícones e texto
- Cores contrastantes
- Navegação por teclado

---

**Implementado em**: 2025-11-19  
**Versão**: 1.0.0  
**Status**: Funcional (persistência local apenas)
