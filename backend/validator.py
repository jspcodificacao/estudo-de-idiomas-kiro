"""
Validador de arquivos JSON contra schemas usando modelos Pydantic2.
Valida os arquivos de dados da pasta /public contra seus respectivos schemas.
"""
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from pydantic import ValidationError

from models import (
    ConhecimentoIdioma,
    ColecaoPrompts,
    HistoricoPratica,
    FrasesDialogo
)


class ResultadoValidacao:
    """Resultado da validação de um arquivo."""
    
    def __init__(self, arquivo: str, valido: bool, erros: Optional[List[str]] = None):
        self.arquivo = arquivo
        self.valido = valido
        self.erros = erros or []
    
    def __str__(self) -> str:
        status = "✓ VÁLIDO" if self.valido else "✗ INVÁLIDO"
        resultado = f"{status}: {self.arquivo}"
        if self.erros:
            resultado += "\n  Erros:"
            for erro in self.erros:
                resultado += f"\n    - {erro}"
        return resultado


class ValidadorJSON:
    """Validador de arquivos JSON da aplicação."""
    
    def __init__(self, pasta_public: str = "public"):
        self.pasta_public = Path(pasta_public)
        self.resultados: List[ResultadoValidacao] = []
    
    def _carregar_json(self, caminho: Path) -> Tuple[Optional[Any], Optional[str]]:
        """Carrega um arquivo JSON. Retorna (dados, erro)."""
        try:
            with open(caminho, 'r', encoding='utf-8') as f:
                return json.load(f), None
        except FileNotFoundError:
            return None, f"Arquivo não encontrado: {caminho}"
        except json.JSONDecodeError as e:
            return None, f"Erro ao decodificar JSON: {e}"
        except Exception as e:
            return None, f"Erro ao ler arquivo: {e}"
    
    def _validar_nao_vazio(self, dados: Any, nome_arquivo: str) -> Optional[str]:
        """Valida que os dados não estão vazios."""
        if dados is None:
            return f"{nome_arquivo}: Dados não podem ser None"
        if isinstance(dados, list) and len(dados) == 0:
            return f"{nome_arquivo}: Array não pode estar vazio"
        if isinstance(dados, dict) and len(dados) == 0:
            return f"{nome_arquivo}: Objeto não pode estar vazio"
        return None
    
    def validar_conhecimento_idiomas(self) -> ResultadoValidacao:
        """Valida [BASE] Conhecimento de idiomas.json."""
        arquivo = "[BASE] Conhecimento de idiomas.json"
        caminho = self.pasta_public / arquivo
        
        dados, erro = self._carregar_json(caminho)
        if erro:
            return ResultadoValidacao(arquivo, False, [erro])
        
        # Valida não vazio
        erro_vazio = self._validar_nao_vazio(dados, arquivo)
        if erro_vazio:
            return ResultadoValidacao(arquivo, False, [erro_vazio])
        
        # Valida contra modelo Pydantic
        erros = []
        try:
            if not isinstance(dados, list):
                return ResultadoValidacao(arquivo, False, ["Dados devem ser um array"])
            
            # Valida cada item do array
            for idx, item in enumerate(dados):
                try:
                    ConhecimentoIdioma(**item)
                except ValidationError as e:
                    erros.append(f"Item {idx}: {e}")
            
            if erros:
                return ResultadoValidacao(arquivo, False, erros)
            
            return ResultadoValidacao(arquivo, True)
        
        except Exception as e:
            return ResultadoValidacao(arquivo, False, [f"Erro na validação: {e}"])
    
    def validar_prompts(self) -> ResultadoValidacao:
        """Valida [BASE] Prompts.json."""
        arquivo = "[BASE] Prompts.json"
        caminho = self.pasta_public / arquivo
        
        dados, erro = self._carregar_json(caminho)
        if erro:
            return ResultadoValidacao(arquivo, False, [erro])
        
        # Valida não vazio
        erro_vazio = self._validar_nao_vazio(dados, arquivo)
        if erro_vazio:
            return ResultadoValidacao(arquivo, False, [erro_vazio])
        
        # Valida contra modelo Pydantic
        try:
            ColecaoPrompts(**dados)
            return ResultadoValidacao(arquivo, True)
        except ValidationError as e:
            erros = [str(err) for err in e.errors()]
            return ResultadoValidacao(arquivo, False, erros)
        except Exception as e:
            return ResultadoValidacao(arquivo, False, [f"Erro na validação: {e}"])
    
    def validar_historico_pratica(self) -> ResultadoValidacao:
        """Valida [BASE] Histórico de prática.json (opcional)."""
        arquivo = "[BASE] Histórico de Prática.json"
        caminho = self.pasta_public / arquivo
        
        # Verifica se arquivo existe
        if not caminho.exists():
            return ResultadoValidacao(
                arquivo, 
                True, 
                ["Arquivo opcional não existe - será criado novo histórico"]
            )
        
        dados, erro = self._carregar_json(caminho)
        if erro:
            return ResultadoValidacao(arquivo, False, [erro])
        
        # Se existe, não pode estar vazio
        erro_vazio = self._validar_nao_vazio(dados, arquivo)
        if erro_vazio:
            return ResultadoValidacao(arquivo, False, [erro_vazio])
        
        # Valida contra modelo Pydantic
        try:
            HistoricoPratica(**dados)
            return ResultadoValidacao(arquivo, True)
        except ValidationError as e:
            erros = [str(err) for err in e.errors()]
            return ResultadoValidacao(arquivo, False, erros)
        except Exception as e:
            return ResultadoValidacao(arquivo, False, [f"Erro na validação: {e}"])
    
    def validar_frases_dialogo(self) -> ResultadoValidacao:
        """Valida [BASE] Frases do diálogo.json."""
        arquivo = "[BASE] Frases do Diálogo.json"
        caminho = self.pasta_public / arquivo
        
        dados, erro = self._carregar_json(caminho)
        if erro:
            return ResultadoValidacao(arquivo, False, [erro])
        
        # Valida não vazio
        erro_vazio = self._validar_nao_vazio(dados, arquivo)
        if erro_vazio:
            return ResultadoValidacao(arquivo, False, [erro_vazio])
        
        # Valida contra modelo Pydantic
        try:
            FrasesDialogo(**dados)
            return ResultadoValidacao(arquivo, True)
        except ValidationError as e:
            erros = [str(err) for err in e.errors()]
            return ResultadoValidacao(arquivo, False, erros)
        except Exception as e:
            return ResultadoValidacao(arquivo, False, [f"Erro na validação: {e}"])
    
    def validar_todos(self) -> bool:
        """
        Valida todos os arquivos JSON da aplicação.
        Retorna True se todos são válidos, False caso contrário.
        """
        print("=" * 70)
        print("VALIDAÇÃO DE ARQUIVOS JSON")
        print("=" * 70)
        print()
        
        # Valida cada arquivo
        self.resultados = [
            self.validar_conhecimento_idiomas(),
            self.validar_prompts(),
            self.validar_historico_pratica(),
            self.validar_frases_dialogo()
        ]
        
        # Exibe resultados
        for resultado in self.resultados:
            print(resultado)
            print()
        
        # Verifica se todos são válidos
        todos_validos = all(r.valido for r in self.resultados)
        
        print("=" * 70)
        if todos_validos:
            print("✓ TODOS OS ARQUIVOS SÃO VÁLIDOS")
        else:
            print("✗ ALGUNS ARQUIVOS CONTÊM ERROS")
        print("=" * 70)
        
        return todos_validos


def main():
    """Função principal para executar a validação."""
    validador = ValidadorJSON()
    sucesso = validador.validar_todos()
    
    # Retorna código de saída apropriado
    exit(0 if sucesso else 1)


if __name__ == "__main__":
    main()
