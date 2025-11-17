# Iniciar o Backend

Este documento descreve como configurar e iniciar o servidor backend da aplicação de estudo de idiomas.

## Pré-requisitos

- Python 3.8 ou superior instalado
- Acesso ao terminal/prompt de comando
- Arquivos JSON na pasta `/public` (já devem estar presentes)

## 1. Instalar Dependências

### Instalar Todas as Dependências

```bash
pip install -r backend/requirements.txt
```

Isso instalará:
- **fastapi** - Framework web para criar a API
- **uvicorn** - Servidor ASGI para executar o FastAPI
- **pydantic** - Validação de dados
- **python-dotenv** - Carregar variáveis de ambiente
- **pytest** - Framework de testes (opcional)
- **httpx** - Cliente HTTP para testes (opcional)

### Verificar Instalação

```bash
python -c "import fastapi, uvicorn, pydantic; print('Dependências instaladas com sucesso!')"
```

## 2. Configurar Variáveis de Ambiente

O arquivo `.env` na raiz do projeto já contém as configurações necessárias:

```
BACKEND_PORT=4010
FRONTEND_PORT=4005
```

Se precisar alterar a porta do backend, edite o valor de `BACKEND_PORT` no arquivo `.env`.

## 3. Validar Arquivos JSON (Opcional mas Recomendado)

Antes de iniciar o servidor, valide que todos os arquivos JSON estão corretos:

```bash
python backend/validator.py
```

Você deve ver:

```
======================================================================
VALIDAÇÃO DE ARQUIVOS JSON
======================================================================

✓ VÁLIDO: [BASE] Conhecimento de idiomas.json
✓ VÁLIDO: [BASE] Prompts.json
✓ VÁLIDO: [BASE] Histórico de Prática.json
✓ VÁLIDO: [BASE] Frases do Diálogo.json

======================================================================
✓ TODOS OS ARQUIVOS SÃO VÁLIDOS
======================================================================
```

## 4. Iniciar o Servidor

### Método 1: Executar o Script Principal

```bash
python backend/main.py
```

### Método 2: Usar Uvicorn Diretamente

```bash
uvicorn backend.main:app --reload --port 4010
```

### Método 3: Usar Uvicorn com Host Específico

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 4010 --reload
```

## 5. Verificar que o Servidor Está Rodando

### Verificação 1: Mensagem no Terminal

Você deve ver algo como:

```
INFO:     Uvicorn running on http://0.0.0.0:4010 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Verificação 2: Acessar no Navegador

Abra o navegador e acesse:

**http://localhost:4010/**

Você deve ver:

```json
{
  "mensagem": "API de Estudo de Idiomas",
  "versao": "1.0.0",
  "endpoints": {
    "base_de_conhecimento": "/api/base_de_conhecimento",
    "prompts": "/api/prompts",
    "historico_de_pratica": "/api/historico_de_pratica",
    "frases_do_dialogo": "/api/frases_do_dialogo"
  }
}
```

### Verificação 3: Testar um Endpoint

Acesse: **http://localhost:4010/api/base_de_conhecimento**

Você deve ver um array JSON com os conhecimentos de idiomas.

## 6. Acessar a Documentação Interativa

O FastAPI gera automaticamente documentação interativa:

### Swagger UI (Recomendado)

**http://localhost:4010/docs**

Interface interativa onde você pode:
- Ver todos os endpoints
- Ver schemas dos modelos
- Testar endpoints diretamente
- Ver exemplos de request/response

### ReDoc (Alternativa)

**http://localhost:4010/redoc**

Documentação com layout alternativo, mais focada em leitura.

### OpenAPI JSON

**http://localhost:4010/openapi.json**

Especificação OpenAPI em formato JSON.

## 7. Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Informações da API |
| `/api/base_de_conhecimento` | GET | Lista de conhecimentos de idiomas |
| `/api/prompts` | GET | Coleção de prompts |
| `/api/historico_de_pratica` | GET | Histórico de exercícios |
| `/api/frases_do_dialogo` | GET | Frases para diálogos |
| `/docs` | GET | Documentação Swagger UI |
| `/redoc` | GET | Documentação ReDoc |

