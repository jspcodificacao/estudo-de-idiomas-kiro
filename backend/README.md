# Backend - Sistema de Estudo de Idiomas

## Estrutura

- `models.py`: Modelos Pydantic2 baseados nos schemas JSON
- `validator.py`: Validador de arquivos JSON contra os schemas
- `main.py`: Servidor FastAPI com endpoints da aplicação
- `requirements.txt`: Dependências do projeto

## Validação de Arquivos JSON

### Uso

Para validar todos os arquivos JSON da pasta `/public`:

```bash
python backend/validator.py
```

### Arquivos Validados

1. **Conhecimento de Idiomas** (obrigatório, não vazio)
   - Dados: `/public/[BASE] Conhecimento de idiomas.json`
   - Schema: `/public/[BASE][SCHEMA] Conhecimento de idiomas.json`

2. **Prompts** (obrigatório, não vazio)
   - Dados: `/public/[BASE] Prompts.json`
   - Schema: `/public/[BASE][SCHEMA] Prompts.json`

3. **Histórico de Prática** (opcional, se existir não pode estar vazio)
   - Dados: `/public/[BASE] Histórico de Prática.json`
   - Schema: `/public/[BASE][SCHEMA] Histórico de Prática.json`

4. **Frases do Diálogo** (obrigatório, não vazio)
   - Dados: `/public/[BASE] Frases do Diálogo.json`
   - Schema: `/public/[BASE][SCHEMA] Frases do diálogo.json`

### Saída

O validador exibe:
- ✓ para arquivos válidos
- ✗ para arquivos inválidos com lista de erros
- Código de saída 0 se todos válidos, 1 se houver erros

### Uso Programático

```python
from backend.validator import ValidadorJSON

validador = ValidadorJSON(pasta_public="public")
sucesso = validador.validar_todos()

# Ou validar arquivos individuais
resultado = validador.validar_conhecimento_idiomas()
print(resultado.valido)
print(resultado.erros)
```

## Modelos Pydantic2

Os modelos em `models.py` implementam todas as restrições dos schemas:

- Validação de tipos (UUID, datetime, enums)
- Validação de tamanhos (min_length, max_length)
- Validação customizada (listas com mesmo tamanho, unicidade)
- Suporte a campos opcionais
- Union types para resultados de exercícios variados

## Servidor FastAPI

### Instalação

```bash
pip install -r backend/requirements.txt
```

### Executar o Servidor

```bash
python backend/main.py
```

O servidor iniciará na porta definida em `.env` (padrão: 4010).

### Endpoints Disponíveis

#### GET /
Informações sobre a API e lista de endpoints.

#### GET /api/base_de_conhecimento
Retorna a base de conhecimento de idiomas validada.

**Response:** Array de objetos `ConhecimentoIdioma`

```json
[
  {
    "conhecimento_id": "40986742-86a6-4bc6-bae3-41e34ce5298d",
    "data_hora": "2025-10-05T14:35:06.829Z",
    "idioma": "alemao",
    "tipo_conhecimento": "frase",
    "texto_original": "Hallo!",
    "transcricao_ipa": "haˈloː",
    "traducao": "Olá!",
    "divisao_silabica": "Hal-lo"
  }
]
```

#### GET /api/prompts
Retorna a coleção de prompts validada.

**Response:** Objeto `ColecaoPrompts`

```json
{
  "descricao": "Uma coleção de prompts...",
  "data_atualizacao": "2025-11-13T09:00:00Z",
  "marcador_de_paramentros": "{{param}}",
  "prompts": [...]
}
```

#### GET /api/historico_de_pratica
Retorna o histórico de prática validado. Se o arquivo não existir, retorna histórico vazio.

**Response:** Objeto `HistoricoPratica`

```json
{
  "exercicios": [...]
}
```

#### GET /api/frases_do_dialogo
Retorna as frases do diálogo validadas.

**Response:** Objeto `FrasesDialogo`

```json
{
  "saudacao": "Hallo",
  "despedida": "Tschüss",
  "intermediarias": ["Wie heißen Sie?", ...]
}
```

### Testar Endpoints

Com o servidor rodando, acesse:

- http://localhost:4010/ - Informações da API
- http://localhost:4010/api/base_de_conhecimento
- http://localhost:4010/api/prompts
- http://localhost:4010/api/historico_de_pratica
- http://localhost:4010/api/frases_do_dialogo

Ou use curl:

```bash
curl http://localhost:4010/api/base_de_conhecimento
```

### Documentação Interativa

FastAPI gera automaticamente documentação interativa:

- Swagger UI: http://localhost:4010/docs
- ReDoc: http://localhost:4010/redoc

## Testes

### Executar Testes

```bash
pytest backend/test_api.py -v
```

Ou use o script auxiliar:

```bash
run_tests.bat
```

### Casos de Teste

O arquivo `test_api.py` contém 50+ casos de teste cobrindo:

- Endpoints individuais (GET requests)
- Validação de estrutura de dados
- Validação Pydantic
- Testes de integração
- Tratamento de erros
- Performance básica
- Documentação automática

### Cobertura de Testes

Para gerar relatório de cobertura:

```bash
pip install pytest-cov
pytest backend/test_api.py --cov=backend --cov-report=html
```

Veja o relatório em `htmlcov/index.html`.
