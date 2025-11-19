/**
 * Types para o Histórico de Prática
 */

export type Idioma = 'alemao' | 'ingles';

export type TipoPratica = 
  | 'traducao' 
  | 'audicao' 
  | 'pronuncia' 
  | 'dialogo' 
  | 'pronuncia_de_numeros';

export type CampoTraducao = 
  | 'texto_original' 
  | 'divisao_silabica' 
  | 'transcricao_ipa' 
  | 'traducao';

export type VelocidadeAudio = '1.0' | '0.75' | '0.5';

export type ResultadoCorrecao = 'Sim' | 'Parcial' | 'Não';

export interface ResultadoTraducao {
  campo_fornecido: CampoTraducao;
  campos_preenchidos: CampoTraducao[];
  valores_preenchidos: string[];
  campos_resultados: boolean[];
}

export interface ResultadoAudicao {
  texto_original: string;
  transcricao_usuario: string;
  correto: boolean;
  velocidade_utilizada: VelocidadeAudio;
}

export interface ResultadoPronuncia {
  texto_original: string;
  transcricao_stt: string;
  correto: ResultadoCorrecao;
  comentario: string;
}

export interface ResultadoDialogo {
  correto: ResultadoCorrecao;
}

export interface ResultadoPronunciaNumeros {
  numero_referencia: string;
  audio_usuario_url: string;
  transcricao_correta: string;
  acertou: boolean;
}

export type ResultadoExercicio = 
  | ResultadoTraducao 
  | ResultadoAudicao 
  | ResultadoPronuncia 
  | ResultadoDialogo 
  | ResultadoPronunciaNumeros;

export interface ExercicioPratica {
  data_hora: string;
  exercicio_id: string;
  conhecimento_id: string;
  idioma: Idioma;
  tipo_pratica: TipoPratica;
  resultado_exercicio: ResultadoExercicio;
}

export interface HistoricoPratica {
  exercicios: ExercicioPratica[];
}
