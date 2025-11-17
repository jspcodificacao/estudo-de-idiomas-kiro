"""
Modelos Pydantic2 para os schemas JSON do sistema de estudo de idiomas.
Baseado nos schemas JSON da pasta /public com [SCHEMA] no nome.
"""
from datetime import datetime
from typing import List, Optional, Literal, Any, Dict, Union
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, model_validator, HttpUrl
from enum import Enum


# ============================================================================
# Modelos para: [BASE][SCHEMA] Conhecimento de idiomas.json
# ============================================================================

class Idioma(str, Enum):
    """Idiomas suportados no sistema."""
    ALEMAO = "alemao"
    INGLES = "ingles"


class TipoConhecimento(str, Enum):
    """Tipos de conhecimento suportados."""
    FRASE = "frase"
    PALAVRA = "palavra"


class ConhecimentoIdioma(BaseModel):
    """
    Registro de Conhecimento - Um único registro de conhecimento de um idioma.
    Schema: Define a estrutura e as restrições para um arquivo de conhecimento de idiomas.
    """
    conhecimento_id: UUID = Field(
        ...,
        description="Identificador único universal (UUID) para o registro. Obrigatório e não pode ser vazio."
    )
    data_hora: datetime = Field(
        ...,
        description="Data e hora da criação/modificação no formato ISO 8601. Obrigatório e não pode ser vazio."
    )
    idioma: Idioma = Field(
        ...,
        description="O idioma ao qual o conhecimento se refere. Deve ser 'alemao' ou 'ingles'."
    )
    tipo_conhecimento: TipoConhecimento = Field(
        ...,
        description="O tipo de conhecimento. Deve ser 'frase' ou 'palavra'."
    )
    texto_original: str = Field(
        ...,
        min_length=1,
        description="O texto no idioma original. Obrigatório e não pode ser vazio."
    )
    transcricao_ipa: Optional[str] = Field(
        None,
        description="Transcrição fonética opcional usando o Alfabeto Fonético Internacional (IPA)."
    )
    traducao: str = Field(
        ...,
        min_length=1,
        description="A tradução do texto original. Obrigatório e não pode ser vazio."
    )
    divisao_silabica: Optional[str] = Field(
        None,
        description="A divisão silábica opcional do texto original."
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "conhecimento_id": "40986742-86a6-4bc6-bae3-41e34ce5298d",
                "data_hora": "2025-10-05T14:35:06.829Z",
                "idioma": "alemao",
                "tipo_conhecimento": "frase",
                "texto_original": "Hallo!",
                "transcricao_ipa": "haˈloː",
                "traducao": "Olá!",
                "divisao_silabica": "Hal-lo"
            }
        }
    }


# Lista de conhecimentos (array conforme schema)
ConhecimentosIdiomas = List[ConhecimentoIdioma]


# ============================================================================
# Modelos para: [BASE][SCHEMA] Prompts.json
# ============================================================================

class Prompt(BaseModel):
    """
    Definição detalhada de cada prompt.
    """
    prompt_id: str = Field(
        ...,
        description="Um identificador único para cada prompt."
    )
    descricao: str = Field(
        ...,
        description="Uma explicação detalhada da finalidade e do funcionamento do prompt."
    )
    template: str = Field(
        ...,
        description="O texto base do prompt, incluindo os marcadores para substituição de parâmetros."
    )
    parametros: List[str] = Field(
        ...,
        description="Uma lista de strings, onde cada string é um nome de parâmetro esperado pelo template."
    )
    resposta_estruturada: bool = Field(
        ...,
        description="Um valor booleano que indica se a resposta esperada para o prompt deve ser um JSON estruturado."
    )
    estrutura_esperada: Optional[Dict[str, Any]] = Field(
        None,
        description="Um objeto que define a estrutura do JSON de resposta quando 'resposta_estruturada' é verdadeiro."
    )
    ultima_edicao: datetime = Field(
        ...,
        description="A data e hora da última modificação deste prompt específico, no formato ISO 8601."
    )


