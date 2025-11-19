/**
 * Types para Prompts
 */

export interface EstruturaEsperada {
  type: string;
  properties?: Record<string, any>;
  items?: any;
  enum?: string[];
  required?: string[];
  description?: string;
  minimum?: number;
  maximum?: number;
}

export interface Prompt {
  prompt_id: string;
  descricao: string;
  template: string;
  parametros: string[];
  resposta_estruturada: boolean;
  estrutura_esperada?: EstruturaEsperada;
  ultima_edicao: string;
}

export interface ColecaoPrompts {
  descricao: string;
  data_atualizacao: string;
  marcador_de_paramentros: string;
  prompts: Prompt[];
}
