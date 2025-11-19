"""
Servidor FastAPI para o sistema de estudo de idiomas.
Fornece endpoints para carregar e validar os dados da aplicação.
"""
import os
import json
from pathlib import Path
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from dotenv import load_dotenv

from models import (
    ConhecimentoIdioma,
    ColecaoPrompts,
    HistoricoPratica,
    FrasesDialogo
)

# Carregar variáveis de ambiente
load_dotenv()

# Configuração
BACKEND_PORT = int(os.getenv("BACKEND_PORT", 4010))
# PUBLIC_DIR deve apontar para a pasta public na raiz do projeto
PUBLIC_DIR = Path(__file__).parent.parent / "public"

# Criar aplicação FastAPI
app = FastAPI(
    title="API de Estudo de Idiomas",
    description="API para gerenciar conhecimentos, prompts, histórico e diálogos",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def carregar_json(caminho: Path):
    """Carrega e retorna dados de um arquivo JSON."""
    try:
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Arquivo não encontrado: {caminho}"
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao decodificar JSON: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao ler arquivo: {str(e)}"
        )


def salvar_json(caminho: Path, dados: dict):
    """Salva dados em um arquivo JSON."""
    try:
        # Criar backup antes de salvar
        if caminho.exists():
            backup_path = caminho.with_suffix('.json.backup')
            with open(caminho, 'r', encoding='utf-8') as f:
                backup_data = f.read()
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(backup_data)
        
        # Salvar novos dados
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2)
        
        return True
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar arquivo: {str(e)}"
        )


@app.get("/")
def root():
    """Endpoint raiz com informações da API."""
    return {
        "mensagem": "API de Estudo de Idiomas",
        "versao": "1.0.0",
        "endpoints": {
            "base_de_conhecimento": "/api/base_de_conhecimento",
            "prompts": "/api/prompts",
            "historico_de_pratica": "/api/historico_de_pratica",
            "frases_do_dialogo": "/api/frases_do_dialogo"
        }
    }


@app.get("/api/base_de_conhecimento", response_model=List[ConhecimentoIdioma])
def get_base_de_conhecimento():
    """
    Carrega e valida a base de conhecimento de idiomas.
    
    Returns:
        Lista de conhecimentos de idiomas validados.
    
    Raises:
        HTTPException: Se o arquivo não existir, estiver vazio ou inválido.
    """
    caminho = PUBLIC_DIR / "[BASE] Conhecimento de idiomas.json"
    dados = carregar_json(caminho)
    
    # Validar que não está vazio
    if not dados or len(dados) == 0:
        raise HTTPException(
            status_code=400,
            detail="Base de conhecimento não pode estar vazia"
        )
    
    # Validar cada item contra o modelo Pydantic
    try:
        conhecimentos = [ConhecimentoIdioma(**item) for item in dados]
        return conhecimentos
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Erro de validação: {e.errors()}"
        )


@app.put("/api/base_de_conhecimento", response_model=List[ConhecimentoIdioma])
def update_base_de_conhecimento(conhecimentos: List[ConhecimentoIdioma]):
    """
    Atualiza a base de conhecimento de idiomas.
    
    Args:
        conhecimentos: Lista de conhecimentos validados.
    
    Returns:
        Lista de conhecimentos atualizada.
    
    Raises:
        HTTPException: Se houver erro ao salvar o arquivo.
    """
    caminho = PUBLIC_DIR / "[BASE] Conhecimento de idiomas.json"
    
    # Validar que não está vazio
    if not conhecimentos or len(conhecimentos) == 0:
        raise HTTPException(
            status_code=400,
            detail="Base de conhecimento não pode estar vazia"
        )
    
    # Validar IDs únicos
    conhecimento_ids = [c.conhecimento_id for c in conhecimentos]
    if len(conhecimento_ids) != len(set(conhecimento_ids)):
        raise HTTPException(
            status_code=400,
            detail="IDs de conhecimentos devem ser únicos"
        )
    
    # Converter para dict e salvar
    try:
        dados = [c.model_dump(mode='json') for c in conhecimentos]
        salvar_json(caminho, dados)
        return conhecimentos
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar conhecimentos: {str(e)}"
        )


@app.get("/api/prompts", response_model=ColecaoPrompts)
def get_prompts():
    """
    Carrega e valida a coleção de prompts.
    
    Returns:
        Coleção de prompts validada.
    
    Raises:
        HTTPException: Se o arquivo não existir, estiver vazio ou inválido.
    """
    caminho = PUBLIC_DIR / "[BASE] Prompts.json"
    dados = carregar_json(caminho)
    
    # Validar que não está vazio
    if not dados:
        raise HTTPException(
            status_code=400,
            detail="Coleção de prompts não pode estar vazia"
        )
    
    # Validar contra o modelo Pydantic
    try:
        colecao = ColecaoPrompts(**dados)
        return colecao
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Erro de validação: {e.errors()}"
        )