class ColecaoPrompts(BaseModel):
    """
    Schema de Prompts - Define uma coleção de prompts, seus parâmetros e as estruturas de resposta esperadas.
    """
    descricao: str = Field(
        ...,
        description="Uma breve descrição do propósito geral do conjunto de prompts."
    )
    data_atualizacao: datetime = Field(
        ...,
        description="A data e hora da última atualização do arquivo de prompts, em conformidade com o formato ISO 8601."
    )
    marcador_de_paramentros: str = Field(
        ...,
        description="A string usada para delimitar os parâmetros dentro do template do prompt."
    )
    prompts: List[Prompt] = Field(
        ...,
        description="Uma lista contendo as definições detalhadas de cada prompt."
    )


# ============================================================================
# Modelos para: [BASE][SCHEMA] Histórico de Prática.json
# ============================================================================

class TipoPratica(str, Enum):
    """Tipos de prática suportados."""
    TRADUCAO = "traducao"
    AUDICAO = "audicao"
    PRONUNCIA = "pronuncia"
    DIALOGO = "dialogo"
    PRONUNCIA_DE_NUMEROS = "pronuncia_de_numeros"


class CampoTraducao(str, Enum):
    """Campos válidos para exercícios de tradução."""
    TEXTO_ORIGINAL = "texto_original"
    DIVISAO_SILABICA = "divisao_silabica"
    TRANSCRICAO_IPA = "transcricao_ipa"
    TRADUCAO = "traducao"


class VelocidadeAudio(str, Enum):
    """Velocidades de áudio suportadas."""
    NORMAL = "1.0"
    LENTA = "0.75"
    MUITO_LENTA = "0.5"


class ResultadoCorrecao(str, Enum):
    """Resultados de correção possíveis."""
    SIM = "Sim"
    PARCIAL = "Parcial"
    NAO = "Não"


class ResultadoTraducao(BaseModel):
    """
    Resultado de exercício de tradução.
    Restrições: campos_preenchidos, valores_preenchidos e campos_resultados devem ter o mesmo tamanho (1-3 itens).
    """
    campo_fornecido: CampoTraducao = Field(
        ...,
        description="Campo fornecido ao usuário"
    )
    campos_preenchidos: List[CampoTraducao] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="Campos que o usuário preencheu (1-3 itens únicos)"
    )
    valores_preenchidos: List[str] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="Valores fornecidos pelo usuário (1-3 itens únicos)"
    )
    campos_resultados: List[bool] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="Resultado de cada campo (correto/incorreto, 1-3 itens)"
    )

    @model_validator(mode='after')
    def validar_tamanhos_listas(self):
        """Valida que as três listas têm o mesmo tamanho conforme schema."""
        tamanho = len(self.campos_preenchidos)
        if not (len(self.valores_preenchidos) == tamanho and len(self.campos_resultados) == tamanho):
            raise ValueError(
                "campos_preenchidos, valores_preenchidos e campos_resultados devem ter o mesmo tamanho"
            )
        # Valida unicidade de campos_preenchidos
        if len(self.campos_preenchidos) != len(set(self.campos_preenchidos)):
            raise ValueError("campos_preenchidos deve conter itens únicos")
        # Valida unicidade de valores_preenchidos
        if len(self.valores_preenchidos) != len(set(self.valores_preenchidos)):
            raise ValueError("valores_preenchidos deve conter itens únicos")
        return self


class ResultadoAudicao(BaseModel):
    """Resultado de exercício de audição."""
    texto_original: str = Field(..., description="Texto original do áudio")
    transcricao_usuario: str = Field(..., description="Transcrição fornecida pelo usuário")
    correto: bool = Field(..., description="Se a transcrição está correta")
    velocidade_utilizada: VelocidadeAudio = Field(
        ...,
        description="Velocidade do áudio utilizada: 1.0, 0.75 ou 0.5"
    )


