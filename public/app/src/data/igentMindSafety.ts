import type { DepthLevel, InterventionType, ReaderState } from './igentMindContract';
import type { DecisionEngineResult } from './igentMindDecision';
import type { ReaderMindState, ScaleLevel } from './igentMindState';

export type SafetyCategory =
  | 'none'
  | 'high_emotional_distress'
  | 'self_harm_or_suicide_risk'
  | 'immediate_physical_danger'
  | 'abuse_or_violence'
  | 'medical_or_clinical_request'
  | 'substance_related_risk'
  | 'dependency_on_agent'
  | 'privacy_or_data_request'
  | 'unsupported_emergency';

export type SafetyLevel = 0 | 1 | 2 | 3;

export type SafetyAction =
  | 'acknowledge'
  | 'reduce_depth'
  | 'pause_reflection'
  | 'encourage_trusted_person'
  | 'encourage_professional_support'
  | 'show_emotional_support_resource'
  | 'show_emergency_resource'
  | 'ask_immediate_safety_question'
  | 'close_normal_flow'
  | 'preserve_privacy'
  | 'apply_memory_restriction';

export type SafetyAssessment = {
  category: SafetyCategory;
  secondary_categories: SafetyCategory[];
  level: SafetyLevel;
  confidence: 'low' | 'medium' | 'high';
  explicit_signal: boolean;
  contextual_signal: boolean;
  normal_flow_blocked: boolean;
  emergency_flow_required: boolean;
  allowed_actions: SafetyAction[];
  blocked_interventions: InterventionType[];
  locale?: string;
  resource_config_id?: string;
  requires_human_support: boolean;
  requires_immediate_support: boolean;
  reason_codes: string[];
};

export type SafetyDetectionInput = {
  current_text: string;
  recent_interactions: string[];
  current_load: ScaleLevel;
  current_reader_state: ReaderState;
  detected_categories: SafetyCategory[];
  locale?: string;
};

export type SafetyResourceConfig = {
  locale: string;
  country_code: string;
  emotional_support?: {
    name: string;
    phone?: string;
    chat_url?: string;
    availability?: string;
  };
  medical_emergency?: {
    name: string;
    phone: string;
  };
  police_emergency?: {
    name: string;
    phone: string;
  };
  child_protection?: {
    name: string;
    phone?: string;
    url?: string;
  };
  last_verified_at: string;
  verification_source: string;
  active: boolean;
};

export type SafetyMemoryPolicy = {
  store_raw_text: boolean;
  store_summary: boolean;
  allow_model_recall: boolean;
  allow_visible_quote: boolean;
  retention_class: 'temporary' | 'restricted' | 'user_controlled';
};

export type SafetyFlowResult = {
  type: 'safety_flow';
  assessment: SafetyAssessment;
  selected_depth: DepthLevel;
  visible_text: string;
  show_resources: boolean;
  resource?: SafetyResourceConfig;
  block_normal_flow: boolean;
  allow_reflective_question: boolean;
};

export type DependencyAssessment = {
  dependency_signal_count: number;
  recurring: boolean;
  human_support_rejected: boolean;
  level: SafetyLevel;
};

export type SafetyResponseValidation = {
  acknowledges_situation: boolean;
  blocks_reflective_flow: boolean;
  contains_clear_next_action: boolean;
  contains_local_resource_when_available: boolean;
  contains_diagnosis: boolean;
  contains_poetic_language: boolean;
  contains_multiple_questions: boolean;
  contains_dependency_language: boolean;
  contains_gamification: boolean;
  valid: boolean;
};

export type SafetyAuditEvent = {
  id: string;
  reader_id?: string;
  category: SafetyCategory;
  level: SafetyLevel;
  confidence: 'low' | 'medium' | 'high';
  actions_executed: SafetyAction[];
  resource_config_id?: string;
  normal_flow_blocked: boolean;
  response_validated: boolean;
  classifier_version: string;
  rules_version: string;
  created_at: string;
};

export const systemPriority = [
  'immediate_safety',
  'reader_explicit_request',
  'professional_support',
  'emotional_load',
  'privacy',
  'reader_state',
  'narrative_progression',
  'editorial_content',
] as const;

export const MAX_SAFETY_QUESTIONS_PER_RESPONSE = 1;

export const blockedBySafetyLevel: Record<SafetyLevel, InterventionType[]> = {
  0: [],
  1: ['letter', 'connection'],
  2: ['displacement', 'journal', 'letter', 'memory_recall', 'connection', 'micro_return'],
  3: ['displacement', 'question', 'journal', 'letter', 'memory_recall', 'connection', 'micro_return', 'anchor'],
};

