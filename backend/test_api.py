"""
Casos de teste para os endpoints do servidor FastAPI.
Execute com: pytest backend/test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json
import shutil
from datetime import datetime
from uuid import uuid4

from main import app
from models import (
    ConhecimentoIdioma,
    ColecaoPrompts,
    HistoricoPratica,
    FrasesDialogo,
    Idioma,
    TipoConhecimento
)

# Cliente de teste
client = TestClient(app)

# Diretório de testes
TEST_PUBLIC_DIR = Path("test_public")


@pytest.fixture(scope="module", autouse=True)
def setup_test_environment():
    """Configura ambiente de teste antes de executar os testes."""
    # Criar diretório de teste
    TEST_PUBLIC_DIR.mkdir(exist_ok=True)
    
    # Copiar arquivos reais para teste
    public_dir = Path("public")
    if public_dir.exists():
        for arquivo in public_dir.glob("*.json"):
            shutil.copy(arquivo, TEST_PUBLIC_DIR / arquivo.name)
    
    yield
    
    # Limpar após testes
    if TEST_PUBLIC_DIR.exists():
        shutil.rmtree(TEST_PUBLIC_DIR)


class TestEndpointRaiz:
    """Testes para o endpoint raiz (/)."""
    
    def test_raiz_retorna_200(self):
        """Deve retornar status 200."""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_raiz_retorna_json(self):
        """Deve retornar JSON válido."""
        response = client.get("/")
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)
    
    def test_raiz_contem_informacoes(self):
        """Deve conter informações sobre a API."""
        response = client.get("/")
        data = response.json()
        assert "mensagem" in data
        assert "versao" in data
        assert "endpoints" in data
    
    def test_raiz_lista_endpoints(self):
        """Deve listar todos os endpoints disponíveis."""
        response = client.get("/")
        data = response.json()
        endpoints = data["endpoints"]
        
        assert "base_de_conhecimento" in endpoints
        assert "prompts" in endpoints
        assert "historico_de_pratica" in endpoints
        assert "frases_do_dialogo" in endpoints


class TestEndpointBaseDeConhecimento:
    """Testes para o endpoint /api/base_de_conhecimento."""
    
    def test_retorna_200(self):
        """Deve retornar status 200."""
        response = client.get("/api/base_de_conhecimento")
        assert response.status_code == 200
    
    def test_retorna_array(self):
        """Deve retornar um array."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        assert isinstance(data, list)
    
    def test_array_nao_vazio(self):
        """Array não deve estar vazio."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        assert len(data) > 0
    
    def test_estrutura_conhecimento(self):
        """Cada item deve ter a estrutura correta."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        primeiro = data[0]
        assert "conhecimento_id" in primeiro
        assert "data_hora" in primeiro
        assert "idioma" in primeiro
        assert "tipo_conhecimento" in primeiro
        assert "texto_original" in primeiro
        assert "traducao" in primeiro
    
    def test_campos_obrigatorios_preenchidos(self):
        """Campos obrigatórios não devem estar vazios."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        for item in data:
            assert item["conhecimento_id"]
            assert item["data_hora"]
            assert item["idioma"]
            assert item["tipo_conhecimento"]
            assert item["texto_original"]
            assert item["traducao"]
    
    def test_idioma_valido(self):
        """Idioma deve ser 'alemao' ou 'ingles'."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        idiomas_validos = ["alemao", "ingles"]
        for item in data:
            assert item["idioma"] in idiomas_validos
    
    def test_tipo_conhecimento_valido(self):
        """Tipo de conhecimento deve ser 'frase' ou 'palavra'."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        tipos_validos = ["frase", "palavra"]
        for item in data:
            assert item["tipo_conhecimento"] in tipos_validos
    
    def test_uuid_valido(self):
        """conhecimento_id deve ser um UUID válido."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        for item in data:
            # Tentar criar UUID - deve funcionar
            from uuid import UUID
            UUID(item["conhecimento_id"])
    
    def test_datetime_valido(self):
        """data_hora deve ser um datetime válido em ISO 8601."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        for item in data:
            # Tentar parsear datetime - deve funcionar
            datetime.fromisoformat(item["data_hora"].replace('Z', '+00:00'))
    
    def test_validacao_pydantic(self):
        """Dados devem passar na validação Pydantic."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        for item in data:
            # Não deve lançar exceção
            ConhecimentoIdioma(**item)