class ResultadoPronuncia(BaseModel):
    """Resultado de exercício de pronúncia."""
    texto_original: str = Field(..., description="Texto que deveria ser pronunciado")
    transcricao_stt: str = Field(..., description="Transcrição obtida via STT")
    correto: ResultadoCorrecao = Field(
        ...,
        description="Status de correção: Sim, Parcial ou Não"
    )
    comentario: str = Field(..., description="Comentário sobre a pronúncia")


class ResultadoDialogo(BaseModel):
    """Resultado de exercício de diálogo."""
    correto: ResultadoCorrecao = Field(
        ...,
        description="Se o diálogo foi realizado corretamente: Sim, Parcial ou Não"
    )


class ResultadoPronunciaNumeros(BaseModel):
    """Resultado de exercício de pronúncia de números."""
    numero_referencia: str = Field(..., description="Número de referência")
    audio_usuario_url: HttpUrl = Field(
        ...,
        description="URL do áudio gravado pelo usuário"
    )
    transcricao_correta: str = Field(..., description="Transcrição correta do número")
    acertou: bool = Field(..., description="Se o usuário acertou a pronúncia")


class ExercicioPratica(BaseModel):
    """
    Representa um exercício de prática realizado pelo usuário.
    Schema: Valida uma lista de exercícios de prática de idiomas.
    A estrutura de resultado_exercicio varia conforme o tipo_pratica (oneOf no schema).
    """
    data_hora: datetime = Field(
        ...,
        description="Data e hora em que o exercício foi realizado, em formato ISO 8601."
    )
    exercicio_id: UUID = Field(
        ...,
        description="Identificador único para o registro do exercício."
    )
    conhecimento_id: UUID = Field(
        ...,
        description="Identificador único para o conhecimento (ex: palavra, frase) sendo praticado."
    )
    idioma: Idioma = Field(
        ...,
        description="O idioma que está sendo praticado."
    )
    tipo_pratica: TipoPratica = Field(
        ...,
        description="O tipo de exercício de prática realizado."
    )
    resultado_exercicio: Union[
        ResultadoTraducao,
        ResultadoAudicao,
        ResultadoPronuncia,
        ResultadoDialogo,
        ResultadoPronunciaNumeros
    ] = Field(
        ...,
        description="Um objeto contendo os resultados detalhados do exercício, cuja estrutura varia com o 'tipo_pratica'."
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "data_hora": "2025-11-13T09:15:00Z",
                "exercicio_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                "conhecimento_id": "f0e9d8c7-b6a5-4321-fedc-ba9876543210",
                "idioma": "alemao",
                "tipo_pratica": "traducao",
                "resultado_exercicio": {
                    "campo_fornecido": "traducao",
                    "campos_preenchidos": ["texto_original", "transcricao_ipa"],
                    "valores_preenchidos": ["das Mädchen", "/ˈmɛːtçən/"],
                    "campos_resultados": [True, True]
                }
            }
        }
    }


class HistoricoPratica(BaseModel):
    """
    Schema de Exercícios de Idiomas - Valida uma lista de exercícios de prática de idiomas.
    """
    exercicios: List[ExercicioPratica] = Field(
        ...,
        description="Uma lista de exercícios realizados."
    )


# ============================================================================
# Modelos para: [BASE][SCHEMA] Frases do diálogo.json
# ============================================================================

class FrasesDialogo(BaseModel):
    """
    Frases do Diálogo - Estrutura de frases para exercícios de diálogo.
    Schema: additionalProperties=false (não permite propriedades extras).
    """
    saudacao: str = Field(
        ...,
        description="A frase de saudação."
    )
    despedida: str = Field(
        ...,
        description="A frase de despedida."
    )
    intermediarias: List[str] = Field(
        ...,
        min_length=1,
        description="Lista de frases intermediárias (mínimo 1 item)."
    )

    model_config = {
        "extra": "forbid",  # Corresponde a additionalProperties: false
        "json_schema_extra": {
            "example": {
                "saudacao": "Hallo",
                "despedida": "Tschüss",
                "intermediarias": [
                    "Wie heißen Sie?",
                    "Wie groß sind Sie?",
                    "Wie alt sind Sie?",
                    "Wie viel wiegen Sie?"
                ]
            }
        }
    }