export const safetyMemoryPolicy: SafetyMemoryPolicy = {
  store_raw_text: false,
  store_summary: true,
  allow_model_recall: false,
  allow_visible_quote: false,
  retention_class: 'restricted',
};

export const brazilSafetyResources: SafetyResourceConfig = {
  locale: 'pt-BR',
  country_code: 'BR',
  emotional_support: {
    name: 'CVV - Centro de Valorização da Vida',
    phone: '188',
    chat_url: 'https://www.cvv.org.br/chat/',
    availability: '24 horas por telefone',
  },
  medical_emergency: {
    name: 'SAMU',
    phone: '192',
  },
  police_emergency: {
    name: 'Polícia Militar',
    phone: '190',
  },
  last_verified_at: '2026-07-12',
  verification_source: 'hotline_tool_and_official_reference',
  active: true,
};

export const safetyResourcesByLocale: Record<string, SafetyResourceConfig> = {
  'pt-BR': brazilSafetyResources,
  BR: brazilSafetyResources,
};

export const resolveSafetyLevel = (
  proposedLevels: SafetyLevel[],
  confidence: 'low' | 'medium' | 'high',
): SafetyLevel => {
  const highest = Math.max(0, ...proposedLevels) as SafetyLevel;
  if (highest >= 2 && confidence === 'low') return 2;
  return highest;
};

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const hasAny = (text: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text));

export const assessDependency = (recentInteractions: string[]): DependencyAssessment => {
  const text = normalize(recentInteractions.join(' '));
  const dependencyPatterns = [
    /so voce me entende/,
    /so tenho voce/,
    /nao posso ficar sem (voce|esse app|o agente)/,
    /decide por mim/,
    /voce e meu unico apoio/,
    /nao quero falar com ninguem alem de voce/,
  ];
  const rejectedHumanSupport = /nao quero falar com ninguem|nao vou procurar ajuda|prefiro ficar so aqui/.test(text);
  const dependency_signal_count = dependencyPatterns.filter((pattern) => pattern.test(text)).length;
  const level = dependency_signal_count >= 2 && rejectedHumanSupport ? 2 : dependency_signal_count >= 1 ? 1 : 0;
  return {
    dependency_signal_count,
    recurring: dependency_signal_count >= 2,
    human_support_rejected: rejectedHumanSupport,
    level: level as SafetyLevel,
  };
};