class TestEndpointPrompts:
    """Testes para o endpoint /api/prompts."""
    
    def test_retorna_200(self):
        """Deve retornar status 200."""
        response = client.get("/api/prompts")
        assert response.status_code == 200
    
    def test_retorna_objeto(self):
        """Deve retornar um objeto."""
        response = client.get("/api/prompts")
        data = response.json()
        assert isinstance(data, dict)
    
    def test_estrutura_colecao(self):
        """Deve ter a estrutura de ColecaoPrompts."""
        response = client.get("/api/prompts")
        data = response.json()
        
        assert "descricao" in data
        assert "data_atualizacao" in data
        assert "marcador_de_paramentros" in data
        assert "prompts" in data
    
    def test_prompts_array_nao_vazio(self):
        """Array de prompts não deve estar vazio."""
        response = client.get("/api/prompts")
        data = response.json()
        assert isinstance(data["prompts"], list)
        assert len(data["prompts"]) > 0
    
    def test_estrutura_prompt(self):
        """Cada prompt deve ter a estrutura correta."""
        response = client.get("/api/prompts")
        data = response.json()
        
        primeiro_prompt = data["prompts"][0]
        assert "prompt_id" in primeiro_prompt
        assert "descricao" in primeiro_prompt
        assert "template" in primeiro_prompt
        assert "parametros" in primeiro_prompt
        assert "resposta_estruturada" in primeiro_prompt
        assert "ultima_edicao" in primeiro_prompt
    
    def test_parametros_array(self):
        """Parâmetros devem ser um array."""
        response = client.get("/api/prompts")
        data = response.json()
        
        for prompt in data["prompts"]:
            assert isinstance(prompt["parametros"], list)
    
    def test_resposta_estruturada_boolean(self):
        """resposta_estruturada deve ser boolean."""
        response = client.get("/api/prompts")
        data = response.json()
        
        for prompt in data["prompts"]:
            assert isinstance(prompt["resposta_estruturada"], bool)
    
    def test_estrutura_esperada_quando_necessario(self):
        """Se resposta_estruturada=true, estrutura_esperada pode existir."""
        response = client.get("/api/prompts")
        data = response.json()
        
        for prompt in data["prompts"]:
            if prompt["resposta_estruturada"] and "estrutura_esperada" in prompt:
                assert isinstance(prompt["estrutura_esperada"], dict)
    
    def test_validacao_pydantic(self):
        """Dados devem passar na validação Pydantic."""
        response = client.get("/api/prompts")
        data = response.json()
        
        # Não deve lançar exceção
        ColecaoPrompts(**data)


class TestEndpointHistoricoDePratica:
    """Testes para o endpoint /api/historico_de_pratica."""
    
    def test_retorna_200(self):
        """Deve retornar status 200."""
        response = client.get("/api/historico_de_pratica")
        assert response.status_code == 200
    
    def test_retorna_objeto(self):
        """Deve retornar um objeto."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        assert isinstance(data, dict)
    
    def test_tem_campo_exercicios(self):
        """Deve ter o campo 'exercicios'."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        assert "exercicios" in data
    
    def test_exercicios_array(self):
        """exercicios deve ser um array."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        assert isinstance(data["exercicios"], list)
    
    def test_estrutura_exercicio(self):
        """Se houver exercícios, devem ter a estrutura correta."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        
        if len(data["exercicios"]) > 0:
            exercicio = data["exercicios"][0]
            assert "data_hora" in exercicio
            assert "exercicio_id" in exercicio
            assert "conhecimento_id" in exercicio
            assert "idioma" in exercicio
            assert "tipo_pratica" in exercicio
            assert "resultado_exercicio" in exercicio
    
    def test_tipo_pratica_valido(self):
        """tipo_pratica deve ser um dos valores válidos."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        
        tipos_validos = ["traducao", "audicao", "pronuncia", "dialogo", "pronuncia_de_numeros"]
        for exercicio in data["exercicios"]:
            assert exercicio["tipo_pratica"] in tipos_validos
    
    def test_validacao_pydantic(self):
        """Dados devem passar na validação Pydantic."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        
        # Não deve lançar exceção
        HistoricoPratica(**data)


