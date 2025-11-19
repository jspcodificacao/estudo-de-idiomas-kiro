"""
Teste simples para o endpoint PUT /api/prompts
"""
import requests
import json

BACKEND_URL = "http://localhost:5010"

def test_put_prompts():
    print("1. Buscando prompts atuais...")
    response = requests.get(f"{BACKEND_URL}/api/prompts")
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar prompts: {response.status_code}")
        return
    
    colecao = response.json()
    print(f"✅ Prompts carregados: {len(colecao['prompts'])} prompts")
    
    # Adicionar um novo prompt de teste
    print("\n2. Adicionando novo prompt de teste...")
    novo_prompt = {
        "prompt_id": "teste_api_v1",
        "descricao": "Prompt de teste criado via API",
        "template": "Este é um teste com parâmetro {{teste}}",
        "parametros": ["teste"],
        "resposta_estruturada": False,
        "ultima_edicao": "2025-11-19T12:00:00Z"
    }
    
    colecao['prompts'].append(novo_prompt)
    colecao['data_atualizacao'] = "2025-11-19T12:00:00Z"
    
    # Enviar PUT
    print("3. Enviando PUT para salvar...")
    response = requests.put(
        f"{BACKEND_URL}/api/prompts",
        json=colecao,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao salvar prompts: {response.status_code}")
        print(f"Resposta: {response.text}")
        return
    
    print("✅ Prompts salvos com sucesso!")
    
    # Verificar se foi salvo
    print("\n4. Verificando se foi salvo...")
    response = requests.get(f"{BACKEND_URL}/api/prompts")
    colecao_atualizada = response.json()
    
    prompt_ids = [p['prompt_id'] for p in colecao_atualizada['prompts']]
    if 'teste_api_v1' in prompt_ids:
        print("✅ Prompt de teste encontrado na coleção!")
    else:
        print("❌ Prompt de teste não encontrado")
    
    # Remover o prompt de teste
    print("\n5. Removendo prompt de teste...")
    colecao_atualizada['prompts'] = [
        p for p in colecao_atualizada['prompts'] 
        if p['prompt_id'] != 'teste_api_v1'
    ]
    
    response = requests.put(
        f"{BACKEND_URL}/api/prompts",
        json=colecao_atualizada,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        print("✅ Prompt de teste removido com sucesso!")
    else:
        print(f"❌ Erro ao remover: {response.status_code}")
    
    print("\n✅ Teste concluído!")

if __name__ == "__main__":
    test_put_prompts()
