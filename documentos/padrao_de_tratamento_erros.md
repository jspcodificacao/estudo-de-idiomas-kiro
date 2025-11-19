# Padrão de Tratamento de Erros

Este documento define o padrão unificado de tratamento de erros para toda a aplicação de estudo de idiomas, garantindo consistência entre backend (FastAPI) e frontend (React + TypeScript).

## Princípios Gerais

1. **Consistência**: Todos os erros seguem a mesma estrutura em toda a aplicação
2. **Clareza**: Mensagens de erro devem ser claras e acionáveis
3. **Rastreabilidade**: Erros devem incluir contexto suficiente para debugging
4. **Segurança**: Não expor detalhes internos sensíveis ao usuário final
5. **Internacionalização**: Mensagens devem ser preparadas para i18n quando necessário

## Estrutura Padrão de Erro

### Backend (FastAPI)

Todos os erros retornados pela API seguem esta estrutura JSON:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem legível para o usuário",
    "details": "Detalhes técnicos adicionais (opcional)",
    "field": "nome_do_campo (opcional, para erros de validação)",
    "timestamp": "2025-11-19T10:30:00Z"
  }
}
```

### Códigos de Status HTTP

| Status | Uso | Exemplo |
|--------|-----|---------|
| 400 | Bad Request - Dados inválidos ou malformados | Arquivo JSON vazio, parâmetros faltando |
| 404 | Not Found - Recurso não encontrado | Arquivo não existe, endpoint inexistente |
| 422 | Unprocessable Entity - Erro de validação | Dados não passam na validação Pydantic |
| 500 | Internal Server Error - Erro interno do servidor | Erro inesperado, falha de sistema |
| 503 | Service Unavailable - Serviço temporariamente indisponível | Banco de dados offline |

### Códigos de Erro Padronizados

#### Erros de Arquivo (FILE_*)
- `FILE_NOT_FOUND`: Arquivo não encontrado
- `FILE_EMPTY`: Arquivo existe mas está vazio
- `FILE_INVALID_JSON`: JSON malformado ou inválido
- `FILE_READ_ERROR`: Erro ao ler arquivo

#### Erros de Validação (VALIDATION_*)
- `VALIDATION_ERROR`: Erro genérico de validação
- `VALIDATION_FIELD_REQUIRED`: Campo obrigatório ausente
- `VALIDATION_FIELD_INVALID`: Campo com valor inválido
- `VALIDATION_ARRAY_SIZE`: Array com tamanho inválido
- `VALIDATION_ENUM_INVALID`: Valor não está no enum permitido

#### Erros de Negócio (BUSINESS_*)
- `BUSINESS_EMPTY_COLLECTION`: Coleção não pode estar vazia
- `BUSINESS_DUPLICATE_ID`: ID duplicado
- `BUSINESS_INVALID_STATE`: Estado inválido para operação

#### Erros de Sistema (SYSTEM_*)
- `SYSTEM_INTERNAL_ERROR`: Erro interno não especificado
- `SYSTEM_SERVICE_UNAVAILABLE`: Serviço indisponível

## Implementação no Backend

### Classe de Erro Customizada

```python
# backend/errors.py
from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Classe base para erros da aplicação."""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: Optional[str] = None,
        field: Optional[str] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        self.field = field
        self.timestamp = datetime.utcnow().isoformat() + "Z"
        super().__init__(self.message)
    
    def to_dict(self):
        """Converte o erro para dicionário."""
        error_dict = {
            "code": self.code,
            "message": self.message,
            "timestamp": self.timestamp
        }
        if self.details:
            error_dict["details"] = self.details
        if self.field:
            error_dict["field"] = self.field
        return {"error": error_dict}


class FileNotFoundError(AppError):
    """Arquivo não encontrado."""
    def __init__(self, filepath: str):
        super().__init__(
            code="FILE_NOT_FOUND",
            message=f"Arquivo não encontrado: {filepath}",
            status_code=404
        )


class FileEmptyError(AppError):
    """Arquivo vazio."""
    def __init__(self, filepath: str):
        super().__init__(
            code="FILE_EMPTY",
            message=f"Arquivo está vazio: {filepath}",
            status_code=400
        )


class ValidationError(AppError):
    """Erro de validação."""
    def __init__(self, message: str, details: Optional[str] = None, field: Optional[str] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details,
            field=field
        )
```

### Handler Global de Erros

```python
# backend/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from errors import AppError

app = FastAPI()

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    """Handler para erros customizados da aplicação."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )

@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    """Handler para erros não tratados."""
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "SYSTEM_INTERNAL_ERROR",
                "message": "Erro interno do servidor",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    )
```

### Uso nos Endpoints

```python
from errors import FileNotFoundError, FileEmptyError, ValidationError

@app.get("/api/base_de_conhecimento")
def get_base_de_conhecimento():
    caminho = PUBLIC_DIR / "[BASE] Conhecimento de idiomas.json"
    
    # Verificar se arquivo existe
    if not caminho.exists():
        raise FileNotFoundError(str(caminho))
    
    # Carregar dados
    dados = carregar_json(caminho)
    
    # Validar que não está vazio
    if not dados or len(dados) == 0:
        raise FileEmptyError(str(caminho))
    
    # Validar com Pydantic
    try:
        conhecimentos = [ConhecimentoIdioma(**item) for item in dados]
        return conhecimentos
    except PydanticValidationError as e:
        raise ValidationError(
            message="Erro de validação nos dados",
            details=str(e.errors())
        )
