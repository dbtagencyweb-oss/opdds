import type {
  BookUnitType,
  CanonicalSectionType,
  DepthLevel,
  InterventionType,
  PillarPhase,
  ReaderState,
} from './igentMindContract';
import type { DecisionEngineResult } from './igentMindDecision';
import type { AgentMemoryContext, MemoryEngineResult } from './igentMindMemory';
import type {
  MindGuidedLetter,
  MindJournalPrompt,
  MindMicroReturn,
  MindPracticalAnchor,
  MindPillarProtocol,
  MindProtocolQuestion,
} from './igentMindProtocol';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ScaleLevel } from './igentMindState';

export type ResponseLength = 'minimal' | 'short' | 'medium';

export type ContentOrigin =
  | 'book_exact'
  | 'book_approved_adaptation'
  | 'igent_companion';

export type CanonicalContentReference = {
  content_id: string;
  origin: ContentOrigin;
  book_unit_id?: string;
  pillar_id?: string;
  section_id?: string;
  page_start?: number;
  page_end?: number;
  exact_text?: string;
  approved_adaptation?: string;
  quote_allowed: boolean;
};

export type AgentResponseComposition = {
  mirror?: string;
  displacement?: string;
  next_move?: {
    type: InterventionType;
    text: string;
    content_id?: string;
  };
  closing_line?: string;
};

export type ResponseStyleHistory = {
  recent_openings: string[];
  recent_closings: string[];
  recent_metaphors: string[];
  recent_question_patterns: string[];
};

export type ResponseComposerInput = {
  current_unit: {
    id: string;
    type: BookUnitType;
    title: string;
  };
  current_section?: {
    id: string;
    type: CanonicalSectionType;
    title: string;
  };
  pillar?: {
    id: string;
    title: string;
    phase?: PillarPhase;
    central_dilemma: string;
  };
  reader_state: ReaderState;
  allowed_depth: DepthLevel;
  load_level: ScaleLevel;
  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];
  reader_input?: string;
  selected_option_text?: string;
  intervention: InterventionType;
  content_reference?: CanonicalContentReference;
  recalled_memory?: {
    summary: string;
    exact_excerpt?: string;
    quote_allowed: boolean;
  };
  recent_style_history: ResponseStyleHistory;
  max_words: number;
};

export type ResponseComposerResult = {
  visible_text: string;
  content_origin: ContentOrigin;
  canonical_content_id?: string;
  canonical_section_id?: string;
  structure_used: Array<'mirror' | 'displacement' | 'next_move' | 'closing'>;
  intervention: InterventionType;
  word_count: number;
  question_count: number;
  memory_used: boolean;
  exact_quote_used: boolean;
  language_flags: {
    diagnostic_language: boolean;
    motivational_cliche: boolean;
    excessive_certainty: boolean;
    identity_definition: boolean;
    repeated_structure: boolean;
    excessive_length: boolean;
    false_book_attribution: boolean;
  };
  valid: boolean;
  validation_errors: string[];
};

export const CONTENT_ORIGIN_PRIORITY: ContentOrigin[] = [
  'book_exact',
  'book_approved_adaptation',
  'igent_companion',
];

export type ResponseRegenerationInstruction = {
  preserve_meaning: boolean;
  reduce_certainty: boolean;
  reduce_length: boolean;
  remove_diagnostic_language: boolean;
  remove_extra_questions: boolean;
  change_repeated_structure: boolean;
};

export const responseLengthByIntervention: Record<InterventionType, ResponseLength> = {
  mirror: 'short',
  displacement: 'short',
  question: 'short',
  micro_return: 'minimal',
  journal: 'medium',
  letter: 'medium',
  anchor: 'short',
  memory_recall: 'medium',
  connection: 'medium',
  pause: 'minimal',
  closure: 'minimal',
};

export const maxWordsByLength: Record<ResponseLength, number> = {
  minimal: 35,
  short: 80,
  medium: 140,
};

export const blockedResponsePatterns = [
  'você é uma pessoa',
  'voce e uma pessoa',
  'você sempre',
  'voce sempre',
  'você nunca',
  'voce nunca',
  'isso prova que',
  'claramente você',
  'claramente voce',
  'seu trauma',
  'seu transtorno',
  'você precisa',
  'voce precisa',
  'você deve',
  'voce deve',
  'parabéns',
  'parabens',
  'sua melhor versão',
  'sua melhor versao',
  'zona de conforto',
  'autossabotagem',
  'eu sei exatamente',
  'tudo vai ficar bem',
];

