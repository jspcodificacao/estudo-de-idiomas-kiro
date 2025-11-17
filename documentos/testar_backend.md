# Testes do Backend

Este documento descreve como realizar os testes do backend do sistema de estudo de idiomas.

## Visão Geral

O backend possui três tipos de testes:

1. **Validação de Arquivos JSON** - Valida estrutura e dados dos arquivos
2. **Testes de API** - Testa endpoints do servidor FastAPI
3. **Testes Manuais** - Testes interativos via Python REPL

## Pré-requisitos

- Python 3.8 ou superior
- Dependências instaladas

### Instalação de Dependências

```bash
pip install -r backend/requirements.txt
```

Isso instala:
- pydantic (validação de dados)
- fastapi (framework web)
- uvicorn (servidor)
- pytest (testes automatizados)
- httpx (cliente HTTP para testes)

## PARTE 1: Validação de Arquivos JSON

### 1.1. Validar Todos os Arquivos

Execute o validador para verificar se todos os arquivos JSON estão corretos:

```bash
python backend/validator.py
```

### 1.2. Saída Esperada

Se todos os arquivos estiverem válidos:

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

Se houver erros, serão exibidos detalhes:

```
✗ INVÁLIDO: [BASE] Conhecimento de idiomas.json
  Erros:
    - Item 0: Field required [type=missing, input_value={...}]
    - Item 5: Invalid UUID format
```

### 1.3. Arquivos Validados

| Arquivo | Obrigatório | Pode estar vazio? |
|---------|-------------|-------------------|
| [BASE] Conhecimento de idiomas.json | Sim | Não |
| [BASE] Prompts.json | Sim | Não |
| [BASE] Histórico de Prática.json | Não (opcional) | Não (se existir) |
| [BASE] Frases do Diálogo.json | Sim | Não |

## PARTE 2: Testes Automatizados da API

### 2.1. Executar Todos os Testes

```bash
pytest backend/test_api.py -v
```

Ou use o script auxiliar:

```bash
run_tests.bat
```

### 2.2. Saída Esperada

```
================================ test session starts =================================
collected 50 items

backend/test_api.py::TestEndpointRaiz::test_raiz_retorna_200 PASSED           [  2%]
backend/test_api.py::TestEndpointRaiz::test_raiz_retorna_json PASSED          [  4%]
...
backend/test_api.py::TestDocumentacao::test_openapi_json_disponivel PASSED    [100%]

================================ 50 passed in 2.34s ==================================
```

### 2.3. Executar Testes Específicos

```bash
# Testar apenas endpoints de conhecimento
pytest backend/test_api.py::TestEndpointBaseDeConhecimento -v

# Testar apenas validações Pydantic
pytest backend/test_api.py -k "validacao" -v

# Parar no primeiro erro
pytest backend/test_api.py -x

# Mostrar saída detalhada
pytest backend/test_api.py -vv
```

### 2.4. Cobertura de Testes

Os testes cobrem:

- ✓ 4 testes do endpoint raiz
- ✓ 11 testes de base de conhecimento
- ✓ 9 testes de prompts
- ✓ 7 testes de histórico de prática
- ✓ 8 testes de frases do diálogo
- ✓ 4 testes de integração
- ✓ 2 testes de tratamento de erros
- ✓ 2 testes de performance
- ✓ 3 testes de documentação

**Total: 50+ casos de teste**

### 2.5. Gerar Relatório de Cobertura

```bash
pip install pytest-cov
pytest backend/test_api.py --cov=backend --cov-report=html
```

Abra `htmlcov/index.html` no navegador para ver o relatório.

## PARTE 3: Testes Manuais dos Modelos Pydantic

### Teste Manual via Python REPL

Abra o interpretador Python e teste os modelos:

```bash
python
```

#### Testar Conhecimento de Idiomas