```

## Implementação no Frontend

### Interface de Erro

```typescript
// frontend/src/types/errors.ts
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
```

### Classe de Tratamento de Erros

```typescript
// frontend/src/utils/errorHandler.ts
import { ApiError, ApiErrorResponse } from '../types/errors';

export class ErrorHandler {
  /**
   * Extrai erro da resposta da API
   */
  static async extractError(response: Response): Promise<ApiError> {
    try {
      const data: ApiErrorResponse = await response.json();
      return data.error;
    } catch {
      return {
        code: 'SYSTEM_INTERNAL_ERROR',
        message: 'Erro ao processar resposta do servidor',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Converte erro para mensagem amigável ao usuário
   */
  static getUserMessage(error: ApiError): string {
    const messages: Record<string, string> = {
      'FILE_NOT_FOUND': 'Arquivo não encontrado. Verifique se os dados estão disponíveis.',
      'FILE_EMPTY': 'Arquivo está vazio. Não há dados para exibir.',
      'VALIDATION_ERROR': 'Dados inválidos. Verifique as informações fornecidas.',
      'SYSTEM_INTERNAL_ERROR': 'Erro interno do servidor. Tente novamente mais tarde.'
    };

    return messages[error.code] || error.message;
  }

  /**
   * Loga erro para debugging
   */
  static logError(error: ApiError, context?: string): void {
    console.error('[Error]', {
      context,
      code: error.code,
      message: error.message,
      details: error.details,
      field: error.field,
      timestamp: error.timestamp
    });
  }
}
```

### Hook React para Tratamento de Erros

```typescript
// frontend/src/hooks/useApiError.ts
import { useState } from 'react';
import { ApiError } from '../types/errors';
import { ErrorHandler } from '../utils/errorHandler';

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const [userMessage, setUserMessage] = useState<string>('');

  const handleError = async (response: Response, context?: string) => {
    const apiError = await ErrorHandler.extractError(response);
    setError(apiError);
    setUserMessage(ErrorHandler.getUserMessage(apiError));
    ErrorHandler.logError(apiError, context);
  };

  const clearError = () => {
    setError(null);
    setUserMessage('');
  };

  return {
    error,
    userMessage,
    handleError,
    clearError
  };
}
```

### Componente de Exibição de Erro

```typescript
// frontend/src/components/ErrorDisplay.tsx
import React from 'react';
import { ApiError } from '../types/errors';

interface ErrorDisplayProps {
  error: ApiError | null;
  userMessage: string;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, userMessage, onDismiss }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="error-container bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold mb-1">Erro</h3>
          <p className="text-red-700">{userMessage}</p>
          {process.env.NODE_ENV === 'development' && error.details && (
            <details className="mt-2">
              <summary className="text-sm text-red-600 cursor-pointer">
                Detalhes técnicos
              </summary>
              <pre className="text-xs text-red-600 mt-1 overflow-auto">
                {error.details}
              </pre>
            </details>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
```

### Uso em Componentes

```typescript
// frontend/src/components/KnowledgeList.tsx
import React, { useEffect, useState } from 'react';
import { useApiError } from '../hooks/useApiError';
import { ErrorDisplay } from './ErrorDisplay';

export function KnowledgeList() {
  const [data, setData] = useState([]);
  const { error, userMessage, handleError, clearError } = useApiError();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:5010/api/base_de_conhecimento');
        
        if (!response.ok) {
          await handleError(response, 'KnowledgeList.fetchData');
          return;
        }
        
        const result = await response.json();
        setData(result);
        clearError();
      } catch (err) {
        console.error('Network error:', err);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <ErrorDisplay 
        error={error} 
        userMessage={userMessage} 
        onDismiss={clearError}
      />
      {/* Renderizar dados */}
    </div>
  );
}
```

## Boas Práticas

### Backend
1. Sempre use as classes de erro customizadas ao invés de `HTTPException` diretamente
2. Inclua contexto suficiente nas mensagens de erro
3. Use códigos de erro consistentes
4. Não exponha stack traces em produção
5. Logue erros internos para análise posterior

### Frontend
1. Sempre trate erros de API usando o `ErrorHandler`
2. Mostre mensagens amigáveis ao usuário
3. Mantenha detalhes técnicos apenas em modo desenvolvimento
4. Permita que usuários fechem mensagens de erro
5. Considere retry automático para erros de rede

## Exemplos de Cenários

### Cenário 1: Arquivo não encontrado
**Backend:**
```python
raise FileNotFoundError("/public/dados.json")
```

**Resposta HTTP 404:**
```json
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "Arquivo não encontrado: /public/dados.json",
    "timestamp": "2025-11-19T10:30:00Z"
  }
}
```

**Frontend:**
```typescript
// Usuário vê: "Arquivo não encontrado. Verifique se os dados estão disponíveis."
```

### Cenário 2: Erro de validação
**Backend:**
```python
raise ValidationError(
    message="Campo 'idioma' é obrigatório",
    field="idioma"
)
```

**Resposta HTTP 422:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo 'idioma' é obrigatório",
    "field": "idioma",
    "timestamp": "2025-11-19T10:30:00Z"
  }
}
```

**Frontend:**
```typescript
// Usuário vê: "Dados inválidos. Verifique as informações fornecidas."
// Campo 'idioma' é destacado
```

## Manutenção

Este padrão deve ser revisado periodicamente para:
- Adicionar novos códigos de erro conforme necessário
- Atualizar mensagens para melhor clareza
- Incorporar feedback dos usuários
- Adaptar para novos requisitos de internacionalização

---

**Última atualização:** 2025-11-19  
**Versão:** 1.0.0
