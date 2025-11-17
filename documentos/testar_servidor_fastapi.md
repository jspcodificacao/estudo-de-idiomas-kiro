# Testes do Servidor FastAPI

Este documento descreve como testar o servidor FastAPI do backend.

## Pré-requisitos

### Instalar Dependências

```bash
pip install -r backend/requirements.txt
```

Dependências necessárias:
- fastapi
- uvicorn
- pydantic
- python-dotenv

## 1. Iniciar o Servidor

### Método 1: Executar Diretamente

```bash
python backend/main.py
```

### Método 2: Usar Uvicorn

```bash
uvicorn backend.main:app --reload --port 4010
```

### Verificar Inicialização

Você deve ver:

```
INFO:     Uvicorn running on http://0.0.0.0:4010 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## 2. Testar Endpoints

### Usando o Navegador

Abra no navegador:

1. **Página inicial:** http://localhost:4010/
2. **Base de conhecimento:** http://localhost:4010/api/base_de_conhecimento
3. **Prompts:** http://localhost:4010/api/prompts
4. **Histórico:** http://localhost:4010/api/historico_de_pratica
5. **Frases do diálogo:** http://localhost:4010/api/frases_do_dialogo

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

# Testar endpoint raiz
response = requests.get("http://localhost:4010/")
print(response.json())

# Testar base de conhecimento
response = requests.get("http://localhost:4010/api/base_de_conhecimento")
conhecimentos = response.json()
print(f"Total de conhecimentos: {len(conhecimentos)}")

# Testar prompts
response = requests.get("http://localhost:4010/api/prompts")
prompts = response.json()
print(f"Total de prompts: {len(prompts['prompts'])}")

# Testar histórico
response = requests.get("http://localhost:4010/api/historico_de_pratica")
historico = response.json()
print(f"Total de exercícios: {len(historico['exercicios'])}")

# Testar frases do diálogo
response = requests.get("http://localhost:4010/api/frases_do_dialogo")
frases = response.json()
print(f"Saudação: {frases['saudacao']}")
print(f"Despedida: {frases['despedida']}")
```

## 3. Documentação Interativa

FastAPI gera automaticamente documentação interativa:

### Swagger UI

Acesse: http://localhost:4010/docs

Você pode:
- Ver todos os endpoints
- Ver schemas dos modelos
- Testar endpoints diretamente na interface
- Ver exemplos de request/response

### ReDoc

Acesse: http://localhost:4010/redoc

Documentação alternativa com layout diferente.

## 4. Testes de Validação

### Teste 1: Verificar Resposta Válida

```python
import requests

response = requests.get("http://localhost:4010/api/base_de_conhecimento")
assert response.status_code == 200
assert isinstance(response.json(), list)
assert len(response.json()) > 0
print("✓ Base de conhecimento retorna dados válidos")
```

### Teste 2: Verificar Estrutura dos Dados

```python
import requests

response = requests.get("http://localhost:4010/api/base_de_conhecimento")
conhecimento = response.json()[0]

# Verificar campos obrigatórios
assert "conhecimento_id" in conhecimento
assert "data_hora" in conhecimento
assert "idioma" in conhecimento
assert "tipo_conhecimento" in conhecimento
assert "texto_original" in conhecimento
assert "traducao" in conhecimento
print("✓ Estrutura de conhecimento está correta")
```

### Teste 3: Verificar Enums

```python
import requests

response = requests.get("http://localhost:4010/api/base_de_conhecimento")
conhecimentos = response.json()

for c in conhecimentos:
    assert c["idioma"] in ["alemao", "ingles"]
    assert c["tipo_conhecimento"] in ["frase", "palavra"]

print("✓ Enums estão corretos")
```

### Teste 4: Histórico Vazio (Opcional)

Se o arquivo de histórico não existir, deve retornar array vazio:

```python
import requests

response = requests.get("http://localhost:4010/api/historico_de_pratica")
assert response.status_code == 200
historico = response.json()
assert "exercicios" in historico
assert isinstance(historico["exercicios"], list)
print("✓ Histórico opcional funciona corretamente")
```