```python
from backend.models import ConhecimentoIdioma, Idioma, TipoConhecimento
from uuid import uuid4
from datetime import datetime

# Criar um conhecimento válido
conhecimento = ConhecimentoIdioma(
    conhecimento_id=uuid4(),
    data_hora=datetime.now(),
    idioma=Idioma.ALEMAO,
    tipo_conhecimento=TipoConhecimento.FRASE,
    texto_original="Guten Tag",
    transcricao_ipa="ˌɡuːtən ˈtaːk",
    traducao="Boa tarde",
    divisao_silabica="Gu-ten Tag"
)

print(conhecimento)
```

#### Testar Prompts

```python
from backend.models import ColecaoPrompts, Prompt
from datetime import datetime

prompt = Prompt(
    prompt_id="teste_v1",
    descricao="Prompt de teste",
    template="Traduza: {{texto}}",
    parametros=["texto"],
    resposta_estruturada=False,
    ultima_edicao=datetime.now()
)

colecao = ColecaoPrompts(
    descricao="Coleção de teste",
    data_atualizacao=datetime.now(),
    marcador_de_paramentros="{{param}}",
    prompts=[prompt]
)

print(colecao)
```

#### Testar Histórico de Prática

```python
from backend.models import (
    ExercicioPratica, HistoricoPratica, 
    TipoPratica, Idioma, ResultadoTraducao, CampoTraducao
)
from uuid import uuid4
from datetime import datetime

resultado = ResultadoTraducao(
    campo_fornecido=CampoTraducao.TRADUCAO,
    campos_preenchidos=[CampoTraducao.TEXTO_ORIGINAL],
    valores_preenchidos=["Hallo"],
    campos_resultados=[True]
)

exercicio = ExercicioPratica(
    data_hora=datetime.now(),
    exercicio_id=uuid4(),
    conhecimento_id=uuid4(),
    idioma=Idioma.ALEMAO,
    tipo_pratica=TipoPratica.TRADUCAO,
    resultado_exercicio=resultado
)

historico = HistoricoPratica(exercicios=[exercicio])
print(historico)
```

#### Testar Frases do Diálogo

```python
from backend.models import FrasesDialogo

frases = FrasesDialogo(
    saudacao="Hallo",
    despedida="Tschüss",
    intermediarias=["Wie heißen Sie?", "Wie geht es Ihnen?"]
)

print(frases)
```

### Testar Validações de Erro

Teste que as validações funcionam corretamente:

```python
from backend.models import ConhecimentoIdioma
from pydantic import ValidationError

# Deve falhar: texto_original vazio
try:
    ConhecimentoIdioma(
        conhecimento_id="invalid-uuid",
        data_hora="2025-01-01T00:00:00Z",
        idioma="alemao",
        tipo_conhecimento="frase",
        texto_original="",  # Vazio - deve falhar
        traducao="Teste"
    )
except ValidationError as e:
    print("✓ Validação funcionou:", e)

# Deve falhar: idioma inválido
try:
    ConhecimentoIdioma(
        conhecimento_id="40986742-86a6-4bc6-bae3-41e34ce5298d",
        data_hora="2025-01-01T00:00:00Z",
        idioma="frances",  # Não suportado - deve falhar
        tipo_conhecimento="frase",
        texto_original="Bonjour",
        traducao="Olá"
    )
except ValidationError as e:
    print("✓ Validação funcionou:", e)
```

## PARTE 4: Testes de Integração com Servidor Rodando

### 4.1. Iniciar o Servidor

Em um terminal, inicie o servidor:

```bash
python backend/main.py
```

Aguarde a mensagem:
```
INFO:     Uvicorn running on http://0.0.0.0:4010
```

### 4.2. Testar Endpoints no Navegador

Abra no navegador:

1. http://localhost:4010/ - Informações da API
2. http://localhost:4010/api/base_de_conhecimento - Conhecimentos
3. http://localhost:4010/api/prompts - Prompts
4. http://localhost:4010/api/historico_de_pratica - Histórico
5. http://localhost:4010/api/frases_do_dialogo - Frases