class TestEndpointFrasesDoDialogo:
    """Testes para o endpoint /api/frases_do_dialogo."""
    
    def test_retorna_200(self):
        """Deve retornar status 200."""
        response = client.get("/api/frases_do_dialogo")
        assert response.status_code == 200
    
    def test_retorna_objeto(self):
        """Deve retornar um objeto."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        assert isinstance(data, dict)
    
    def test_estrutura_frases(self):
        """Deve ter a estrutura correta."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        
        assert "saudacao" in data
        assert "despedida" in data
        assert "intermediarias" in data
    
    def test_campos_nao_vazios(self):
        """Campos obrigatórios não devem estar vazios."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        
        assert data["saudacao"]
        assert data["despedida"]
        assert len(data["intermediarias"]) > 0
    
    def test_intermediarias_array(self):
        """intermediarias deve ser um array."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        assert isinstance(data["intermediarias"], list)
    
    def test_intermediarias_strings(self):
        """Todas as frases intermediárias devem ser strings."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        
        for frase in data["intermediarias"]:
            assert isinstance(frase, str)
            assert len(frase) > 0
    
    def test_validacao_pydantic(self):
        """Dados devem passar na validação Pydantic."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        
        # Não deve lançar exceção
        FrasesDialogo(**data)
    
    def test_nao_permite_campos_extras(self):
        """Não deve permitir campos extras (additionalProperties: false)."""
        response = client.get("/api/frases_do_dialogo")
        data = response.json()
        
        # Deve ter exatamente 3 campos
        campos_esperados = {"saudacao", "despedida", "intermediarias"}
        campos_retornados = set(data.keys())
        assert campos_retornados == campos_esperados


class TestIntegracaoEndpoints:
    """Testes de integração entre endpoints."""
    
    def test_todos_endpoints_respondem(self):
        """Todos os endpoints devem responder com sucesso."""
        endpoints = [
            "/",
            "/api/base_de_conhecimento",
            "/api/prompts",
            "/api/historico_de_pratica",
            "/api/frases_do_dialogo"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200, f"Endpoint {endpoint} falhou"
    
    def test_conhecimento_ids_unicos(self):
        """IDs de conhecimento devem ser únicos."""
        response = client.get("/api/base_de_conhecimento")
        data = response.json()
        
        ids = [item["conhecimento_id"] for item in data]
        assert len(ids) == len(set(ids)), "IDs duplicados encontrados"
    
    def test_prompt_ids_unicos(self):
        """IDs de prompts devem ser únicos."""
        response = client.get("/api/prompts")
        data = response.json()
        
        ids = [prompt["prompt_id"] for prompt in data["prompts"]]
        assert len(ids) == len(set(ids)), "IDs de prompts duplicados"
    
    def test_exercicio_ids_unicos(self):
        """IDs de exercícios devem ser únicos."""
        response = client.get("/api/historico_de_pratica")
        data = response.json()
        
        if len(data["exercicios"]) > 0:
            ids = [ex["exercicio_id"] for ex in data["exercicios"]]
            assert len(ids) == len(set(ids)), "IDs de exercícios duplicados"


class TestTratamentoDeErros:
    """Testes para tratamento de erros."""
    
    def test_endpoint_inexistente(self):
        """Endpoint inexistente deve retornar 404."""
        response = client.get("/api/endpoint_inexistente")
        assert response.status_code == 404
    
    def test_metodo_nao_permitido(self):
        """Método não permitido deve retornar 405."""
        response = client.post("/api/base_de_conhecimento")
        assert response.status_code == 405


class TestPerformance:
    """Testes de performance básicos."""
    
    def test_resposta_rapida_base_conhecimento(self):
        """Endpoint deve responder em tempo razoável."""
        import time
        
        inicio = time.time()
        response = client.get("/api/base_de_conhecimento")
        fim = time.time()
        
        tempo_resposta = fim - inicio
        assert response.status_code == 200
        assert tempo_resposta < 1.0, f"Resposta muito lenta: {tempo_resposta}s"
    
    def test_multiplas_requisicoes(self):
        """Deve suportar múltiplas requisições."""
        for _ in range(10):
            response = client.get("/api/base_de_conhecimento")
            assert response.status_code == 200


class TestDocumentacao:
    """Testes para documentação automática."""
    
    def test_swagger_ui_disponivel(self):
        """Swagger UI deve estar disponível."""
        response = client.get("/docs")
        assert response.status_code == 200
    
    def test_redoc_disponivel(self):
        """ReDoc deve estar disponível."""
        response = client.get("/redoc")
        assert response.status_code == 200
    
    def test_openapi_json_disponivel(self):
        """OpenAPI JSON deve estar disponível."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