## 5. Testes de Erro

### Teste 1: Arquivo Corrompido

Simule um arquivo JSON inválido e verifique que o servidor retorna erro 500.

### Teste 2: Arquivo Vazio

Simule um arquivo vazio e verifique que o servidor retorna erro 400.

### Teste 3: Validação Pydantic

Simule dados que não passam na validação Pydantic e verifique erro 422.

## 6. Testes de Performance

### Teste de Carga Simples

```python
import requests
import time

# Testar 100 requisições
inicio = time.time()
for i in range(100):
    response = requests.get("http://localhost:4010/api/base_de_conhecimento")
    assert response.status_code == 200

fim = time.time()
tempo_total = fim - inicio
print(f"100 requisições em {tempo_total:.2f} segundos")
print(f"Média: {tempo_total/100*1000:.2f}ms por requisição")
```

## 7. Script de Teste Completo

Crie um arquivo `test_api.py`:

```python
import requests
import sys

BASE_URL = "http://localhost:4010"

def test_endpoint(name, url):
    """Testa um endpoint e retorna resultado."""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✓ {name}: OK")
            return True
        else:
            print(f"✗ {name}: Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"✗ {name}: Servidor não está rodando")
        return False
    except Exception as e:
        print(f"✗ {name}: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("TESTES DO SERVIDOR FASTAPI")
    print("=" * 60)
    print()
    
    testes = [
        ("Raiz", f"{BASE_URL}/"),
        ("Base de Conhecimento", f"{BASE_URL}/api/base_de_conhecimento"),
        ("Prompts", f"{BASE_URL}/api/prompts"),
        ("Histórico de Prática", f"{BASE_URL}/api/historico_de_pratica"),
        ("Frases do Diálogo", f"{BASE_URL}/api/frases_do_dialogo"),
    ]
    
    resultados = [test_endpoint(name, url) for name, url in testes]
    
    print()
    print("=" * 60)
    if all(resultados):
        print("✓ TODOS OS TESTES PASSARAM")
        sys.exit(0)
    else:
        print("✗ ALGUNS TESTES FALHARAM")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

Execute:

```bash
python test_api.py
```

## 8. Checklist de Testes

- [ ] Servidor inicia sem erros
- [ ] Porta correta (definida em .env)
- [ ] Endpoint raiz retorna informações
- [ ] /api/base_de_conhecimento retorna array válido
- [ ] /api/prompts retorna objeto válido
- [ ] /api/historico_de_pratica funciona (com ou sem arquivo)
- [ ] /api/frases_do_dialogo retorna objeto válido
- [ ] Documentação Swagger acessível em /docs
- [ ] Documentação ReDoc acessível em /redoc
- [ ] Validação Pydantic funciona corretamente
- [ ] Erros são tratados adequadamente

## 9. Solução de Problemas

### Erro: Address already in use

A porta 4010 já está em uso. Mude a porta em `.env` ou pare o processo:

```bash
# Windows
netstat -ano | findstr :4010
taskkill /PID <PID> /F
```

### Erro: ModuleNotFoundError

Instale as dependências:

```bash
pip install -r backend/requirements.txt
```

### Erro: File not found

Execute o servidor a partir da raiz do projeto onde a pasta `public` existe.

### Servidor não responde

Verifique se o servidor está rodando:

```bash
curl http://localhost:4010/
```

## 10. Integração com Frontend

O frontend deve fazer requisições para:

```javascript
const BASE_URL = 'http://localhost:4010';

// Carregar conhecimentos
fetch(`${BASE_URL}/api/base_de_conhecimento`)
  .then(res => res.json())
  .then(data => console.log(data));

// Carregar prompts
fetch(`${BASE_URL}/api/prompts`)
  .then(res => res.json())
  .then(data => console.log(data));
```

## Conclusão

Execute o servidor com `python backend/main.py` e teste todos os endpoints para garantir que a API está funcionando corretamente.