### 4.3. Testar com curl

```bash
curl http://localhost:4010/api/base_de_conhecimento
curl http://localhost:4010/api/prompts
curl http://localhost:4010/api/historico_de_pratica
curl http://localhost:4010/api/frases_do_dialogo
```

### 4.4. Testar com Python

```python
import requests

# Testar endpoint
response = requests.get("http://localhost:4010/api/base_de_conhecimento")
print(f"Status: {response.status_code}")
print(f"Total de conhecimentos: {len(response.json())}")

# Testar todos os endpoints
endpoints = [
    "/",
    "/api/base_de_conhecimento",
    "/api/prompts",
    "/api/historico_de_pratica",
    "/api/frases_do_dialogo"
]

for endpoint in endpoints:
    response = requests.get(f"http://localhost:4010{endpoint}")
    print(f"✓ {endpoint}: {response.status_code}")
```

### 4.5. Testar Documentação Interativa

Acesse:
- **Swagger UI:** http://localhost:4010/docs
- **ReDoc:** http://localhost:4010/redoc

Na interface Swagger, você pode testar cada endpoint clicando em "Try it out".

## PARTE 5: Testes de Casos Especiais

### Histórico de Prática Vazio (Opcional)

O histórico de prática é o único arquivo opcional. Teste o comportamento quando ele não existe:

```bash
# Renomear temporariamente
move "public\[BASE] Histórico de Prática.json" "public\[BASE] Histórico de Prática.json.bak"

# Executar validador
python backend/validator.py

# Restaurar
move "public\[BASE] Histórico de Prática.json.bak" "public\[BASE] Histórico de Prática.json"
```

### Validação de Listas com Tamanhos Iguais

Teste a validação de ResultadoTraducao:

```python
from backend.models import ResultadoTraducao, CampoTraducao
from pydantic import ValidationError

# Deve falhar: listas com tamanhos diferentes
try:
    ResultadoTraducao(
        campo_fornecido=CampoTraducao.TRADUCAO,
        campos_preenchidos=[CampoTraducao.TEXTO_ORIGINAL, CampoTraducao.TRANSCRICAO_IPA],
        valores_preenchidos=["Hallo"],  # Só 1 item - deve falhar
        campos_resultados=[True, False]
    )
except ValidationError as e:
    print("✓ Validação de tamanho funcionou")

# Deve falhar: campos duplicados
try:
    ResultadoTraducao(
        campo_fornecido=CampoTraducao.TRADUCAO,
        campos_preenchidos=[CampoTraducao.TEXTO_ORIGINAL, CampoTraducao.TEXTO_ORIGINAL],
        valores_preenchidos=["Hallo", "Hallo"],
        campos_resultados=[True, True]
    )
except ValidationError as e:
    print("✓ Validação de unicidade funcionou")
```

## PARTE 6: Checklist Completo de Testes

### Validação de Arquivos
- [ ] Validador executa sem erros (`python backend/validator.py`)
- [ ] Todos os 4 arquivos JSON são validados
- [ ] Arquivos obrigatórios existem e não estão vazios
- [ ] Histórico opcional é tratado corretamente

### Testes Automatizados
- [ ] Todos os testes pytest passam (`pytest backend/test_api.py -v`)
- [ ] 50+ casos de teste executam com sucesso
- [ ] Nenhum warning ou erro
- [ ] Cobertura de código > 80%

### Modelos Pydantic
- [ ] Modelos carregam dados corretamente
- [ ] Validações de campos obrigatórios funcionam
- [ ] Validações de enums funcionam (idioma, tipo_conhecimento, etc)
- [ ] Validações de UUID funcionam
- [ ] Validações de datetime funcionam (ISO 8601)
- [ ] Validações customizadas funcionam (tamanhos, unicidade)

