# Frontend - Sistema de Estudo de Idiomas

Aplicação web construída com Vite, React, TypeScript e Tailwind CSS.

## Tecnologias

- **Vite** - Build tool e dev server
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first

## Instalação

```bash
cd frontend
npm install
```

## Executar em Desenvolvimento

```bash
npm run dev
```

O servidor iniciará na porta definida em `.env` (padrão: 4005).

Acesse: http://localhost:4005

## Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## Preview da Build

```bash
npm run preview
```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   ├── index.css        # Estilos globais com Tailwind
│   └── vite-env.d.ts    # Tipos do Vite
├── index.html           # HTML template
├── package.json         # Dependências
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
└── postcss.config.js    # Configuração PostCSS
```

## Funcionalidades

A tela inicial apresenta 4 funcionalidades:

1. **Editar Prompts** - Gerenciar prompts do sistema
2. **Mudar Base de Conhecimento** - Adicionar/modificar conhecimentos
3. **Navegar no Histórico** - Visualizar histórico de práticas
4. **Editar Frases do Diálogo** - Gerenciar frases dos diálogos

Ao clicar em qualquer funcionalidade, aparece a mensagem "Funcionalidade não implementada".

## Configuração de Porta

A porta do servidor é configurada através da variável de ambiente `FRONTEND_PORT` no arquivo `.env` na raiz do projeto:

```
FRONTEND_PORT=4005
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview da build de produção