export const compositionBySignal: Record<PrimarySignal, string[]> = {
  recognition: ['mirror', 'question'],
  uncertainty: ['mirror', 'concrete_question'],
  minimization: ['mirror', 'gentle_displacement'],
  self_judgment: ['identity_behavior_separation', 'anchor'],
  external_judgment: ['voice_differentiation', 'question'],
  rigid_control: ['protection_cost_differentiation', 'anchor'],
  avoidance: ['brief_mirror', 'pause_or_closure'],
  ambivalence: ['two_positions_mirror', 'question_or_journal'],
  integration: ['summary', 'memory_or_connection', 'anchor'],
};

export const defaultResponseStyleHistory: ResponseStyleHistory = {
  recent_openings: [],
  recent_closings: [],
  recent_metaphors: [],
  recent_question_patterns: [],
};

export const editorialFallbackByIntervention: Record<InterventionType, string> = {
  mirror: 'Há mais de uma coisa presente no que você escreveu. Talvez ainda não seja necessário definir qual delas pesa mais.',
  displacement: 'Talvez essa não seja toda a história. Pode haver uma proteção tentando aparecer antes da conclusão.',
  question: 'Qual parte disso parece mais verdadeira agora?',
  micro_return: 'Nem tudo precisa ganhar conclusão neste momento.',
  journal: 'Há duas posições presentes ao mesmo tempo. Em vez de escolher uma delas, registre as duas: o que tenta proteger e o que começa a pedir espaço.',
  letter: 'Esta carta não precisa ser enviada. Ela serve apenas para separar o que permaneceu preso dentro de você.',
  anchor: 'Por enquanto, apenas observe quando esse movimento voltar a aparecer.',
  memory_recall: 'Algo parecido já apareceu antes, mas não precisa virar prova. Use isso apenas como possibilidade para olhar o presente.',
  connection: 'O contexto mudou, mas talvez exista uma proteção semelhante atravessando os dois pilares.',
  pause: 'Não precisamos continuar aprofundando agora.',
  closure: 'O que apareceu pode permanecer aberto sem exigir outra resposta.',
};

export const getResponseMaxWords = (intervention: InterventionType) =>
  maxWordsByLength[responseLengthByIntervention[intervention]];

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const countQuestions = (text: string) => (text.match(/\?/g) || []).length;

export const inspectLanguageFlags = (text: string, maxWords = 140) => {
  const lower = text.toLowerCase();
  const hasBlockedPattern = blockedResponsePatterns.some((pattern) => lower.includes(pattern));
  return {
    diagnostic_language: /\b(trauma|transtorno|diagnóstico|diagnostico|sintoma|patologia)\b/.test(lower),
    motivational_cliche: hasBlockedPattern,
    excessive_certainty: /\b(com certeza|sem dúvida|sem duvida|claramente|isso prova)\b/.test(lower),
    identity_definition: /\b(você é|voce e|você sempre|voce sempre|você nunca|voce nunca)\b/.test(lower),
    repeated_structure: false,
    excessive_length: countWords(text) > maxWords,
    false_book_attribution: /\b(o livro diz|como o livro afirma|trecho do livro)\b/.test(lower),
  };
};

export const validateAgentResponse = (result: ResponseComposerResult): boolean =>
  result.word_count <= 140 &&
  result.question_count <= 1 &&
  result.language_flags.diagnostic_language === false &&
  result.language_flags.motivational_cliche === false &&
  result.language_flags.excessive_certainty === false &&
  result.language_flags.identity_definition === false &&
  result.language_flags.false_book_attribution === false &&
  result.language_flags.excessive_length === false;

export const buildComposerResult = (input: {
  visibleText: string;
  intervention: InterventionType;
  contentOrigin?: ContentOrigin;
  canonicalContentId?: string;
  canonicalSectionId?: string;
  structureUsed?: ResponseComposerResult['structure_used'];
  memoryUsed?: boolean;
  exactQuoteUsed?: boolean;
  maxWords?: number;
}): ResponseComposerResult => {
  const wordCount = countWords(input.visibleText);
  const questionCount = countQuestions(input.visibleText);
  const flags = inspectLanguageFlags(input.visibleText, input.maxWords || 140);
  const result: ResponseComposerResult = {
    visible_text: input.visibleText,
    content_origin: input.contentOrigin || 'igent_companion',
    canonical_content_id: input.canonicalContentId,
    canonical_section_id: input.canonicalSectionId,
    structure_used: input.structureUsed || ['mirror'],
    intervention: input.intervention,
    word_count: wordCount,
    question_count: questionCount,
    memory_used: Boolean(input.memoryUsed),
    exact_quote_used: Boolean(input.exactQuoteUsed),
    language_flags: flags,
    valid: false,
    validation_errors: [],
  };
  result.valid = validateAgentResponse(result);
  result.validation_errors = [
    wordCount > 140 ? 'excessive_length' : '',
    questionCount > 1 ? 'extra_questions' : '',
    ...Object.entries(flags).filter(([, value]) => value).map(([key]) => key),
  ].filter(Boolean);
  return result;
};

