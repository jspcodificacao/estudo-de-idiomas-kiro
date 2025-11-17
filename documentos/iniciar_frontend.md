# Iniciar o Frontend

Este documento descreve como configurar e iniciar a aplicação frontend do sistema de estudo de idiomas.

## Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Arquivo `.env` configurado na raiz do projeto

## 1. Instalar Dependências

### Primeira Vez

```bash
cd frontend
npm install
```

Isso instalará:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Outras dependências necessárias

### Verificar Instalação

```bash
npm list --depth=0
```

## 2. Configurar Variáveis de Ambiente

O arquivo `.env` na raiz do projeto já contém a configuração:

```
FRONTEND_PORT=4005
BACKEND_PORT=4010
```

Se precisar alterar a porta do frontend, edite o valor de `FRONTEND_PORT`.

## 3. Iniciar o Servidor de Desenvolvimento

### Método 1: A partir da pasta frontend

```bash
cd frontend
npm run dev
```

### Método 2: A partir da raiz do projeto

```bash
npm run dev --prefix frontend
```

## 4. Verificar que o Servidor Está Rodando

### Verificação 1: Mensagem no Terminal

Você deve ver algo como:

```
  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:4005/
  ➜  Network: http://192.168.1.100:4005/
  ➜  press h + enter to show help
```

### Verificação 2: Acessar no Navegador

Abra o navegador e acesse:

**http://localhost:4005/**

Você deve ver a tela inicial com 4 cards de funcionalidades.

## 5. Funcionalidades da Aplicação

A tela inicial apresenta 4 funcionalidades:

### 1. Editar Prompts 📝
- Gerenciar e editar prompts do sistema
- Status: Não implementada

### 2. Mudar Base de Conhecimento 📚
- Adicionar ou modificar conhecimentos de idiomas
- Status: Não implementada

### 3. Navegar no Histórico 📊
- Visualizar histórico de práticas realizadas
- Status: Não implementada

### 4. Editar Frases do Diálogo 💬
- Gerenciar frases usadas nos diálogos
- Status: Não implementada

Ao clicar em qualquer funcionalidade, aparece a mensagem:
**"Funcionalidade Não Implementada"**

## 6. Hot Module Replacement (HMR)

O Vite possui HMR ativado por padrão. Isso significa que:

- Alterações no código são refletidas instantaneamente no navegador
- Não é necessário recarregar a página manualmente
- O estado da aplicação é preservado

Para testar:
1. Abra `frontend/src/App.tsx`
2. Modifique algum texto
3. Salve o arquivo
4. Veja a mudança instantânea no navegador

## 7. Build para Produção

### Criar Build

```bash
cd frontend
npm run build
```

Os arquivos otimizados serão gerados em `frontend/dist/`.

### Preview da Build

```bash
npm run preview
```

Isso inicia um servidor local para testar a build de produção.

## 8. Estrutura do Projeto

```
frontend/
├── src/
│   ├── App.tsx          # Componente principal com tela inicial
│   ├── main.tsx         # Entry point da aplicação
│   ├── index.css        # Estilos globais + Tailwind
│   └── vite-env.d.ts    # Tipos do Vite
├── public/              # Arquivos estáticos
├── index.html           # HTML template
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite (porta aqui)
├── tailwind.config.js   # Configuração Tailwind CSS
└── postcss.config.js    # Configuração PostCSS
```

## 9. Tecnologias Utilizadas

### Vite
- Build tool moderna e rápida
- HMR instantâneo
- Otimização automática para produção

### React 18
- Biblioteca UI declarativa
- Hooks para gerenciamento de estado
- TypeScript para tipagem

### TypeScript
- Tipagem estática
- Melhor IntelliSense
- Menos erros em runtime

### Tailwind CSS
- Framework CSS utility-first
- Design responsivo
- Customização fácil

## 10. Parar o Servidor

Para parar o servidor de desenvolvimento, pressione:

**CTRL + C**

no terminal onde o servidor está rodando.

## 11. Solução de Problemas

### Erro: Port 4005 is already in use

A porta 4005 já está em uso. Opções:

**Opção 1:** Mudar a porta no `.env`:
```
FRONTEND_PORT=4006
```

**Opção 2:** Parar o processo que está usando a porta:

```bash
# Windows - Encontrar o processo
netstat -ano | findstr :4005

# Windows - Matar o processo
taskkill /PID <PID> /F
```

### Erro: Cannot find module

As dependências não estão instaladas:

```bash
cd frontend
npm install
```

### Erro: ENOENT: no such file or directory

Certifique-se de estar na pasta correta:

```bash
# Deve estar em frontend/ para executar npm run dev
cd frontend
npm run dev
```

### Página em Branco

1. Verifique o console do navegador (F12)
2. Verifique se há erros no terminal
3. Tente limpar o cache:
   ```bash
   rm -rf frontend/node_modules/.vite
   npm run dev
   ```

### Tailwind CSS não funciona

1. Verifique se `index.css` importa o Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. Verifique se `tailwind.config.js` está configurado corretamente

3. Reinicie o servidor de desenvolvimento

## 12. Desenvolvimento

### Adicionar Novos Componentes

Crie arquivos `.tsx` na pasta `src/`:

```typescript
// src/MeuComponente.tsx
export function MeuComponente() {
  return (
    <div className="p-4 bg-blue-500 text-white">
      Meu Componente
    </div>
  )
}
```

### Usar Tailwind CSS

Classes utilitárias do Tailwind:

```tsx
<div className="flex items-center justify-center min-h-screen bg-gray-100">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Clique Aqui
  </button>
</div>
```

### TypeScript

Defina tipos para props:

```typescript
interface MeuComponenteProps {
  titulo: string
  onClick: () => void
}

export function MeuComponente({ titulo, onClick }: MeuComponenteProps) {
  return <button onClick={onClick}>{titulo}</button>
}
```

## 13. Integração com Backend

Para conectar com o backend (quando implementado):

```typescript
const BACKEND_URL = 'http://localhost:4010'

async function carregarDados() {
  const response = await fetch(`${BACKEND_URL}/api/base_de_conhecimento`)
  const dados = await response.json()
  return dados
}
```

## 14. Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| dev | `npm run dev` | Inicia servidor de desenvolvimento |
| build | `npm run build` | Cria build de produção |
| preview | `npm run preview` | Preview da build de produção |

## 15. Checklist de Inicialização

Antes de iniciar o frontend, verifique:

- [ ] Node.js 16+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` existe na raiz
- [ ] Porta 4005 está disponível
- [ ] Backend está rodando (se necessário)

## 16. Próximos Passos

Após iniciar o frontend:

1. Explore a interface no navegador
2. Teste os 4 cards de funcionalidades
3. Verifique o comportamento responsivo (redimensione a janela)
4. Abra o DevTools (F12) para ver o console
5. Implemente as funcionalidades conforme necessário

## Resumo Rápido

```bash
# 1. Instalar dependências (primeira vez)
cd frontend
npm install

# 2. Iniciar servidor
npm run dev

# 3. Acessar no navegador
# http://localhost:4005/
```

O frontend estará disponível em **http://localhost:4005/** com uma interface moderna e responsiva!
