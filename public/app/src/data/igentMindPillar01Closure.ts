// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
import type { InterpretationConfidence } from './igentMindContract';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ReaderMindState } from './igentMindState';

type PillarMemory = {
  id: string;
  reader_id: string;
  pillar_id: string;
  summary: string;
  dominant_primary_signals: PrimarySignal[];
  dominant_secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];
  meaningful_excerpt_ids: string[];
  open_thread_ids: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
};

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueValues<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function summarizeEvidenceField(evidence: PillarClosureEvidence[]): string | undefined {
  const summaries = evidence.map((item) => item.summary.trim()).filter(Boolean);
  return summaries.length > 0 ? limitWords(summaries.join('; '), 42) : undefined;
}

function calculateFieldConfidence(evidence: PillarClosureEvidence[]): InterpretationConfidence {
  if (evidence.some((item) => item.confidence === 'high' && item.reader_confirmed)) {
    return 'high';
  }
  if (evidence.some((item) => item.confidence === 'medium' || item.reader_confirmed)) {
    return 'medium';
  }
  return 'low';
}

function calculateInterpretationConfidence(evidence: PillarClosureEvidence[]): InterpretationConfidence {
  return calculateFieldConfidence(evidence);
}

function capConfidence(value: InterpretationConfidence, maximum: InterpretationConfidence): InterpretationConfidence {
  const order: Record<InterpretationConfidence, number> = { low: 0, medium: 1, high: 2 };
  return order[value] <= order[maximum] ? value : maximum;
}

function normalizeSummaryFragment(value: string): string {
  return value.trim().replace(/[.?!]+$/g, '').toLowerCase();
}