export const validateContentAttribution = (
  result: ResponseComposerResult,
  reference?: CanonicalContentReference,
): boolean => {
  if (result.content_origin === 'book_exact') {
    return Boolean(reference && reference.origin === 'book_exact' && reference.exact_text && reference.quote_allowed);
  }
  if (result.content_origin === 'book_approved_adaptation') {
    return Boolean(reference && reference.origin === 'book_approved_adaptation' && reference.approved_adaptation);
  }
  return true;
};

export const buildRegenerationInstruction = (result: ResponseComposerResult): ResponseRegenerationInstruction => ({
  preserve_meaning: true,
  reduce_certainty: result.language_flags.excessive_certainty,
  reduce_length: result.language_flags.excessive_length,
  remove_diagnostic_language: result.language_flags.diagnostic_language,
  remove_extra_questions: result.question_count > 1,
  change_repeated_structure: result.language_flags.repeated_structure,
});

const findContentText = (
  protocol: MindPillarProtocol | null,
  contentId?: string,
): string | undefined => {
  if (!protocol || !contentId) return undefined;
  const question = protocol.questions.find((item: MindProtocolQuestion) => item.id === contentId);
  if (question) return question.prompt;
  const microReturn = protocol.micro_returns.find((item: MindMicroReturn) => item.id === contentId);
  if (microReturn) return [microReturn.mirror, microReturn.displacement].filter(Boolean).join(' ');
  const journal = protocol.journal_prompts.find((item: MindJournalPrompt) => item.id === contentId);
  if (journal) return journal.prompt;
  const letter = protocol.guided_letters.find((item: MindGuidedLetter) => item.id === contentId);
  if (letter) return `${letter.title}. ${letter.prompt}`;
  const anchor = protocol.practical_anchors.find((item: MindPracticalAnchor) => item.id === contentId);
  if (anchor) return `${anchor.title}. ${anchor.prompt}`;
  return undefined;
};

export const buildResponseComposerInput = (input: {
  protocol: MindPillarProtocol | null;
  decision: DecisionEngineResult | null;
  memoryContext: AgentMemoryContext;
  memoryEngine: MemoryEngineResult;
  readerState: ReaderState;
  allowedDepth: DepthLevel;
  loadLevel: ScaleLevel;
  primarySignal?: PrimarySignal;
  secondarySignals: SecondarySignal[];
  readerInput?: string;
  selectedOptionText?: string;
  styleHistory?: ResponseStyleHistory;
}): ResponseComposerInput => {
  const intervention = input.decision?.selected_intervention || 'question';
  const contentText = findContentText(input.protocol, input.decision?.selected_content_id);
  const contentReference = contentText
    ? {
        content_id: input.decision?.selected_content_id || 'igent_companion_generated',
        origin: 'igent_companion' as const,
        book_unit_id: input.protocol?.identity.id,
        pillar_id: input.protocol?.identity.id,
        approved_adaptation: contentText,
        quote_allowed: false,
      }
    : undefined;
  return {
    current_unit: {
      id: input.protocol?.identity.id || 'unknown_unit',
      type: 'pillar',
      title: input.protocol?.identity.title || 'Unidade atual',
    },
    pillar: {
      id: input.protocol?.identity.id || 'unknown',
      title: input.protocol?.identity.title || 'Pilar atual',
      phase: input.decision?.current_phase || input.protocol?.questions[0]?.phase || 'consciousness',
      central_dilemma: input.protocol?.identity.dilemma || '',
    },
    reader_state: input.readerState,
    allowed_depth: input.decision?.selected_depth ?? input.allowedDepth,
    load_level: input.loadLevel,
    primary_signal: input.primarySignal,
    secondary_signals: input.secondarySignals,
    pillar_specific_signals: [],
    reader_input: input.readerInput,
    selected_option_text: input.selectedOptionText,
    intervention,
    content_reference: contentReference,
    recalled_memory: input.decision?.should_recall_memory && input.memoryContext.recalled_memory
      ? {
          summary: input.memoryContext.recalled_memory.summary,
          exact_excerpt: input.memoryContext.recalled_memory.exact_excerpt,
          quote_allowed: input.memoryEngine.exact_quote_allowed,
        }
      : undefined,
    recent_style_history: input.styleHistory || defaultResponseStyleHistory,
    max_words: getResponseMaxWords(intervention),
  };
};
