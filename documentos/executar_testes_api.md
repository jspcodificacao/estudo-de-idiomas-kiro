# Executar Testes da API

Este documento descreve como executar os casos de teste para os endpoints do servidor FastAPI.

## Pré-requisitos

### Instalar Dependências

```bash
pip install -r backend/requirements.txt
```

Isso instalará:
- pytest (framework de testes)
- httpx (cliente HTTP para testes)
- fastapi e uvicorn
- pydantic
- python-dotenv

## Estrutura dos Testes

Os testes estão organizados em classes por funcionalidade:

- **TestEndpointRaiz**: Testes do endpoint `/`
- **TestEndpointBaseDeConhecimento**: Testes de `/api/base_de_conhecimento`
- **TestEndpointPrompts**: Testes de `/api/prompts`
- **TestEndpointHistoricoDePratica**: Testes de `/api/historico_de_pratica`
- **TestEndpointFrasesDoDialogo**: Testes de `/api/frases_do_dialogo`
- **TestIntegracaoEndpoints**: Testes de integração entre endpoints
- **TestTratamentoDeErros**: Testes de tratamento de erros
- **TestPerformance**: Testes básicos de performance
- **TestDocumentacao**: Testes da documentação automática

## Executar Todos os Testes

### Comando Básico

```bash
pytest backend/test_api.py
```

### Comando com Saída Detalhada

```bash
pytest backend/test_api.py -v
```

### Comando com Saída Muito Detalhada

```bash
pytest backend/test_api.py -vv
```

## Executar Testes Específicos

### Executar Uma Classe de Testes

```bash
pytest backend/test_api.py::TestEndpointBaseDeConhecimento -v
```

### Executar Um Teste Específico

```bash
pytest backend/test_api.py::TestEndpointBaseDeConhecimento::test_retorna_200 -v
```

### Executar Testes por Padrão de Nome

```bash
# Todos os testes que contêm "validacao" no nome
pytest backend/test_api.py -k "validacao" -v

# Todos os testes de estrutura
pytest backend/test_api.py -k "estrutura" -v
```

## Opções Úteis do Pytest

### Parar no Primeiro Erro

```bash
pytest backend/test_api.py -x
```

### Mostrar Variáveis Locais em Falhas

```bash
pytest backend/test_api.py -l
```

### Executar Apenas Testes que Falharam Anteriormente

```bash
pytest backend/test_api.py --lf
```

### Mostrar Saída de Print

```bash
pytest backend/test_api.py -s
```

### Modo Silencioso (Apenas Resumo)

```bash
pytest backend/test_api.py -q
```

## Relatórios de Cobertura

### Instalar pytest-cov

```bash
pip install pytest-cov
```

### Gerar Relatório de Cobertura

```bash
pytest backend/test_api.py --cov=backend --cov-report=html
```

Isso gera um relatório HTML em `htmlcov/index.html`.

### Ver Cobertura no Terminal

```bash
pytest backend/test_api.py --cov=backend --cov-report=term
```

## Saída Esperada

### Todos os Testes Passando

```
================================ test session starts =================================
platform win32 -- Python 3.x.x, pytest-7.4.3
collected 50 items

backend/test_api.py::TestEndpointRaiz::test_raiz_retorna_200 PASSED           [  2%]
backend/test_api.py::TestEndpointRaiz::test_raiz_retorna_json PASSED          [  4%]
backend/test_api.py::TestEndpointRaiz::test_raiz_contem_informacoes PASSED    [  6%]
...
backend/test_api.py::TestDocumentacao::test_openapi_json_disponivel PASSED    [100%]

================================ 50 passed in 2.34s ==================================
```

### Teste Falhando

```
================================ FAILURES ============================================
_________________________ TestEndpointRaiz::test_raiz_retorna_200 _______________

self = <test_api.TestEndpointRaiz object at 0x...>

    def test_raiz_retorna_200(self):
        response = client.get("/")
>       assert response.status_code == 200
E       assert 404 == 200

backend/test_api.py:45: AssertionError
================================ 1 failed, 49 passed in 2.45s ========================
```

## Casos de Teste Implementados

### Testes de Endpoint Raiz (4 testes)
- ✓ Retorna status 200
- ✓ Retorna JSON válido
- ✓ Contém informações da API
- ✓ Lista todos os endpoints