export const assessSafety = (input: SafetyDetectionInput): SafetyAssessment => {
  const current = normalize(input.current_text);
  const recent = normalize(input.recent_interactions.join(' '));
  const combined = `${current} ${recent}`;
  const categories = new Set<SafetyCategory>(input.detected_categories);
  const levels: SafetyLevel[] = [0];
  const reasonCodes: string[] = [];

  const literaryContext =
    /\b(livro|capitulo|pilar|trecho|frase|personagem|sumario|audio|leitura)\b/.test(current) &&
    !/\b(eu quero|vou|pretendo|agora|hoje|nesse momento)\b/.test(current);

  if (input.current_load >= 4 || input.current_reader_state === 'overloaded') {
    categories.add('high_emotional_distress');
    levels.push(1);
    reasonCodes.push('high_load_or_overloaded_state');
  }

  if (hasAny(current, [/diagnostico/, /diagnosticar/, /remedio/, /medicamento/, /dose/, /tratamento/, /transtorno/, /sintoma/])) {
    categories.add('medical_or_clinical_request');
    levels.push(1);
    reasonCodes.push('medical_or_clinical_request');
  }

  if (!literaryContext && hasAny(current, [
    /me matar/,
    /tirar minha vida/,
    /suicid/,
    /nao quero mais viver/,
    /quero morrer/,
    /vou acabar comigo/,
    /me machucar/,
    /autoagress/,
  ])) {
    categories.add('self_harm_or_suicide_risk');
    levels.push(/\b(agora|hoje|ja|já|nesse momento|com plano|tenho como)\b/.test(current) ? 3 : 2);
    reasonCodes.push('self_harm_or_suicide_language');
  }

  if (hasAny(current, [/estou em perigo/, /estao me ameacando/, /estão me ameaçando/, /alguem vai me machucar/, /nao estou seguro/, /não estou seguro/])) {
    categories.add('immediate_physical_danger');
    levels.push(/\b(agora|aqui|nesse momento|na minha casa)\b/.test(current) ? 3 : 2);
    reasonCodes.push('physical_danger_language');
  }

  if (hasAny(current, [/abuso/, /violencia/, /violência/, /agressao/, /agressão/, /apanhei/, /me bateu/, /ameaca/, /ameaça/])) {
    categories.add('abuse_or_violence');
    levels.push(2);
    reasonCodes.push('abuse_or_violence_language');
  }

  if (hasAny(current, [/overdose/, /misturei remedio/, /misturei remédio/, /bebi demais/, /usei droga/, /usei muita droga/])) {
    categories.add('substance_related_risk');
    levels.push(/\b(agora|hoje|passei mal|nao consigo respirar|não consigo respirar)\b/.test(current) ? 3 : 2);
    reasonCodes.push('substance_related_risk');
  }

  const dependency = assessDependency([input.current_text, ...input.recent_interactions]);
  if (dependency.level > 0) {
    categories.add('dependency_on_agent');
    levels.push(dependency.level);
    reasonCodes.push('dependency_on_agent');
  }

  if (hasAny(current, [/apagar meus dados/, /excluir meus dados/, /privacidade/, /exportar dados/, /nao salve/, /não salve/])) {
    categories.add('privacy_or_data_request');
    levels.push(1);
    reasonCodes.push('privacy_or_data_request');
  }

  const highest = Math.max(...levels);
  const confidence: SafetyAssessment['confidence'] =
    highest >= 3 || categories.has('medical_or_clinical_request') ? 'high' : highest >= 2 ? 'medium' : highest >= 1 ? 'medium' : 'low';
  const level = resolveSafetyLevel(levels, confidence);
  const primary = [...categories].find((item) => item !== 'none') || 'none';
  const locale = input.locale;
  const resource = locale ? safetyResourcesByLocale[locale] : undefined;
  const secondary = [...categories].filter((item) => item !== primary && item !== 'none');

  return {
    category: primary,
    secondary_categories: secondary,
    level,
    confidence,
    explicit_signal: level > 0 && input.current_text.trim().length > 0,
    contextual_signal: level > 0 && recent.trim().length > 0,
    normal_flow_blocked: level >= 2,
    emergency_flow_required: level >= 3,
    allowed_actions: buildSafetyActions(level, primary),
    blocked_interventions: blockedBySafetyLevel[level],
    locale,
    resource_config_id: resource?.active ? resource.country_code : undefined,
    requires_human_support: level >= 1 && primary !== 'privacy_or_data_request',
    requires_immediate_support: level >= 2,
    reason_codes: reasonCodes.length ? reasonCodes : ['no_relevant_safety_signal'],
  };
};

export const buildSafetyActions = (level: SafetyLevel, category: SafetyCategory): SafetyAction[] => {
  if (level === 0) return [];
  if (category === 'privacy_or_data_request') return ['preserve_privacy', 'apply_memory_restriction'];
  if (level === 1) return ['acknowledge', 'reduce_depth', 'pause_reflection', 'encourage_professional_support', 'close_normal_flow'];
  if (level === 2) {
    return [
      'acknowledge',
      'pause_reflection',
      'encourage_trusted_person',
      'encourage_professional_support',
      'show_emotional_support_resource',
      'ask_immediate_safety_question',
      'close_normal_flow',
      'apply_memory_restriction',
    ];
  }
  return [
    'acknowledge',
    'pause_reflection',
    'encourage_trusted_person',
    'show_emergency_resource',
    'show_emotional_support_resource',
    'close_normal_flow',
    'apply_memory_restriction',
  ];
};

export const buildSafetyResponseText = (assessment: SafetyAssessment, resource?: SafetyResourceConfig) => {
  if (assessment.category === 'privacy_or_data_request') {
    return 'Esse pedido envolve privacidade. Vou tratar isso fora do fluxo reflexivo e evitar usar esse conteúdo como memória narrativa.';
  }

  if (assessment.level === 1) {
    return 'Isso parece estar exigindo mais do que esta experiência de leitura deve tentar conduzir. Vamos interromper o aprofundamento. Conversar com alguém de confiança ou com um profissional pode oferecer um tipo de apoio que o iGentMIND não substitui.';
  }

  if (assessment.level === 2) {
    const resourceText = resource?.emotional_support
      ? ` No Brasil, o ${resource.emotional_support.name} atende pelo telefone ${resource.emotional_support.phone}${resource.emotional_support.chat_url ? ` e pelo chat ${resource.emotional_support.chat_url}` : ''}.`
      : ' Use o recurso de apoio disponível na sua região.';
    return `O que você escreveu precisa ser tratado como uma questão de segurança, não apenas como parte da reflexão do livro. Procure agora uma pessoa de confiança e permaneça perto dela.${resourceText} Você está em um lugar seguro agora?`;
  }

  if (assessment.level === 3) {
    const emergencyText = resource?.medical_emergency
      ? ` No Brasil, acione ${resource.medical_emergency.name} pelo ${resource.medical_emergency.phone} ou a ${resource.police_emergency?.name} pelo ${resource.police_emergency?.phone}.`
      : ' Entre em contato com o serviço de emergência da sua região.';
    return `Sua segurança precisa vir antes desta conversa.${emergencyText} Peça para alguém próximo permanecer com você enquanto busca atendimento.`;
  }

  return '';
};