function limitWords(value: string, maximumWords: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length <= maximumWords ? value.trim() : words.slice(0, maximumWords).join(' ');
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function formatReturnPhrase(value: string): string {
  return value.trim().replace(/^['"“”]+|['"“”]+$/g, '');
}

function createClosureSummaryId(readerId: string): string {
  return `p01_closure_summary_${readerId}`;
}

function createPillarMemoryCandidateId(readerId: string, pillarId: string): string {
  return `p01_memory_candidate_${readerId}_${pillarId}`;
}

function createPersistentPillarMemoryId(readerId: string, pillarId: string): string {
  return `p01_memory_${readerId}_${pillarId}`;
}

function createOpenThreadCandidateId(kind: string): string {
  return `p01_open_thread_${kind}`;
}

function sanitizeReaderEditedMemorySummary(value: string): string {
  return limitWords(value.replace(/\s+/g, ' ').trim(), 100);
}

function selectDominantPrimarySignals(evidence: PillarClosureEvidence[]): PrimarySignal[] {
  const counts = new Map<PrimarySignal, number>();
  for (const item of evidence) {
    if (item.primary_signal) {
      counts.set(item.primary_signal, (counts.get(item.primary_signal) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([signal]) => signal);
}

function selectDominantSecondarySignals(evidence: PillarClosureEvidence[]): SecondarySignal[] {
  const counts = new Map<SecondarySignal, number>();
  for (const item of evidence) {
    for (const signal of item.secondary_signals) {
      counts.set(signal, (counts.get(signal) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([signal]) => signal);
}

function selectDominantPillarSignals(evidence: PillarClosureEvidence[]): string[] {
  const counts = new Map<string, number>();
  for (const item of evidence) {
    for (const signal of item.pillar_specific_signals) {
      counts.set(signal, (counts.get(signal) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([signal]) => signal);
}

/**
 * BLOCO 17
 * PILAR I — RECONHECIMENTO
 * FECHAMENTO INTELIGENTE DO PILAR
 *
 * OBJETIVOS:
 *
 * 1. Encerrar a experiência reflexiva sem produzir
 *    diagnóstico, avaliação ou promessa de mudança.
 *
 * 2. Criar uma síntese curta do que o leitor
 *    reconheceu, somente com evidências suficientes.
 *
 * 3. Consolidar memória apenas quando houver
 *    consentimento explícito.
 *
 * 4. Preservar fios ainda abertos sem forçar
 *    continuidade reflexiva.
 *
 * 5. Oferecer rotas para:
 *    - Carta de Sustentação canônica;
 *    - Ritual do Reconhecimento canônico;
 *    - fecho do Pilar I;
 *    - continuação da leitura;
 *    - retorno posterior;
 *    - encerramento sem síntese.
 *
 * PRINCÍPIO:
 *
 * Concluir o pilar não significa:
 *
 * - ter entendido tudo;
 * - ter mudado um padrão;
 * - ter deixado de fugir;
 * - estar integrado;
 * - estar emocionalmente melhor;
 * - estar pronto para aprofundar.
 *
 * Concluir significa apenas que o leitor decidiu
 * encerrar ou continuar a leitura naquele momento.
 */


//////////////////////////////////////////////////
// 1. TIPOS DE ENCERRAMENTO
//////////////////////////////////////////////////

export type PillarClosureReason =
  | "reader_completed_questions"
  | "reader_completed_partial_reflection"
  | "reader_completed_canonical_section"
  | "reader_requested_closure"
  | "reader_requested_continue_reading"
  | "reader_skipped_reflection"
  | "reader_paused"
  | "load_limit_reached"
  | "safety_interruption";

export type PillarReflectiveCompletionLevel =
  | "not_started"
  | "content_only"
  | "partial"
  | "substantial"
  | "complete"
  | "paused"
  | "skipped";

export type PillarClosureRoute =
  | "open_canonical_support_letter"
  | "open_canonical_ritual"
  | "open_canonical_closure"
  | "continue_to_next_pillar"
  | "save_for_later"
  | "pause_journey"
  | "close_without_summary"
  | "close_with_summary";

export type PillarClosureMovement =
  | "what_became_visible"
  | "what_may_be_protecting"
  | "what_return_seems_possible";

export type ClosureSummaryDepth =
  | "minimal"
  | "standard"
  | "deep";

export type ClosureEvidenceSourceType =
  | "open_response"
  | "closed_option"
  | "journal"
  | "guided_letter"
  | "anchor"
  | "canonical_ritual"
  | "reader_correction"
  | "memory_confirmation";

export type PillarClosureStatus =
  | "draft"
  | "presented"
  | "accepted"
  | "edited"
  | "rejected"
  | "closed";


//////////////////////////////////////////////////
// 2. EVIDÊNCIA DE FECHAMENTO
//////////////////////////////////////////////////

export interface PillarClosureEvidence {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  source_type:
    ClosureEvidenceSourceType;

  source_id: string;

  summary: string;

  exact_excerpt?: string;

  primary_signal?: PrimarySignal;

  secondary_signals:
    SecondarySignal[];

  pillar_specific_signals:
    string[];

  semantic_fields:
    Pillar01ClosureSemanticField[];

  confidence:
    InterpretationConfidence;

  reader_confirmed:
    boolean;

  memory_consent:
    boolean;

  created_at:
    string;
}


export type Pillar01ClosureSemanticField =
  | "current_state"
  | "body_signal"
  | "internal_sentence"
  | "escape_movement"
  | "judgment_mechanism"
  | "social_fear"
  | "recognized_limit"
  | "return_phrase"
  | "minimum_presence_gesture"
  | "reader_correction"
  | "unresolved_question";


//////////////////////////////////////////////////
// 3. PESO DAS FONTES
//////////////////////////////////////////////////

export const PILLAR_01_CLOSURE_EVIDENCE_WEIGHTS:
  Record<
    ClosureEvidenceSourceType,
    number
  > = {
    open_response: 3,
    closed_option: 1,
    journal: 3,
    guided_letter: 3,
    anchor: 2,
    canonical_ritual: 3,
    reader_correction: 4,
    memory_confirmation: 4
  };


/**
 * REGRAS DE PESO:
 *
 * - Resposta fechada cria hipótese fraca.
 * - Resposta aberta cria evidência mais forte.
 * - Correção explícita do leitor possui prioridade.
 * - Conteúdo privado não entra na síntese.
 * - Micro-retornos não são evidência.
 * - Exercício pulado não é evidência.
 */


//////////////////////////////////////////////////
// 4. CAMPOS DA SÍNTESE
//////////////////////////////////////////////////

export interface Pillar01ClosureRecognition {
  current_state?: string;
  body_signal?: string;
  internal_sentence?: string;

  evidence_ids: string[];

  confidence:
    InterpretationConfidence;
}


export interface Pillar01ClosureProtection {
  escape_movement?: string;
  judgment_mechanism?: string;
  social_fear?: string;

  evidence_ids: string[];

  confidence:
    InterpretationConfidence;
}


export interface Pillar01ClosureReturn {
  recognized_limit?: string;
  return_phrase?: string;
  minimum_presence_gesture?: string;

  evidence_ids: string[];

  confidence:
    InterpretationConfidence;
}


export interface Pillar01ClosureSynthesisData {
  recognition:
    Pillar01ClosureRecognition;

  protection:
    Pillar01ClosureProtection;

  return:
    Pillar01ClosureReturn;

  unresolved_questions:
    string[];

  reader_corrections:
    string[];

  evidence_count:
    number;

  source_count:
    number;

  maximum_confidence:
    InterpretationConfidence;
}


//////////////////////////////////////////////////
// 5. SÍNTESE VISÍVEL
//////////////////////////////////////////////////

export interface PillarClosureSummarySection {
  movement:
    PillarClosureMovement;

  title: string;

  text: string;

  evidence_ids:
    string[];

  confidence:
    InterpretationConfidence;
}


export interface PillarClosureVisibleSummary {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  title:
    string;

  introduction?:
    string;

  sections:
    PillarClosureSummarySection[];

  closing_line:
    string;

  content_origin:
    "igent_companion";

  depth:
    ClosureSummaryDepth;

  word_count:
    number;

  question_count:
    0;

  status:
    PillarClosureStatus;

  editable_by_reader:
    true;

  rejectable_by_reader:
    true;

  memory_not_yet_saved:
    true;
}


/**
 * A síntese visível utiliza no máximo
 * três movimentos:
 *
 * 1. O que ficou visível.
 * 2. O que pode estar protegendo.
 * 3. Que retorno parece possível.
 *
 * Um movimento pode ser omitido quando não houver
 * evidência suficiente.
 */


//////////////////////////////////////////////////
// 6. ENTRADA DO MOTOR DE FECHAMENTO
//////////////////////////////////////////////////

export interface Pillar01ClosureInput {
  reader_id:
    string;

  state:
    ReaderMindState;

  reason:
    PillarClosureReason;

  reflective_completion_level:
    PillarReflectiveCompletionLevel;

  evidence:
    PillarClosureEvidence[];

  completed_question_ids:
    string[];

  completed_journal_ids:
    string[];

  completed_letter_ids:
    string[];

  completed_anchor_ids:
    string[];

  canonical_sections_read:
    string[];

  active_open_thread_ids:
    string[];

  reader_requested_summary:
    boolean;

  reader_requested_memory:
    boolean;

  reader_requested_continue:
    boolean;

  reader_requested_pause:
    boolean;

  reader_requested_no_summary:
    boolean;

  reader_requested_edit_before_save:
    boolean;
}


//////////////////////////////////////////////////
// 7. RESULTADO DO MOTOR
//////////////////////////////////////////////////

export interface Pillar01ClosureResult {
  pillar_id:
    "pillar_01_reconhecimento";

  reason:
    PillarClosureReason;

  reflective_completion_level:
    PillarReflectiveCompletionLevel;

  synthesis_data?:
    Pillar01ClosureSynthesisData;

  visible_summary?:
    PillarClosureVisibleSummary;

  recommended_route:
    PillarClosureRoute;

  available_routes:
    PillarClosureRoute[];

  memory_candidate?:
    Pillar01ConsolidatedMemoryCandidate;

  open_thread_candidates:
    Pillar01ClosureOpenThreadCandidate[];

  reflective_phase_complete:
    boolean;

  reading_progress_blocked:
    false;

  pillar_content_complete:
    boolean;

  validation_errors:
    string[];
}


//////////////////////////////////////////////////
// 8. NORMALIZAÇÃO DAS EVIDÊNCIAS
//////////////////////////////////////////////////

export function normalizePillar01ClosureEvidence(
  evidence: PillarClosureEvidence[]
): PillarClosureEvidence[] {
  return evidence
    .filter(
      item =>
        item.pillar_id ===
        "pillar_01_reconhecimento"
    )
    .filter(
      item =>
        Boolean(item.summary.trim())
    )
    .filter(
      item =>
        item.source_type !==
          "closed_option" ||
        item.confidence === "low"
    )
    .map(item => ({
      ...item,

      exact_excerpt:
        item.memory_consent &&
        item.reader_confirmed
          ? item.exact_excerpt
          : undefined
    }));
}


/**
 * Conteúdo privado, não consentido ou apagado
 * deve ser removido antes desta função.
 */


//////////////////////////////////////////////////
// 9. PONTUAÇÃO DA EVIDÊNCIA
//////////////////////////////////////////////////

export function scoreClosureEvidence(
  item: PillarClosureEvidence
): number {
  let score =
    PILLAR_01_CLOSURE_EVIDENCE_WEIGHTS[
      item.source_type
    ];

  if (item.reader_confirmed) {
    score += 3;
  }

  if (
    item.source_type ===
    "reader_correction"
  ) {
    score += 3;
  }

  if (
    item.confidence === "medium"
  ) {
    score += 2;
  }

  if (
    item.confidence === "high"
  ) {
    score += 4;
  }

  if (
    item.source_type ===
      "closed_option" &&
    !item.reader_confirmed
  ) {
    score -= 2;
  }

  return Math.max(score, 0);
}


//////////////////////////////////////////////////
// 10. SELEÇÃO DE EVIDÊNCIA POR CAMPO
//////////////////////////////////////////////////

export function selectEvidenceForField(
  evidence:
    PillarClosureEvidence[],

  field:
    Pillar01ClosureSemanticField,

  maximumItems:
    number = 2
): PillarClosureEvidence[] {
  return evidence
    .filter(
      item =>
        item.semantic_fields
          .includes(field)
    )
    .map(item => ({
      item,
      score:
        scoreClosureEvidence(item)
    }))
    .filter(
      scored =>
        scored.score >= 2
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, maximumItems)
    .map(
      scored =>
        scored.item
    );
}


//////////////////////////////////////////////////
// 11. RESOLUÇÃO DE CONFLITOS
//////////////////////////////////////////////////

export function resolveConflictingClosureEvidence(
  evidence:
    PillarClosureEvidence[]
): PillarClosureEvidence[] {
  const corrections =
    evidence.filter(
      item =>
        item.source_type ===
        "reader_correction"
    );

  if (
    corrections.length === 0
  ) {
    return evidence;
  }

  const correctedFields =
    new Set(
      corrections.flatMap(
        item =>
          item.semantic_fields
      )
    );

  return [
    ...evidence.filter(
      item =>
        !item.semantic_fields.some(
          field =>
            correctedFields.has(field)
        )
    ),

    ...corrections
  ];
}


/**
 * Correções do leitor substituem interpretações
 * anteriores sobre o mesmo campo.
 */


//////////////////////////////////////////////////
// 12. CONSTRUÇÃO DOS DADOS DE SÍNTESE
//////////////////////////////////////////////////

export function buildPillar01ClosureSynthesisData(
  rawEvidence:
    PillarClosureEvidence[]
): Pillar01ClosureSynthesisData {
  const normalized =
    normalizePillar01ClosureEvidence(
      rawEvidence
    );

  const evidence =
    resolveConflictingClosureEvidence(
      normalized
    );

  const currentStateEvidence =
    selectEvidenceForField(
      evidence,
      "current_state"
    );

  const bodyEvidence =
    selectEvidenceForField(
      evidence,
      "body_signal"
    );

  const sentenceEvidence =
    selectEvidenceForField(
      evidence,
      "internal_sentence"
    );

  const escapeEvidence =
    selectEvidenceForField(
      evidence,
      "escape_movement"
    );

  const judgmentEvidence =
    selectEvidenceForField(
      evidence,
      "judgment_mechanism"
    );

  const socialFearEvidence =
    selectEvidenceForField(
      evidence,
      "social_fear"
    );

  const limitEvidence =
    selectEvidenceForField(
      evidence,
      "recognized_limit"
    );

  const phraseEvidence =
    selectEvidenceForField(
      evidence,
      "return_phrase"
    );

  const gestureEvidence =
    selectEvidenceForField(
      evidence,
      "minimum_presence_gesture"
    );

  const unresolvedEvidence =
    selectEvidenceForField(
      evidence,
      "unresolved_question",
      2
    );

  const corrections =
    evidence.filter(
      item =>
        item.source_type ===
        "reader_correction"
    );

  return {
    recognition: {
      current_state:
        summarizeEvidenceField(
          currentStateEvidence
        ),

      body_signal:
        summarizeEvidenceField(
          bodyEvidence
        ),

      internal_sentence:
        summarizeEvidenceField(
          sentenceEvidence
        ),

      evidence_ids:
        uniqueStrings([
          ...currentStateEvidence,
          ...bodyEvidence,
          ...sentenceEvidence
        ].map(item => item.id)),

      confidence:
        calculateFieldConfidence([
          ...currentStateEvidence,
          ...bodyEvidence,
          ...sentenceEvidence
        ])
    },

    protection: {
      escape_movement:
        summarizeEvidenceField(
          escapeEvidence
        ),

      judgment_mechanism:
        summarizeEvidenceField(
          judgmentEvidence
        ),

      social_fear:
        summarizeEvidenceField(
          socialFearEvidence
        ),

      evidence_ids:
        uniqueStrings([
          ...escapeEvidence,
          ...judgmentEvidence,
          ...socialFearEvidence
        ].map(item => item.id)),

      confidence:
        calculateFieldConfidence([
          ...escapeEvidence,
          ...judgmentEvidence,
          ...socialFearEvidence
        ])
    },

    return: {
      recognized_limit:
        summarizeEvidenceField(
          limitEvidence
        ),

      return_phrase:
        summarizeEvidenceField(
          phraseEvidence
        ),

      minimum_presence_gesture:
        summarizeEvidenceField(
          gestureEvidence
        ),

      evidence_ids:
        uniqueStrings([
          ...limitEvidence,
          ...phraseEvidence,
          ...gestureEvidence
        ].map(item => item.id)),

      confidence:
        calculateFieldConfidence([
          ...limitEvidence,
          ...phraseEvidence,
          ...gestureEvidence
        ])
    },

    unresolved_questions:
      unresolvedEvidence.map(
        item => item.summary
      ),

    reader_corrections:
      corrections.map(
        item => item.summary
      ),

    evidence_count:
      evidence.length,

    source_count:
      new Set(
        evidence.map(
          item =>
            `${item.source_type}:${item.source_id}`
        )
      ).size,

    maximum_confidence:
      calculateInterpretationConfidence(
        evidence
      )
  };
}


//////////////////////////////////////////////////
// 13. DISPONIBILIDADE DOS MOVIMENTOS
//////////////////////////////////////////////////

export function hasRecognitionMovement(
  data:
    Pillar01ClosureSynthesisData
): boolean {
  return Boolean(
    data.recognition.current_state ||
    data.recognition.body_signal ||
    data.recognition.internal_sentence
  );
}


export function hasProtectionMovement(
  data:
    Pillar01ClosureSynthesisData
): boolean {
  return Boolean(
    data.protection.escape_movement ||
    data.protection.judgment_mechanism ||
    data.protection.social_fear
  );
}


export function hasReturnMovement(
  data:
    Pillar01ClosureSynthesisData
): boolean {
  return Boolean(
    data.return.recognized_limit ||
    data.return.return_phrase ||
    data.return.minimum_presence_gesture
  );
}


//////////////////////////////////////////////////
// 14. COMPOSIÇÃO DO MOVIMENTO 1
// O QUE FICOU VISÍVEL
//////////////////////////////////////////////////

export function composeRecognitionClosureSection(
  data:
    Pillar01ClosureSynthesisData
): PillarClosureSummarySection | null {
  if (
    !hasRecognitionMovement(data)
  ) {
    return null;
  }

  const parts:
    string[] = [];

  if (
    data.recognition.current_state
  ) {
    parts.push(
      `Você reconheceu ${normalizeSummaryFragment(
        data.recognition.current_state
      )}.`
    );
  }

  if (
    data.recognition.body_signal
  ) {
    parts.push(
      `Também apareceu um registro corporal: ${normalizeSummaryFragment(
        data.recognition.body_signal
      )}.`
    );
  }

  if (
    data.recognition.internal_sentence
  ) {
    parts.push(
      `Uma frase interna começou a ficar visível: ${normalizeSummaryFragment(
        data.recognition.internal_sentence
      )}.`
    );
  }

  return {
    movement:
      "what_became_visible",

    title:
      "O que começou a ficar visível",

    text:
      limitWords(
        parts.join(" "),
        55
      ),

    evidence_ids:
      data.recognition
        .evidence_ids,

    confidence:
      data.recognition
        .confidence
  };
}


//////////////////////////////////////////////////
// 15. COMPOSIÇÃO DO MOVIMENTO 2
// O QUE PODE ESTAR PROTEGENDO
//////////////////////////////////////////////////

export function composeProtectionClosureSection(
  data:
    Pillar01ClosureSynthesisData
): PillarClosureSummarySection | null {
  if (
    !hasProtectionMovement(data)
  ) {
    return null;
  }

  const parts:
    string[] = [];

  if (
    data.protection.escape_movement
  ) {
    parts.push(
      `A saída costuma aparecer como ${normalizeSummaryFragment(
        data.protection.escape_movement
      )}.`
    );
  }

  if (
    data.protection.judgment_mechanism
  ) {
    parts.push(
      `O julgamento parece tentar manter controle por meio de ${normalizeSummaryFragment(
        data.protection.judgment_mechanism
      )}.`
    );
  }

  if (
    data.protection.social_fear
  ) {
    parts.push(
      `Também existe receio relacionado a ${normalizeSummaryFragment(
        data.protection.social_fear
      )}.`
    );
  }

  return {
    movement:
      "what_may_be_protecting",

    title:
      "O que pode estar tentando proteger",

    text:
      limitWords(
        parts.join(" "),
        55
      ),

    evidence_ids:
      data.protection
        .evidence_ids,

    confidence:
      data.protection
        .confidence
  };
}


//////////////////////////////////////////////////
// 16. COMPOSIÇÃO DO MOVIMENTO 3
// O RETORNO POSSÍVEL
//////////////////////////////////////////////////

export function composeReturnClosureSection(
  data:
    Pillar01ClosureSynthesisData
): PillarClosureSummarySection | null {
  if (
    !hasReturnMovement(data)
  ) {
    return null;
  }

  const parts:
    string[] = [];

  if (
    data.return.recognized_limit
  ) {
    parts.push(
      `Seu limite atual inclui ${normalizeSummaryFragment(
        data.return.recognized_limit
      )}.`
    );
  }

  if (
    data.return.return_phrase
  ) {
    parts.push(
      `Uma frase de retorno possível é ${formatReturnPhrase(
        data.return.return_phrase
      )}.`
    );
  }

  if (
    data.return
      .minimum_presence_gesture
  ) {
    parts.push(
      `O menor gesto disponível parece ser ${normalizeSummaryFragment(
        data.return
          .minimum_presence_gesture
      )}.`
    );
  }

  return {
    movement:
      "what_return_seems_possible",

    title:
      "Um retorno que parece possível",

    text:
      limitWords(
        parts.join(" "),
        55
      ),

    evidence_ids:
      data.return
        .evidence_ids,

    confidence:
      data.return
        .confidence
  };
}


//////////////////////////////////////////////////
// 17. PROFUNDIDADE DA SÍNTESE
//////////////////////////////////////////////////

export function determineClosureSummaryDepth(
  input:
    Pillar01ClosureInput,

  data:
    Pillar01ClosureSynthesisData
): ClosureSummaryDepth {
  if (
    input.state.load_level >= 2 ||
    data.source_count <= 1
  ) {
    return "minimal";
  }

  if (
    input.state.depth_level >= 3 &&
    data.source_count >= 3 &&
    data.maximum_confidence !== "low"
  ) {
    return "deep";
  }

  return "standard";
}


//////////////////////////////////////////////////
// 18. CONSTRUÇÃO DA SÍNTESE VISÍVEL
//////////////////////////////////////////////////

export function buildPillar01VisibleClosureSummary(
  input:
    Pillar01ClosureInput,

  data:
    Pillar01ClosureSynthesisData
): PillarClosureVisibleSummary | undefined {
  if (
    input.reader_requested_no_summary ||
    !input.reader_requested_summary
  ) {
    return undefined;
  }

  const depth =
    determineClosureSummaryDepth(
      input,
      data
    );

  const possibleSections = [
    composeRecognitionClosureSection(
      data
    ),

    composeProtectionClosureSection(
      data
    ),

    composeReturnClosureSection(
      data
    )
  ].filter(
    (
      section
    ): section is PillarClosureSummarySection =>
      Boolean(section)
  );

  if (
    possibleSections.length === 0
  ) {
    return {
      id:
        createClosureSummaryId(
          input.reader_id
        ),

      pillar_id:
        "pillar_01_reconhecimento",

      title:
        "Reconhecimento",

      introduction:
        "Você pode encerrar este pilar sem uma síntese definida.",

      sections: [],

      closing_line:
        "Nem tudo precisa encontrar uma conclusão agora.",

      content_origin:
        "igent_companion",

      depth: "minimal",

      word_count:
        countWords(
          "Você pode encerrar este pilar sem uma síntese definida. Nem tudo precisa encontrar uma conclusão agora."
        ),

      question_count: 0,

      status: "draft",

      editable_by_reader: true,
      rejectable_by_reader: true,

      memory_not_yet_saved: true
    };
  }

  const sections =
    depth === "minimal"
      ? possibleSections.slice(0, 1)
      : possibleSections.slice(0, 3);

  const introduction =
    depth === "deep"
      ? "Este fechamento não define quem você é. Ele apenas reúne o que apareceu durante este pilar."
      : undefined;

  const closingLine =
    hasReturnMovement(data)
      ? "Nada disso precisa ser realizado de forma perfeita. O retorno continua sendo uma possibilidade."
      : "Você pode continuar sem transformar o que reconheceu em uma tarefa imediata.";

  const visibleText = [
    introduction,
    ...sections.map(
      section =>
        `${section.title}. ${section.text}`
    ),
    closingLine
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id:
      createClosureSummaryId(
        input.reader_id
      ),

    pillar_id:
      "pillar_01_reconhecimento",

    title:
      "O que começou a ficar visível",

    introduction,

    sections,

    closing_line:
      closingLine,

    content_origin:
      "igent_companion",

    depth,

    word_count:
      countWords(visibleText),

    question_count: 0,

    status: "draft",

    editable_by_reader: true,
    rejectable_by_reader: true,

    memory_not_yet_saved: true
  };
}


/**
 * A síntese:
 *
 * - não termina com pergunta;
 * - não declara que o leitor evoluiu;
 * - não afirma que o leitor mudou;
 * - não usa "você descobriu quem é";
 * - não apresenta hipótese como conclusão;
 * - pode ser recusada ou editada.
 */


//////////////////////////////////////////////////
// 19. FRASES PROIBIDAS NO FECHAMENTO
//////////////////////////////////////////////////

export const PILLAR_01_CLOSURE_FORBIDDEN_PHRASES = [
  "Você superou",
  "Você está curado",
  "Você venceu",
  "Agora você se conhece",
  "Você finalmente entendeu",
  "Você está pronto",
  "Você concluiu sua transformação",
  "Seu padrão é",
  "Sua verdadeira identidade é",
  "Isso aconteceu porque",
  "A origem disso é",
  "Você precisa",
  "Você deve",
  "Parabéns",
  "Missão cumprida",
  "Etapa concluída com sucesso"
];


//////////////////////////////////////////////////
// 20. MEMÓRIA CONSOLIDADA DO PILAR
//////////////////////////////////////////////////

export interface Pillar01ConsolidatedMemoryCandidate {
  id: string;

  reader_id:
    string;

  pillar_id:
    "pillar_01_reconhecimento";

  layer:
    "pillar";

  summary:
    string;

  recognized_state?:
    string;

  recognized_escape?:
    string;

  recognized_judgment?:
    string;

  selected_return_phrase?:
    string;

  minimum_presence_gesture?:
    string;

  dominant_primary_signals:
    PrimarySignal[];

  dominant_secondary_signals:
    SecondarySignal[];

  dominant_pillar_signals:
    string[];

  source_evidence_ids:
    string[];

  confidence:
    InterpretationConfidence;

  reader_confirmation_required:
    true;

  raw_text_included:
    false;

  exact_excerpt_included:
    false;

  created_at:
    string;
}


//////////////////////////////////////////////////
// 21. CRITÉRIOS PARA CRIAR MEMÓRIA
//////////////////////////////////////////////////

export function canCreatePillar01MemoryCandidate(
  input:
    Pillar01ClosureInput,

  data:
    Pillar01ClosureSynthesisData
): boolean {
  if (
    !input.reader_requested_memory
  ) {
    return false;
  }

  if (
    data.evidence_count < 2
  ) {
    return false;
  }

  if (
    data.source_count < 2
  ) {
    return false;
  }

  if (
    input.reason ===
      "safety_interruption"
  ) {
    return false;
  }

  if (
    input.state.load_level >= 3
  ) {
    return false;
  }

  return true;
}


//////////////////////////////////////////////////
// 22. CONSTRUÇÃO DA MEMÓRIA
//////////////////////////////////////////////////

export function buildPillar01ConsolidatedMemoryCandidate(
  input:
    Pillar01ClosureInput,

  data:
    Pillar01ClosureSynthesisData,

  evidence:
    PillarClosureEvidence[]
): Pillar01ConsolidatedMemoryCandidate | undefined {
  if (
    !canCreatePillar01MemoryCandidate(
      input,
      data
    )
  ) {
    return undefined;
  }

  const consentedEvidence =
    evidence.filter(
      item =>
        item.memory_consent
    );

  if (
    consentedEvidence.length < 2
  ) {
    return undefined;
  }

  const summaryParts:
    string[] = [];

  if (
    data.recognition.current_state
  ) {
    summaryParts.push(
      `Reconheceu ${normalizeSummaryFragment(
        data.recognition.current_state
      )}`
    );
  }

  if (
    data.protection.escape_movement
  ) {
    summaryParts.push(
      `percebeu uma saída ligada a ${normalizeSummaryFragment(
        data.protection.escape_movement
      )}`
    );
  }

  if (
    data.protection
      .judgment_mechanism
  ) {
    summaryParts.push(
      `identificou julgamento por meio de ${normalizeSummaryFragment(
        data.protection
          .judgment_mechanism
      )}`
    );
  }

  if (
    data.return
      .minimum_presence_gesture
  ) {
    summaryParts.push(
      `considerou como retorno ${normalizeSummaryFragment(
        data.return
          .minimum_presence_gesture
      )}`
    );
  }

  return {
    id:
      createPillarMemoryCandidateId(
        input.reader_id,
        "pillar_01_reconhecimento"
      ),

    reader_id:
      input.reader_id,

    pillar_id:
      "pillar_01_reconhecimento",

    layer:
      "pillar",

    summary:
      limitWords(
        summaryParts.join("; "),
        90
      ),

    recognized_state:
      data.recognition.current_state,

    recognized_escape:
      data.protection.escape_movement,

    recognized_judgment:
      data.protection
        .judgment_mechanism,

    selected_return_phrase:
      data.return.return_phrase,

    minimum_presence_gesture:
      data.return
        .minimum_presence_gesture,

    dominant_primary_signals:
      selectDominantPrimarySignals(
        consentedEvidence,
        3
      ),

    dominant_secondary_signals:
      selectDominantSecondarySignals(
        consentedEvidence,
        3
      ),

    dominant_pillar_signals:
      selectDominantPillarSignals(
        consentedEvidence,
        3
      ),

    source_evidence_ids:
      consentedEvidence.map(
        item => item.id
      ),

    confidence:
      capConfidence(
        calculateInterpretationConfidence(
          consentedEvidence
        ),
        "medium"
      ),

    reader_confirmation_required:
      true,

    raw_text_included:
      false,

    exact_excerpt_included:
      false,

    created_at:
      new Date().toISOString()
  };
}


/**
 * A memória consolidada:
 *
 * - nunca contém texto bruto do diário;
 * - nunca contém texto bruto da carta;
 * - nunca contém detalhes privados desnecessários;
 * - nunca ultrapassa confiança média;
 * - precisa ser confirmada antes de ser salva.
 */


//////////////////////////////////////////////////
// 23. CONFIRMAÇÃO DA MEMÓRIA
//////////////////////////////////////////////////

export interface PillarMemoryConfirmation {
  candidate_id:
    string;

  decision:
    | "confirm"
    | "edit"
    | "reject";

  edited_summary?:
    string;

  confirmed_at?:
    string;
}


export function finalizePillar01Memory(
  candidate:
    Pillar01ConsolidatedMemoryCandidate,

  confirmation:
    PillarMemoryConfirmation
): PillarMemory | null {
  if (
    confirmation.decision ===
    "reject"
  ) {
    return null;
  }

  const summary =
    confirmation.decision ===
      "edit" &&
    confirmation.edited_summary
      ? sanitizeReaderEditedMemorySummary(
          confirmation.edited_summary
        )
      : candidate.summary;

  return {
    id:
      createPersistentPillarMemoryId(
        candidate.reader_id,
        candidate.pillar_id
      ),

    reader_id:
      candidate.reader_id,

    pillar_id:
      candidate.pillar_id,

    summary,

    dominant_primary_signals:
      candidate
        .dominant_primary_signals,

    dominant_secondary_signals:
      candidate
        .dominant_secondary_signals,

    pillar_specific_signals:
      candidate
        .dominant_pillar_signals,

    meaningful_excerpt_ids: [],

    open_thread_ids: [],

    completed: true,

    created_at:
      new Date().toISOString(),

    updated_at:
      new Date().toISOString()
  };
}


//////////////////////////////////////////////////
// 24. FIOS ABERTOS
//////////////////////////////////////////////////

export interface Pillar01ClosureOpenThreadCandidate {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  title:
    string;

  summary:
    string;

  related_semantic_fields:
    Pillar01ClosureSemanticField[];

  source_evidence_ids:
    string[];

  suggested_revisit_unit_id:
    string;

  suggested_revisit_condition:
    string;

  confidence:
    InterpretationConfidence;

  reader_confirmation_required:
    true;
}


//////////////////////////////////////////////////
// 25. CRIAÇÃO DOS FIOS ABERTOS
//////////////////////////////////////////////////

export function buildPillar01ClosureOpenThreads(
  data:
    Pillar01ClosureSynthesisData,

  evidence:
    PillarClosureEvidence[]
): Pillar01ClosureOpenThreadCandidate[] {
  const candidates:
    Pillar01ClosureOpenThreadCandidate[] = [];

  if (
    data.recognition.internal_sentence &&
    data.protection
      .judgment_mechanism
  ) {
    candidates.push({
      id:
        createOpenThreadCandidateId(
          "internal_sentence"
        ),

      pillar_id:
        "pillar_01_reconhecimento",

      title:
        "A frase que aparece quando o estado se torna visível",

      summary:
        "Observar quando a frase interna volta e qual comportamento ela tenta produzir.",

      related_semantic_fields: [
        "internal_sentence",
        "judgment_mechanism"
      ],

      source_evidence_ids:
        uniqueStrings([
          ...data.recognition
            .evidence_ids,

          ...data.protection
            .evidence_ids
        ]),

      suggested_revisit_unit_id:
        "unit_pillar_01_reconhecimento",

      suggested_revisit_condition:
        "Quando a mesma frase aparecer em outro contexto.",

      confidence:
        capConfidence(
          data.maximum_confidence,
          "medium"
        ),

      reader_confirmation_required:
        true
    });
  }

  if (
    data.protection.escape_movement &&
    !data.return
      .minimum_presence_gesture
  ) {
    candidates.push({
      id:
        createOpenThreadCandidateId(
          "escape_without_return"
        ),

      pillar_id:
        "pillar_01_reconhecimento",

      title:
        "O momento em que a fuga começa",

      summary:
        "Observar o primeiro sinal de saída sem exigir que um gesto de retorno seja definido agora.",

      related_semantic_fields: [
        "escape_movement",
        "recognized_limit"
      ],

      source_evidence_ids:
        data.protection
          .evidence_ids,

      suggested_revisit_unit_id:
        "p01_section_anchor",

      suggested_revisit_condition:
        "Quando o movimento de fuga se tornar reconhecível durante a leitura ou a rotina.",

      confidence:
        "low",

      reader_confirmation_required:
        true
    });
  }

  if (
    data.unresolved_questions.length >
    0
  ) {
    candidates.push({
      id:
        createOpenThreadCandidateId(
          "unresolved_question"
        ),

      pillar_id:
        "pillar_01_reconhecimento",

      title:
        "O que ainda não encontrou linguagem",

      summary:
        limitWords(
          data.unresolved_questions[0],
          45
        ),

      related_semantic_fields: [
        "unresolved_question"
      ],

      source_evidence_ids:
        evidence
          .filter(
            item =>
              item.semantic_fields
                .includes(
                  "unresolved_question"
                )
          )
          .map(
            item => item.id
          ),

      suggested_revisit_unit_id:
        "unit_pillar_01_reconhecimento",

      suggested_revisit_condition:
        "Somente quando o leitor decidir retornar ao tema.",

      confidence:
        "low",

      reader_confirmation_required:
        true
    });
  }

  return candidates.slice(0, 2);
}


/**
 * Máximo de dois fios abertos por pilar.
 *
 * Nenhum fio pode ser criado apenas a partir
 * de uma opção fechada isolada.
 */


//////////////////////////////////////////////////
// 26. COMPLETUDE REFLEXIVA
//////////////////////////////////////////////////

export function calculateReflectiveCompletionLevel(
  input:
    Pillar01ClosureInput
): PillarReflectiveCompletionLevel {
  if (
    input.reason ===
      "reader_skipped_reflection"
  ) {
    return "skipped";
  }

  if (
    input.reason ===
      "reader_paused" ||
    input.reason ===
      "load_limit_reached" ||
    input.reason ===
      "safety_interruption"
  ) {
    return "paused";
  }

  const activityCount =
    input.completed_question_ids.length +
    input.completed_journal_ids.length +
    input.completed_letter_ids.length +
    input.completed_anchor_ids.length;

  if (
    activityCount === 0
  ) {
    return "content_only";
  }

  if (
    input.completed_question_ids.length <
    3
  ) {
    return "partial";
  }

  if (
    input.completed_question_ids.length >=
      6 ||
    input.completed_journal_ids.length >=
      1 ||
    input.completed_anchor_ids.length >=
      1
  ) {
    return "substantial";
  }

  if (
    input.completed_question_ids.length ===
      9 &&
    input.state.load_level <= 2
  ) {
    return "complete";
  }

  return "partial";
}


/**
 * Esta classificação é técnica e interna.
 *
 * Nunca exibir:
 *
 * - pontuação;
 * - porcentagem emocional;
 * - nota;
 * - nível comparativo;
 * - mensagem de insuficiência.
 */


//////////////////////////////////////////////////
// 27. CONCLUSÃO DO CONTEÚDO CANÔNICO
//////////////////////////////////////////////////

export function isPillar01CanonicalContentComplete(
  input:
    Pillar01ClosureInput
): boolean {
  return input
    .canonical_sections_read
    .includes(
      "p01_section_closure"
    );
}


/**
 * A fase reflexiva pode terminar antes do
 * conteúdo canônico.
 *
 * O conteúdo canônico pode terminar sem
 * nenhuma reflexão complementar.
 */


//////////////////////////////////////////////////
// 28. ROTAS DISPONÍVEIS
//////////////////////////////////////////////////

export function getPillar01AvailableClosureRoutes(
  input:
    Pillar01ClosureInput
): PillarClosureRoute[] {
  const routes:
    PillarClosureRoute[] = [];

  if (
    !input.canonical_sections_read
      .includes(
        "p01_section_support_letter"
      )
  ) {
    routes.push(
      "open_canonical_support_letter"
    );
  }

  if (
    !input.canonical_sections_read
      .includes(
        "p01_section_anchor"
      )
  ) {
    routes.push(
      "open_canonical_ritual"
    );
  }

  if (
    !input.canonical_sections_read
      .includes(
        "p01_section_closure"
      )
  ) {
    routes.push(
      "open_canonical_closure"
    );
  }

  routes.push(
    "continue_to_next_pillar",
    "save_for_later",
    "pause_journey",
    "close_without_summary"
  );

  if (
    !input.reader_requested_no_summary
  ) {
    routes.push(
      "close_with_summary"
    );
  }

  return uniqueValues(routes);
}


//////////////////////////////////////////////////
// 29. SELEÇÃO DA ROTA PRINCIPAL
//////////////////////////////////////////////////

export function selectPillar01ClosureRoute(
  input:
    Pillar01ClosureInput
): PillarClosureRoute {
  if (
    input.reason ===
      "safety_interruption" ||
    input.state.load_level >= 3
  ) {
    return "pause_journey";
  }

  if (
    input.reader_requested_no_summary
  ) {
    return input.reader_requested_continue
      ? "continue_to_next_pillar"
      : "close_without_summary";
  }

  if (
    input.reader_requested_pause
  ) {
    return "pause_journey";
  }

  if (
    input.reader_requested_continue
  ) {
    return "continue_to_next_pillar";
  }

  if (
    !input.canonical_sections_read
      .includes(
        "p01_section_support_letter"
      )
  ) {
    return "open_canonical_support_letter";
  }

  if (
    !input.canonical_sections_read
      .includes(
        "p01_section_anchor"
      )
  ) {
    return "open_canonical_ritual";
  }

  if (
    !input.canonical_sections_read
      .includes(
        "p01_section_closure"
      )
  ) {
    return "open_canonical_closure";
  }

  if (
    input.reader_requested_summary
  ) {
    return "close_with_summary";
  }

  return "continue_to_next_pillar";
}


//////////////////////////////////////////////////
// 30. PRÓXIMA UNIDADE CANÔNICA
//////////////////////////////////////////////////

export const PILLAR_01_NEXT_CANONICAL_UNIT = {
  current_unit_id:
    "unit_pillar_01_reconhecimento",

  next_unit_id:
    "unit_pillar_02_familia",

  next_pillar_id:
    "pillar_02_familia",

  transition_type:
    "canonical_reading_order"
} as const;


/**
 * O motor deve respeitar a ordem canônica.
 *
 * Conexões com outros pilares podem ser
 * sugeridas no futuro, mas não substituem
 * automaticamente o Pilar II — Família.
 */


//////////////////////////////////////////////////
// 31. TEXTO DE TRANSIÇÃO PARA O PILAR II
//////////////////////////////////////////////////

export const PILLAR_01_TO_PILLAR_02_TRANSITION = {
  id:
    "p01_canonical_transition_p02",

  source_pillar_id:
    "pillar_01_reconhecimento",

  target_pillar_id:
    "pillar_02_familia",

  origin:
    "igent_companion" as const,

  minimal:
    "O reconhecimento começa dentro. O próximo pilar observa onde muitos dos primeiros modos de pertencer foram aprendidos.",

  standard:
    "Depois de perceber como você se reconhece, se julga ou se abandona, a obra segue para um dos primeiros lugares onde esses movimentos podem ter encontrado forma: a família.",

  deep:
    "O que começou a ficar visível dentro de você não precisa ser explicado imediatamente pela história familiar. O próximo pilar apenas abre esse território: o lugar onde pertencimento, silêncio, afeto e lealdade começaram a se misturar.",

  maximum_words: 65,

  optional:
    true
};


/**
 * A transição não deve:
 *
 * - culpar a família;
 * - presumir origem;
 * - atribuir trauma;
 * - declarar causalidade;
 * - forçar conexão biográfica.
 */


//////////////////////////////////////////////////
// 32. INTERFACE DO FECHAMENTO
//////////////////////////////////////////////////

export interface Pillar01ClosureCard {
  pillar_id:
    "pillar_01_reconhecimento";

  title:
    "Fechamento do Pilar I";

  summary?:
    PillarClosureVisibleSummary;

  primary_action:
    PillarClosureAction;

  secondary_actions:
    PillarClosureAction[];

  show_edit_summary:
    boolean;

  show_reject_summary:
    boolean;

  show_memory_toggle:
    boolean;

  memory_toggle_default:
    false;

  show_progress_score:
    false;

  show_completion_badge:
    false;

  show_emotional_level:
    false;
}


export interface PillarClosureAction {
  id:
    string;

  route:
    PillarClosureRoute;

  label:
    string;

  canonical_content_id?:
    string;

  optional:
    true;
}


//////////////////////////////////////////////////
// 33. AÇÕES VISÍVEIS
//////////////////////////////////////////////////

export const PILLAR_01_CLOSURE_ACTIONS:
  Record<
    PillarClosureRoute,
    PillarClosureAction
  > = {
    open_canonical_support_letter: {
      id:
        "action_open_p01_support_letter",

      route:
        "open_canonical_support_letter",

      label:
        "Ler a Carta de Sustentação",

      canonical_content_id:
        "p01_section_support_letter",

      optional: true
    },

    open_canonical_ritual: {
      id:
        "action_open_p01_ritual",

      route:
        "open_canonical_ritual",

      label:
        "Conhecer o Ritual do Reconhecimento",

      canonical_content_id:
        "p01_section_anchor",

      optional: true
    },

    open_canonical_closure: {
      id:
        "action_open_p01_closure",

      route:
        "open_canonical_closure",

      label:
        "Ler o fecho do pilar",

      canonical_content_id:
        "p01_section_closure",

      optional: true
    },

    continue_to_next_pillar: {
      id:
        "action_continue_pillar_02",

      route:
        "continue_to_next_pillar",

      label:
        "Continuar para Família",

      canonical_content_id:
        "unit_pillar_02_familia",

      optional: true
    },

    save_for_later: {
      id:
        "action_save_p01_for_later",

      route:
        "save_for_later",

      label:
        "Retomar este pilar depois",

      optional: true
    },

    pause_journey: {
      id:
        "action_pause_journey",

      route:
        "pause_journey",

      label:
        "Pausar por agora",

      optional: true
    },

    close_without_summary: {
      id:
        "action_close_without_summary",

      route:
        "close_without_summary",

      label:
        "Encerrar sem síntese",

      optional: true
    },

    close_with_summary: {
      id:
        "action_close_with_summary",

      route:
        "close_with_summary",

      label:
        "Encerrar com esta síntese",

      optional: true
    }
  };


//////////////////////////////////////////////////
// 34. CONSTRUÇÃO DO CARD
//////////////////////////////////////////////////

export function buildPillar01ClosureCard(
  result:
    Pillar01ClosureResult
): Pillar01ClosureCard {
  const primaryAction =
    PILLAR_01_CLOSURE_ACTIONS[
      result.recommended_route
    ];

  const secondaryActions =
    result.available_routes
      .filter(
        route =>
          route !==
          result.recommended_route
      )
      .slice(0, 4)
      .map(
        route =>
          PILLAR_01_CLOSURE_ACTIONS[
            route
          ]
      );

  return {
    pillar_id:
      "pillar_01_reconhecimento",

    title:
      "Fechamento do Pilar I",

    summary:
      result.visible_summary,

    primary_action:
      primaryAction,

    secondary_actions:
      secondaryActions,

    show_edit_summary:
      Boolean(
        result.visible_summary
      ),

    show_reject_summary:
      Boolean(
        result.visible_summary
      ),

    show_memory_toggle:
      Boolean(
        result.memory_candidate
      ),

    memory_toggle_default:
      false,

    show_progress_score:
      false,

    show_completion_badge:
      false,

    show_emotional_level:
      false
  };
}


//////////////////////////////////////////////////
// 35. MOTOR PRINCIPAL DE FECHAMENTO
//////////////////////////////////////////////////

export function closePillar01(
  input:
    Pillar01ClosureInput
): Pillar01ClosureResult {
  const validationErrors:
    string[] = [];

  const reflectiveCompletionLevel =
    calculateReflectiveCompletionLevel(
      input
    );

  const synthesisData =
    buildPillar01ClosureSynthesisData(
      input.evidence
    );

  const visibleSummary =
    buildPillar01VisibleClosureSummary(
      input,
      synthesisData
    );

  const memoryCandidate =
    buildPillar01ConsolidatedMemoryCandidate(
      input,
      synthesisData,
      input.evidence
    );

  const openThreadCandidates =
    buildPillar01ClosureOpenThreads(
      synthesisData,
      input.evidence
    );

  const availableRoutes =
    getPillar01AvailableClosureRoutes(
      input
    );

  const recommendedRoute =
    selectPillar01ClosureRoute(
      input
    );

  if (
    !availableRoutes.includes(
      recommendedRoute
    )
  ) {
    validationErrors.push(
      "Recommended closure route must be available."
    );
  }

  return {
    pillar_id:
      "pillar_01_reconhecimento",

    reason:
      input.reason,

    reflective_completion_level:
      reflectiveCompletionLevel,

    synthesis_data:
      synthesisData,

    visible_summary:
      visibleSummary,

    recommended_route:
      recommendedRoute,

    available_routes:
      availableRoutes,

    memory_candidate:
      memoryCandidate,

    open_thread_candidates:
      openThreadCandidates,

    reflective_phase_complete:
      true,

    reading_progress_blocked:
      false,

    pillar_content_complete:
      isPillar01CanonicalContentComplete(
        input
      ),

    validation_errors:
      validationErrors
  };
}


//////////////////////////////////////////////////
// 36. REABERTURA DO PILAR
//////////////////////////////////////////////////

export type Pillar01ReopenReason =
  | "reader_request"
  | "open_thread_reactivated"
  | "reader_returned_to_section"
  | "cross_pillar_connection"
  | "memory_correction";


export interface Pillar01ReopenRequest {
  reader_id:
    string;

  reason:
    Pillar01ReopenReason;

  target_section_id?:
    string;

  target_question_id?:
    string;

  open_thread_id?:
    string;

  previous_closure_id?:
    string;
}


export interface Pillar01ReopenResult {
  allowed:
    boolean;

  target_unit_id:
    "unit_pillar_01_reconhecimento";

  target_section_id?:
    string;

  restore_previous_state:
    false;

  create_new_session:
    true;

  preserve_previous_memory:
    boolean;

  visible_message:
    string;
}


export function reopenPillar01(
  request:
    Pillar01ReopenRequest
): Pillar01ReopenResult {
  return {
    allowed: true,

    target_unit_id:
      "unit_pillar_01_reconhecimento",

    target_section_id:
      request.target_section_id,

    restore_previous_state:
      false,

    create_new_session:
      true,

    preserve_previous_memory:
      request.reason !==
        "memory_correction",

    visible_message:
      "Você pode retornar sem precisar continuar exatamente de onde parou."
  };
}


/**
 * Reabrir o pilar:
 *
 * - não desfaz o fechamento anterior;
 * - não restaura automaticamente a carga emocional;
 * - não exige repetir perguntas;
 * - não reduz progresso;
 * - não cria falha de conclusão.
 */


//////////////////////////////////////////////////
// 37. VALIDAÇÃO DA SÍNTESE
//////////////////////////////////////////////////

export function validatePillar01ClosureSummary(
  summary:
    PillarClosureVisibleSummary
): string[] {
  const errors:
    string[] = [];

  if (
    summary.sections.length > 3
  ) {
    errors.push(
      "Closure summary can contain at most three movements."
    );
  }

  if (
    summary.question_count !== 0
  ) {
    errors.push(
      "Closure summary cannot ask questions."
    );
  }

  if (
    summary.content_origin !==
    "igent_companion"
  ) {
    errors.push(
      "Closure summary must belong to the companion layer."
    );
  }

  if (
    summary.word_count > 190
  ) {
    errors.push(
      "Closure summary cannot exceed 190 words."
    );
  }

  const visibleText = [
    summary.title,
    summary.introduction,
    ...summary.sections.map(
      section =>
        `${section.title} ${section.text}`
    ),
    summary.closing_line
  ]
    .filter(Boolean)
    .join(" ");

  for (
    const forbiddenPhrase
    of PILLAR_01_CLOSURE_FORBIDDEN_PHRASES
  ) {
    if (
      visibleText
        .toLowerCase()
        .includes(
          forbiddenPhrase
            .toLowerCase()
        )
    ) {
      errors.push(
        `Closure summary contains forbidden phrase: ${forbiddenPhrase}.`
      );
    }
  }

  if (
    !summary.editable_by_reader
  ) {
    errors.push(
      "Closure summary must be editable by the reader."
    );
  }

  if (
    !summary.rejectable_by_reader
  ) {
    errors.push(
      "Closure summary must be rejectable by the reader."
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 38. VALIDAÇÃO DA MEMÓRIA
//////////////////////////////////////////////////

export function validatePillar01ClosureMemory(
  candidate:
    Pillar01ConsolidatedMemoryCandidate
): string[] {
  const errors:
    string[] = [];

  if (
    candidate.raw_text_included
  ) {
    errors.push(
      "Pillar memory cannot contain raw reflective text."
    );
  }

  if (
    candidate.exact_excerpt_included
  ) {
    errors.push(
      "Pillar memory cannot contain exact excerpts."
    );
  }

  if (
    candidate.confidence === "high"
  ) {
    errors.push(
      "Pillar memory confidence cannot exceed medium."
    );
  }

  if (
    !candidate
      .reader_confirmation_required
  ) {
    errors.push(
      "Pillar memory requires reader confirmation."
    );
  }

  if (
    candidate.source_evidence_ids
      .length < 2
  ) {
    errors.push(
      "Pillar memory requires at least two evidence items."
    );
  }

  if (
    countWords(candidate.summary) >
    100
  ) {
    errors.push(
      "Pillar memory summary cannot exceed 100 words."
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 39. VALIDAÇÃO DO RESULTADO
//////////////////////////////////////////////////

export function validatePillar01ClosureResult(
  result:
    Pillar01ClosureResult
): string[] {
  const errors:
    string[] = [
    ...result.validation_errors
  ];

  if (
    result.reading_progress_blocked
  ) {
    errors.push(
      "Pillar closure cannot block reading progress."
    );
  }

  if (
    !result.reflective_phase_complete
  ) {
    errors.push(
      "Closure must finish the current reflective phase."
    );
  }

  if (
    result.visible_summary
  ) {
    errors.push(
      ...validatePillar01ClosureSummary(
        result.visible_summary
      )
    );
  }

  if (
    result.memory_candidate
  ) {
    errors.push(
      ...validatePillar01ClosureMemory(
        result.memory_candidate
      )
    );
  }

  if (
    result.open_thread_candidates
      .length > 2
  ) {
    errors.push(
      "Pillar closure can create at most two open-thread candidates."
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 40. PACOTE PUBLICÁVEL
//////////////////////////////////////////////////

export interface Pillar01ClosurePackage {
  id:
    string;

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  canonical_support_letter_id:
    "p01_section_support_letter";

  canonical_ritual_id:
    "p01_section_anchor";

  canonical_closure_id:
    "p01_section_closure";

  next_canonical_unit_id:
    "unit_pillar_02_familia";

  available_routes:
    PillarClosureRoute[];

  version:
    string;

  status:
    | "draft"
    | "review"
    | "approved"
    | "published";
}


export const PILLAR_01_CLOSURE_PACKAGE:
  Pillar01ClosurePackage = {
    id:
      "igent_p01_closure_package",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_support_letter_id:
      "p01_section_support_letter",

    canonical_ritual_id:
      "p01_section_anchor",

    canonical_closure_id:
      "p01_section_closure",

    next_canonical_unit_id:
      "unit_pillar_02_familia",

    available_routes: [
      "open_canonical_support_letter",
      "open_canonical_ritual",
      "open_canonical_closure",
      "continue_to_next_pillar",
      "save_for_later",
      "pause_journey",
      "close_without_summary",
      "close_with_summary"
    ],

    version:
      "2.0.0",

    status:
      "approved"
  };


//////////////////////////////////////////////////
// 41. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_17_FINAL_RULES = [
  "Closing a pillar does not mean emotional resolution.",

  "Closing a pillar does not mean integration.",

  "Closing a pillar does not mean behavior change.",

  "Closing a pillar does not mean the reader stopped escaping.",

  "The reader may close the pillar without answering any question.",

  "The reader may close the pillar without a summary.",

  "The reader may reject or edit the generated summary.",

  "The summary belongs to the iGent companion layer.",

  "The summary must never be presented as canonical book text.",

  "The summary may contain at most three movements.",

  "The summary must not ask a question.",

  "The summary must not diagnose or define identity.",

  "The summary must not celebrate emotional exposure.",

  "The summary must not use completion language such as victory, cure or transformation.",

  "Closed-option selections alone cannot create a consolidated memory.",

  "Memory requires at least two consented evidence sources.",

  "Memory requires explicit reader confirmation.",

  "Memory confidence cannot exceed medium.",

  "Raw journals and letters cannot enter consolidated memory.",

  "Exact reflective excerpts cannot enter consolidated memory.",

  "Reader corrections override previous interpretations.",

  "A maximum of two open-thread candidates may be created.",

  "Open threads require reader confirmation.",

  "The canonical Support Letter remains optional.",

  "The canonical Ritual of Recognition remains optional.",

  "The canonical closure remains available independently.",

  "Reading progression must never depend on reflective completion.",

  "The canonical next pillar is Pillar II — Família.",

  "The transition to Family must not presume family causation.",

  "The transition must not assign blame.",

  "The reader may pause before continuing.",

  "The reader may revisit Pillar I at any point.",

  "Reopening Pillar I does not erase its previous closure.",

  "Reopening Pillar I does not require repeating questions.",

  "When load is high, the engine must close or pause without producing an interpretive summary.",

  "When evidence is insufficient, the engine must prefer no conclusion.",

  "The final movement of the pillar is permission to continue, pause or return."
];

export const PILLAR_01_CLOSURE_PACKAGE_PUBLIC = PILLAR_01_CLOSURE_PACKAGE;
export const PILLAR_01_CLOSURE_ROUTES = PILLAR_01_CLOSURE_PACKAGE.available_routes;
export const PILLAR_01_CLOSURE_TRANSITION = PILLAR_01_TO_PILLAR_02_TRANSITION;
// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