### Testes de Base de Conhecimento (11 testes)
- ✓ Retorna status 200
- ✓ Retorna array
- ✓ Array não está vazio
- ✓ Estrutura correta dos itens
- ✓ Campos obrigatórios preenchidos
- ✓ Idioma válido (alemao/ingles)
- ✓ Tipo de conhecimento válido (frase/palavra)
- ✓ UUID válido
- ✓ Datetime válido (ISO 8601)
- ✓ Validação Pydantic passa

### Testes de Prompts (9 testes)
- ✓ Retorna status 200
- ✓ Retorna objeto
- ✓ Estrutura de ColecaoPrompts
- ✓ Array de prompts não vazio
- ✓ Estrutura de cada prompt
- ✓ Parâmetros são array
- ✓ resposta_estruturada é boolean
- ✓ estrutura_esperada quando necessário
- ✓ Validação Pydantic passa

### Testes de Histórico de Prática (7 testes)
- ✓ Retorna status 200
- ✓ Retorna objeto
- ✓ Tem campo exercicios
- ✓ exercicios é array
- ✓ Estrutura de exercício correta
- ✓ tipo_pratica válido
- ✓ Validação Pydantic passa

### Testes de Frases do Diálogo (8 testes)
- ✓ Retorna status 200
- ✓ Retorna objeto
- ✓ Estrutura correta
- ✓ Campos não vazios
- ✓ intermediarias é array
- ✓ Frases são strings
- ✓ Validação Pydantic passa
- ✓ Não permite campos extras

### Testes de Integração (4 testes)
- ✓ Todos endpoints respondem
- ✓ IDs de conhecimento únicos
- ✓ IDs de prompts únicos
- ✓ IDs de exercícios únicos

### Testes de Tratamento de Erros (2 testes)
- ✓ Endpoint inexistente retorna 404
- ✓ Método não permitido retorna 405

### Testes de Performance (2 testes)
- ✓ Resposta rápida (< 1s)
- ✓ Suporta múltiplas requisições

### Testes de Documentação (3 testes)
- ✓ Swagger UI disponível
- ✓ ReDoc disponível
- ✓ OpenAPI JSON disponível

**Total: 50+ casos de teste**

## Integração Contínua (CI)

### Script para CI/CD

Crie um arquivo `.github/workflows/tests.yml`:

```yaml
name: Testes da API

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Configurar Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Instalar dependências
      run: |
        pip install -r backend/requirements.txt
    
    - name: Executar testes
      run: |
        pytest backend/test_api.py -v
```

### Script Batch para Windows

Crie `run_tests.bat`:

```batch
@echo off
echo Executando testes da API...
pytest backend/test_api.py -v
if %ERRORLEVEL% NEQ 0 (
    echo Testes falharam!
    exit /b 1
)
echo Todos os testes passaram!
```

## Debugging de Testes

### Executar com Debugger

```bash
pytest backend/test_api.py --pdb
```

Isso abre o debugger Python quando um teste falha.

### Ver Traceback Completo

```bash
pytest backend/test_api.py --tb=long
```

### Executar com Profiling

```bash
pytest backend/test_api.py --profile
```

## Boas Práticas

1. **Execute os testes antes de fazer commit**
   ```bash
   pytest backend/test_api.py -v
   ```

2. **Mantenha os testes rápidos**
   - Testes devem executar em segundos, não minutos

3. **Testes devem ser independentes**
   - Cada teste deve funcionar isoladamente

4. **Use nomes descritivos**
   - Nome do teste deve descrever o que está sendo testado

5. **Teste casos de sucesso e falha**
   - Não teste apenas o caminho feliz

## Solução de Problemas

### Erro: ModuleNotFoundError

```bash
pip install -r backend/requirements.txt
```

### Erro: No tests collected

Verifique que está executando a partir da raiz do projeto:

```bash
# Correto
pytest backend/test_api.py

# Incorreto (dentro de backend/)
pytest test_api.py
```

### Testes Falhando

1. Verifique que os arquivos JSON em `/public` existem
2. Verifique que os arquivos são válidos
3. Execute o validador primeiro:
   ```bash
   python backend/validator.py
   ```

### Servidor Já Rodando

Os testes usam TestClient do FastAPI, que não precisa do servidor rodando.
Se houver conflito de porta, pare o servidor antes de executar os testes.

## Checklist de Testes

Antes de fazer deploy:

- [ ] Todos os testes passam
- [ ] Cobertura de código > 80%
- [ ] Sem warnings
- [ ] Documentação atualizada
- [ ] Testes de integração passam
- [ ] Testes de performance aceitáveis

## Conclusão

Execute regularmente `pytest backend/test_api.py -v` para garantir que todos os endpoints estão funcionando corretamente.