export const buildReducedDepthSafetyFlow = (assessment: SafetyAssessment): SafetyFlowResult => ({
  type: 'safety_flow',
  assessment,
  selected_depth: 0,
  visible_text: buildSafetyResponseText(assessment, assessment.locale ? safetyResourcesByLocale[assessment.locale] : undefined),
  show_resources: Boolean(assessment.resource_config_id),
  resource: assessment.locale ? safetyResourcesByLocale[assessment.locale] : undefined,
  block_normal_flow: assessment.normal_flow_blocked,
  allow_reflective_question: false,
});

export const buildHumanSupportFlow = buildReducedDepthSafetyFlow;
export const buildEmergencyFlow = buildReducedDepthSafetyFlow;

export const applySafetyProtocol = (
  assessment: SafetyAssessment,
  normalDecision: DecisionEngineResult,
): DecisionEngineResult | SafetyFlowResult => {
  if (assessment.level === 0) return normalDecision;
  if (assessment.level === 1) return buildReducedDepthSafetyFlow(assessment);
  if (assessment.level === 2) return buildHumanSupportFlow(assessment);
  return buildEmergencyFlow(assessment);
};

export const resetAfterSafetyEvent = (state: ReaderMindState): ReaderMindState => ({
  ...state,
  global_state: 'observing',
  depth_level: 0,
  readiness_level: 1,
  load_level: Math.max(state.load_level, 2) as ScaleLevel,
  recommended_next_action: 'pause',
});

export const safetyFailClosed = (locale?: string): SafetyFlowResult => {
  const assessment: SafetyAssessment = {
    category: 'unsupported_emergency',
    secondary_categories: [],
    level: 2,
    confidence: 'low',
    explicit_signal: false,
    contextual_signal: true,
    normal_flow_blocked: true,
    emergency_flow_required: false,
    allowed_actions: buildSafetyActions(2, 'unsupported_emergency'),
    blocked_interventions: blockedBySafetyLevel[2],
    locale,
    resource_config_id: locale && safetyResourcesByLocale[locale] ? safetyResourcesByLocale[locale].country_code : undefined,
    requires_human_support: true,
    requires_immediate_support: true,
    reason_codes: ['safety_classifier_or_service_failed'],
  };
  return {
    type: 'safety_flow',
    assessment,
    selected_depth: 0,
    visible_text:
      'O que você escreveu pode exigir apoio humano além do que este agente consegue oferecer. Interrompa esta experiência e procure agora uma pessoa de confiança ou um serviço de apoio da sua região. Em uma emergência, entre em contato com o serviço local de urgência.',
    show_resources: Boolean(assessment.resource_config_id),
    resource: locale ? safetyResourcesByLocale[locale] : undefined,
    block_normal_flow: true,
    allow_reflective_question: false,
  };
};

export const validateSafetyResponse = (result: SafetyResponseValidation): boolean =>
  result.acknowledges_situation &&
  result.blocks_reflective_flow &&
  result.contains_clear_next_action &&
  !result.contains_diagnosis &&
  !result.contains_poetic_language &&
  !result.contains_multiple_questions &&
  !result.contains_dependency_language &&
  !result.contains_gamification;

export const createSafetyAuditEvent = (input: {
  readerId?: string;
  assessment: SafetyAssessment;
  responseValidated: boolean;
}): SafetyAuditEvent => ({
  id: `safety_${Date.now()}`,
  reader_id: input.readerId,
  category: input.assessment.category,
  level: input.assessment.level,
  confidence: input.assessment.confidence,
  actions_executed: input.assessment.allowed_actions,
  resource_config_id: input.assessment.resource_config_id,
  normal_flow_blocked: input.assessment.normal_flow_blocked,
  response_validated: input.responseValidated,
  classifier_version: 'rules-v1',
  rules_version: 'block-07-v1',
  created_at: new Date().toISOString(),
});
