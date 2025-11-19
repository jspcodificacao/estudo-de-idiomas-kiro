/**
 * Types para Base de Conhecimento
 */

export type Idioma = 'alemao' | 'ingles';

export type TipoConhecimento = 'frase' | 'palavra';

export interface ConhecimentoIdioma {
  conhecimento_id: string;
  data_hora: string;
  idioma: Idioma;
  tipo_conhecimento: TipoConhecimento;
  texto_original: string;
  transcricao_ipa?: string;
  traducao: string;
  divisao_silabica?: string;
}