## 8. Testar os Endpoints

### Usando curl (Windows CMD)

```bash
curl http://localhost:4010/
curl http://localhost:4010/api/base_de_conhecimento
curl http://localhost:4010/api/prompts
curl http://localhost:4010/api/historico_de_pratica
curl http://localhost:4010/api/frases_do_dialogo
```

### Usando PowerShell

```powershell
Invoke-WebRequest -Uri http://localhost:4010/api/base_de_conhecimento | Select-Object -Expand Content
```

### Usando Python

```python
import requests

response = requests.get("http://localhost:4010/api/base_de_conhecimento")
print(response.json())
```

## 9. Parar o Servidor

Para parar o servidor, pressione:

**CTRL + C**

no terminal onde o servidor está rodando.

## 10. Modo de Desenvolvimento vs Produção

### Modo de Desenvolvimento (com reload automático)

```bash
python backend/main.py
```

ou

```bash
uvicorn backend.main:app --reload --port 4010
```

O servidor reinicia automaticamente quando você modifica o código.

### Modo de Produção (sem reload)

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 4010 --workers 4
```

Use múltiplos workers para melhor performance.

## 11. Solução de Problemas

### Erro: Address already in use

A porta 4010 já está em uso. Opções:

**Opção 1:** Mudar a porta no `.env`:
```
BACKEND_PORT=4011
```

**Opção 2:** Parar o processo que está usando a porta:

```bash
# Windows - Encontrar o processo
netstat -ano | findstr :4010

# Windows - Matar o processo
taskkill /PID <PID> /F
```

### Erro: ModuleNotFoundError

Instale as dependências:

```bash
pip install -r backend/requirements.txt
```

### Erro: File not found (arquivos JSON)

Certifique-se de executar o servidor a partir da raiz do projeto, onde a pasta `public` existe:

```bash
# Correto (na raiz do projeto)
python backend/main.py

# Incorreto (dentro da pasta backend)
cd backend
python main.py  # Não vai encontrar a pasta public
```

### Erro: Validation error

Os arquivos JSON contêm dados inválidos. Execute o validador:

```bash
python backend/validator.py
```

E corrija os erros reportados.

### Servidor não responde

1. Verifique se o servidor está realmente rodando
2. Verifique se está usando a porta correta
3. Tente acessar `http://127.0.0.1:4010/` em vez de `localhost`
4. Verifique o firewall do Windows

## 12. Logs e Debugging

### Ver Logs Detalhados

```bash
uvicorn backend.main:app --reload --port 4010 --log-level debug
```

### Níveis de Log Disponíveis

- `critical` - Apenas erros críticos
- `error` - Erros
- `warning` - Avisos
- `info` - Informações (padrão)
- `debug` - Debug detalhado
- `trace` - Trace muito detalhado

## 13. Executar em Background (Windows)

### Usando start

```bash
start /B python backend/main.py
```

### Usando PowerShell

```powershell
Start-Process python -ArgumentList "backend/main.py" -WindowStyle Hidden
```

## 14. Checklist de Inicialização

Antes de iniciar o servidor, verifique:

- [ ] Python 3.8+ instalado
- [ ] Dependências instaladas (`pip install -r backend/requirements.txt`)
- [ ] Arquivo `.env` existe na raiz
- [ ] Pasta `/public` existe com arquivos JSON
- [ ] Arquivos JSON são válidos (execute `python backend/validator.py`)
- [ ] Porta 4010 está disponível

## 15. Próximos Passos

Após iniciar o servidor:

1. Acesse a documentação em http://localhost:4010/docs
2. Teste os endpoints manualmente
3. Execute os testes automatizados (veja `testar_backend.md`)
4. Integre com o frontend

## Resumo Rápido

```bash
# 1. Instalar dependências
pip install -r backend/requirements.txt

# 2. Validar arquivos (opcional)
python backend/validator.py

# 3. Iniciar servidor
python backend/main.py

# 4. Acessar no navegador
# http://localhost:4010/docs
```

O servidor estará disponível em **http://localhost:4010/** e pronto para receber requisições do frontend!
