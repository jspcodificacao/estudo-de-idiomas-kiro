# Testes do Backend

Este documento descreve como realizar os testes do backend do sistema de estudo de idiomas.

## Pré-requisitos

- Python 3.8 ou superior
- Pydantic 2.x instalado

### Instalação de Dependências

```bash
pip install pydantic
```

## 1. Validação de Arquivos JSON

### Validar Todos os Arquivos

Execute o validador para verificar se todos os arquivos JSON estão corretos:

```bash
python backend/validator.py
```

### Saída Esperada

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

## 2. Testes dos Modelos Pydantic

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

## 3. Testes de Integração

### Carregar e Validar Arquivos Reais

```python
import json
from backend.models import ConhecimentoIdioma

# Carregar arquivo real
with open('public/[BASE] Conhecimento de idiomas.json', 'r', encoding='utf-8') as f:
    dados = json.load(f)

# Validar cada item
for item in dados:
    conhecimento = ConhecimentoIdioma(**item)
    print(f"✓ {conhecimento.texto_original}")
```

### Validação Programática

```python
from backend.validator import ValidadorJSON

validador = ValidadorJSON(pasta_public="public")

# Validar arquivo específico
resultado = validador.validar_conhecimento_idiomas()
print(f"Válido: {resultado.valido}")
if not resultado.valido:
    for erro in resultado.erros:
        print(f"  - {erro}")

# Validar todos
sucesso = validador.validar_todos()
```

## 4. Testes de Casos Especiais

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

## 5. Checklist de Testes

- [ ] Validador executa sem erros
- [ ] Todos os 4 arquivos JSON são validados
- [ ] Modelos Pydantic carregam dados corretamente
- [ ] Validações de campos obrigatórios funcionam
- [ ] Validações de enums funcionam
- [ ] Validações de UUID funcionam
- [ ] Validações de datetime funcionam
- [ ] Validações customizadas funcionam (tamanhos, unicidade)
- [ ] Histórico opcional é tratado corretamente
- [ ] Erros são reportados claramente

## 6. Solução de Problemas

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

## 7. Automação de Testes

Para integração contínua, adicione ao seu script de CI/CD:

```bash
# Instalar dependências
pip install pydantic

# Executar validação
python backend/validator.py

# Verificar código de saída
if %ERRORLEVEL% NEQ 0 (
    echo Validação falhou!
    exit /b 1
)
```

## Conclusão

Execute regularmente `python backend/validator.py` para garantir que todos os arquivos JSON estão corretos e seguem os schemas definidos.
