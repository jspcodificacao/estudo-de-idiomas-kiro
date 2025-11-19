# API Endpoint: PUT /api/prompts

## Visão Geral

Endpoint para atualizar a coleção completa de prompts do sistema. Realiza validação, backup automático e persistência em arquivo JSON.

## Detalhes do Endpoint

### URL
```
PUT /api/prompts
```

### Headers
```
Content-Type: application/json
```

### Body (Request)

```json
{
  "descricao": "Uma coleção de prompts para tarefas de geração e manipulação de texto.",
  "data_atualizacao": "2025-11-19T12:00:00Z",
  "marcador_de_paramentros": "{{param}}",
  "prompts": [
    {
      "prompt_id": "gerador_resumo_v1",
      "descricao": "Cria um resumo de um texto fornecido pelo usuário",
      "template": "Por favor, gere um resumo conciso do seguinte texto: '{{texto_completo}}'",
      "parametros": ["texto_completo", "numero_de_paragrafos"],
      "resposta_estruturada": true,
      "estrutura_esperada": {
        "type": "object",
        "properties": {
          "resumo_gerado": { "type": "string" }
        }
      },
      "ultima_edicao": "2025-11-13T08:45:00Z"
    }
  ]
}
```

### Response (Success - 200)

```json
{
  "descricao": "Uma coleção de prompts para tarefas de geração e manipulação de texto.",
  "data_atualizacao": "2025-11-19T12:00:00Z",
  "marcador_de_paramentros": "{{param}}",
  "prompts": [...]
}
```

### Response (Error - 400)

```json
{
  "detail": "Coleção de prompts não pode estar vazia"
}
```

ou

```json
{
  "detail": "IDs de prompts devem ser únicos"
}
```

### Response (Error - 422)

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "prompts", 0, "prompt_id"],
      "msg": "Field required"
    }
  ]
}
```

### Response (Error - 500)

```json
{
  "detail": "Erro ao salvar arquivo: [mensagem de erro]"
}
```

## Validações

### 1. Validação de Schema (Pydantic)
Todos os campos são validados contra o modelo `ColecaoPrompts`:

**Campos Obrigatórios da Coleção:**
- `descricao` (string)
- `data_atualizacao` (datetime ISO 8601)
- `marcador_de_paramentros` (string)
- `prompts` (array, não vazio)

**Campos Obrigatórios de Cada Prompt:**
- `prompt_id` (string)
- `descricao` (string)
- `template` (string)
- `parametros` (array de strings)
- `resposta_estruturada` (boolean)
- `ultima_edicao` (datetime ISO 8601)

**Campos Opcionais:**
- `estrutura_esperada` (object, obrigatório se `resposta_estruturada` = true)

### 2. Validação de Negócio

#### Coleção Não Vazia
```python
if not colecao.prompts or len(colecao.prompts) == 0:
    raise HTTPException(status_code=400, detail="Coleção de prompts não pode estar vazia")
```

#### IDs Únicos
```python
prompt_ids = [p.prompt_id for p in colecao.prompts]
if len(prompt_ids) != len(set(prompt_ids)):
    raise HTTPException(status_code=400, detail="IDs de prompts devem ser únicos")
```

## Sistema de Backup

### Funcionamento
1. Antes de salvar, verifica se o arquivo existe
2. Se existir, cria uma cópia com extensão `.backup`
3. Salva os novos dados
4. Em caso de erro, o backup pode ser restaurado manualmente

### Localização do Backup
```
public/[BASE] Prompts.json.backup
```

### Restauração Manual
```bash
# Windows
copy "public\[BASE] Prompts.json.backup" "public\[BASE] Prompts.json"

# Linux/Mac
cp "public/[BASE] Prompts.json.backup" "public/[BASE] Prompts.json"
```

## Formato do Arquivo Salvo

O arquivo é salvo com:
- **Encoding**: UTF-8
- **Formato**: JSON indentado (2 espaços)
- **ensure_ascii**: False (permite caracteres Unicode)

```python
json.dump(dados, f, ensure_ascii=False, indent=2)
```

## Exemplo de Uso

### cURL

```bash
curl -X PUT http://localhost:5010/api/prompts \
  -H "Content-Type: application/json" \
  -d @prompts.json
```

### Python (requests)

```python
import requests

colecao = {
    "descricao": "Coleção de prompts",
    "data_atualizacao": "2025-11-19T12:00:00Z",
    "marcador_de_paramentros": "{{param}}",
    "prompts": [...]
}

response = requests.put(
    "http://localhost:5010/api/prompts",
    json=colecao
)

if response.status_code == 200:
    print("Salvo com sucesso!")
else:
    print(f"Erro: {response.json()}")
```

### JavaScript (fetch)

```javascript
const colecao = {
  descricao: "Coleção de prompts",
  data_atualizacao: new Date().toISOString(),
  marcador_de_paramentros: "{{param}}",
  prompts: [...]
};

const response = await fetch('http://localhost:5010/api/prompts', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(colecao)
});

if (response.ok) {
  const data = await response.json();
  console.log('Salvo com sucesso!', data);
} else {
  const error = await response.json();
  console.error('Erro:', error);
}
```

## Segurança

### CORS
O endpoint está configurado com CORS permissivo para desenvolvimento:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**⚠️ Importante:** Em produção, configure `allow_origins` com as origens específicas permitidas.

### Validação de Entrada
- Todos os dados são validados com Pydantic
- Tipos são verificados automaticamente
- Campos obrigatórios são garantidos
- Formatos de data são validados

### Tratamento de Erros
- Erros de validação retornam 422 com detalhes
- Erros de negócio retornam 400 com mensagem clara
- Erros de sistema retornam 500 com mensagem genérica
- Stack traces não são expostos ao cliente

## Limitações

### Concorrência
- Não há controle de concorrência
- Última escrita vence (last-write-wins)
- Para ambientes multi-usuário, considerar:
  - Versionamento
  - Locks
  - Timestamps de modificação

### Tamanho
- Não há limite de tamanho configurado
- FastAPI tem limite padrão de 16MB para body
- Para arquivos maiores, ajustar configuração

### Performance
- Leitura/escrita síncrona de arquivo
- Para alto volume, considerar:
  - Cache em memória
  - Banco de dados
  - Operações assíncronas

## Testes

### Teste Automatizado
```bash
python backend/test_put_prompts.py
```

### Teste Manual
1. Buscar prompts atuais: `GET /api/prompts`
2. Modificar dados localmente
3. Enviar PUT com dados modificados
4. Verificar resposta
5. Buscar novamente para confirmar

## Monitoramento

### Logs
O servidor registra:
- Requisições recebidas
- Erros de validação
- Erros de sistema

### Métricas Sugeridas
- Taxa de sucesso/erro
- Tempo de resposta
- Tamanho dos payloads
- Frequência de uso

---

**Implementado em**: 2025-11-19  
**Versão**: 1.0.0  
**Autor**: Sistema de Estudo de Idiomas