### Servidor FastAPI
- [ ] Servidor inicia sem erros
- [ ] Porta correta (4010 ou definida em .env)
- [ ] Endpoint raiz retorna informações
- [ ] Todos os 4 endpoints de dados funcionam
- [ ] Documentação Swagger acessível (/docs)
- [ ] Documentação ReDoc acessível (/redoc)
- [ ] Erros HTTP são tratados corretamente (404, 422, 500)

### Integração
- [ ] Endpoints retornam dados válidos
- [ ] Estrutura JSON está correta
- [ ] IDs são únicos
- [ ] Dados passam validação Pydantic
- [ ] Performance aceitável (< 1s por requisição)

## PARTE 7: Solução de Problemas

### Erro: ModuleNotFoundError: No module named 'pydantic'

```bash
pip install pydantic
```

### Erro: ModuleNotFoundError: No module named 'models'

Execute o validador a partir da raiz do projeto:

```bash
python backend/validator.py
```

Ou ajuste o PYTHONPATH:

```bash
set PYTHONPATH=%PYTHONPATH%;.
python backend/validator.py
```

### Erro: Arquivo não encontrado

Verifique que está executando a partir da raiz do projeto onde a pasta `public` existe.

## PARTE 8: Automação de Testes

### 8.1. Script Completo de Testes

Crie um arquivo `test_all.bat`:

```batch
@echo off
echo ========================================
echo   SUITE COMPLETA DE TESTES - BACKEND
echo ========================================
echo.

echo [1/3] Validando arquivos JSON...
python backend/validator.py
if %ERRORLEVEL% NEQ 0 (
    echo FALHOU: Validacao de arquivos
    exit /b 1
)
echo.

echo [2/3] Executando testes automatizados...
pytest backend/test_api.py -v
if %ERRORLEVEL% NEQ 0 (
    echo FALHOU: Testes automatizados
    exit /b 1
)
echo.

echo [3/3] Verificando servidor...
echo Inicie o servidor manualmente e teste os endpoints
echo.

echo ========================================
echo   TODOS OS TESTES PASSARAM!
echo ========================================
```

### 8.2. Integração Contínua (CI/CD)

Para GitHub Actions, crie `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: pip install -r backend/requirements.txt
    
    - name: Validate JSON files
      run: python backend/validator.py
    
    - name: Run API tests
      run: pytest backend/test_api.py -v
```

### 8.3. Testes Antes de Commit

Adicione ao `.git/hooks/pre-commit`:

```bash
#!/bin/sh
echo "Executando testes antes do commit..."
python backend/validator.py && pytest backend/test_api.py -q
```

## PARTE 9: Resumo Rápido

### Teste Rápido (1 minuto)

```bash
# Validar arquivos
python backend/validator.py

# Executar testes
pytest backend/test_api.py -q
```

### Teste Completo (5 minutos)

```bash
# 1. Validar arquivos
python backend/validator.py

# 2. Testes automatizados
pytest backend/test_api.py -v

# 3. Iniciar servidor
python backend/main.py

# 4. Em outro terminal, testar endpoints
curl http://localhost:4010/api/base_de_conhecimento
```

### Teste com Cobertura (10 minutos)

```bash
# Validar
python backend/validator.py

# Testes com cobertura
pytest backend/test_api.py --cov=backend --cov-report=html -v

# Ver relatório
start htmlcov/index.html
```

## Conclusão

Para garantir qualidade do backend:

1. **Sempre** execute `python backend/validator.py` antes de iniciar o servidor
2. **Regularmente** execute `pytest backend/test_api.py -v` 
3. **Antes de commits** execute a suite completa de testes
4. **Mantenha** cobertura de testes acima de 80%

**Comandos essenciais:**
```bash
python backend/validator.py          # Validar arquivos JSON
pytest backend/test_api.py -v        # Testes automatizados
python backend/main.py               # Iniciar servidor
```