@app.put("/api/prompts", response_model=ColecaoPrompts)
def update_prompts(colecao: ColecaoPrompts):
    """
    Atualiza a coleção de prompts.
    
    Args:
        colecao: Nova coleção de prompts validada.
    
    Returns:
        Coleção de prompts atualizada.
    
    Raises:
        HTTPException: Se houver erro ao salvar o arquivo.
    """
    caminho = PUBLIC_DIR / "[BASE] Prompts.json"
    
    # Validar que não está vazio
    if not colecao.prompts or len(colecao.prompts) == 0:
        raise HTTPException(
            status_code=400,
            detail="Coleção de prompts não pode estar vazia"
        )
    
    # Validar IDs únicos
    prompt_ids = [p.prompt_id for p in colecao.prompts]
    if len(prompt_ids) != len(set(prompt_ids)):
        raise HTTPException(
            status_code=400,
            detail="IDs de prompts devem ser únicos"
        )
    
    # Converter para dict e salvar
    try:
        dados = colecao.model_dump(mode='json')
        salvar_json(caminho, dados)
        return colecao
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar prompts: {str(e)}"
        )


@app.get("/api/historico_de_pratica", response_model=HistoricoPratica)
def get_historico_de_pratica():
    """
    Carrega e valida o histórico de prática.
    Se o arquivo não existir, retorna um histórico vazio.
    
    Returns:
        Histórico de prática validado.
    
    Raises:
        HTTPException: Se o arquivo existir mas estiver inválido.
    """
    caminho = PUBLIC_DIR / "[BASE] Histórico de Prática.json"
    
    # Se não existir, retornar histórico vazio
    if not caminho.exists():
        return HistoricoPratica(exercicios=[])
    
    dados = carregar_json(caminho)
    
    # Validar que não está vazio (se existir, não pode estar vazio)
    if not dados:
        raise HTTPException(
            status_code=400,
            detail="Histórico de prática existe mas está vazio"
        )
    
    # Validar contra o modelo Pydantic
    try:
        historico = HistoricoPratica(**dados)
        return historico
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Erro de validação: {e.errors()}"
        )


@app.get("/api/frases_do_dialogo", response_model=FrasesDialogo)
def get_frases_do_dialogo():
    """
    Carrega e valida as frases do diálogo.
    
    Returns:
        Frases do diálogo validadas.
    
    Raises:
        HTTPException: Se o arquivo não existir, estiver vazio ou inválido.
    """
    caminho = PUBLIC_DIR / "[BASE] Frases do Diálogo.json"
    dados = carregar_json(caminho)
    
    # Validar que não está vazio
    if not dados:
        raise HTTPException(
            status_code=400,
            detail="Frases do diálogo não podem estar vazias"
        )
    
    # Validar contra o modelo Pydantic
    try:
        frases = FrasesDialogo(**dados)
        return frases
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Erro de validação: {e.errors()}"
        )


@app.put("/api/frases_do_dialogo", response_model=FrasesDialogo)
def update_frases_do_dialogo(frases: FrasesDialogo):
    """
    Atualiza as frases do diálogo.
    
    Args:
        frases: Frases do diálogo validadas.
    
    Returns:
        Frases do diálogo atualizadas.
    
    Raises:
        HTTPException: Se houver erro ao salvar o arquivo.
    """
    caminho = PUBLIC_DIR / "[BASE] Frases do Diálogo.json"
    
    # Validar que campos obrigatórios não estão vazios
    if not frases.saudacao or not frases.saudacao.strip():
        raise HTTPException(
            status_code=400,
            detail="Saudação não pode estar vazia"
        )
    
    if not frases.despedida or not frases.despedida.strip():
        raise HTTPException(
            status_code=400,
            detail="Despedida não pode estar vazia"
        )
    
    if not frases.intermediarias or len(frases.intermediarias) == 0:
        raise HTTPException(
            status_code=400,
            detail="Deve haver pelo menos uma frase intermediária"
        )
    
    # Validar que frases intermediárias não estão vazias
    if any(not f or not f.strip() for f in frases.intermediarias):
        raise HTTPException(
            status_code=400,
            detail="Frases intermediárias não podem estar vazias"
        )
    
    # Converter para dict e salvar
    try:
        dados = frases.model_dump(mode='json')
        salvar_json(caminho, dados)
        return frases
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar frases: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    print(f"Iniciando servidor na porta {BACKEND_PORT}...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=BACKEND_PORT,
        reload=True
    )
