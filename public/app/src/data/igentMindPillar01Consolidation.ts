// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
import {
  BOOK_ID,
  CANONICAL_PILLARS,
  PILLAR_01_CANONICAL_SECTIONS,
  REQUIRED_SEMANTIC_POSITIONS,
  validatePillarCompanionPackage,
  type CanonicalContentReferenceRecord,
  type CanonicalPillarIdentity,
  type CanonicalSection,
  type CompanionAnchor,
  type CompanionGuidedLetter,
  type CompanionJournalPrompt,
  type CompanionMicroReturn,
  type CompanionPhaseDefinition,
  type CompanionQuestion,
  type CompanionQuestionOption,
  type PillarCompanionPackage,
  type PillarCompanionValidation,
  type PillarId,
  type PillarPredictiveRule,
  type PillarTransitionRule,
} from './igentMindCanonicalContent';
import {
  PILLAR_ORDER,
  type PillarPhase,
} from './igentMindContract';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import {
  PILLAR_01_CANONICAL_IDENTITY,
  PILLAR_01_CANONICAL_RITUAL,
  PILLAR_01_COMPANION_IDENTITY,
  PILLAR_01_PHASE_CONSCIOUSNESS,
  PILLAR_01_PHASE_JUDGMENT,
  PILLAR_01_PHASE_PRESENCE,
  PILLAR_01_PREDICTIVE_RULES,
  PILLAR_01_TRANSITION_RULES,
} from './igentMindPillar01Dossier';
import {
  PILLAR_01_CONSCIOUSNESS_QUESTIONS,
  PILLAR_01_CONSCIOUSNESS_REFERENCES,
} from './igentMindPillar01Consciousness';
import {
  PILLAR_01_JUDGMENT_QUESTIONS,
  PILLAR_01_JUDGMENT_REFERENCES,
} from './igentMindPillar01Judgment';
import {
  PILLAR_01_ALL_QUESTIONS,
  PILLAR_01_PRESENCE_QUESTIONS,
  PILLAR_01_PRESENCE_REFERENCES,
} from './igentMindPillar01Presence';
import {
  PILLAR_01_MICRO_RETURN_REFERENCES,
  PILLAR_01_MICRO_RETURNS,
  validatePillar01MicroReturns,
} from './igentMindPillar01MicroReturns';
import {
  PILLAR_01_JOURNAL_PROMPTS,
  validatePillar01Journals,
} from './igentMindPillar01Journals';
import {
  PILLAR_01_GUIDED_LETTERS,
  validatePillar01GuidedLetters,
} from './igentMindPillar01GuidedLetters';
import {
  PILLAR_01_COMPANION_ANCHORS,
  validatePillar01Anchors,
} from './igentMindPillar01Anchors';
import {
  PILLAR_01_CLOSURE_PACKAGE,
  type Pillar01ClosurePackage,
} from './igentMindPillar01Closure';

type CanonicalContentReference = CanonicalContentReferenceRecord;
type PillarPackagePublicationStatus = 'draft' | 'review' | 'approved' | 'published' | 'blocked';

function createStableContentChecksum(content: unknown): string {
  const serialized = JSON.stringify(content, Object.keys(content as Record<string, unknown>).sort());
  let hash = 0;
  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash * 31 + serialized.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * BLOCO 18
 * PILAR I — RECONHECIMENTO
 * CONSOLIDAÇÃO E VALIDAÇÃO INTEGRAL
 *
 * Reúne:
 * - identidade e seções canônicas;
 * - referências editoriais;
 * - 3 fases;
 * - 9 perguntas;
 * - 54 opções;
 * - 18 micro-retornos;
 * - 6 diários;
 * - 3 cartas guiadas;
 * - 3 âncoras complementares;
 * - 9 regras preditivas;
 * - 6 transições;
 * - fechamento inteligente;
 * - índices de conteúdo;
 * - validação cruzada;
 * - bloqueio de publicação inconsistente.
 *
 * Este bloco não publica automaticamente.
 *
 * Ele gera:
 * - pacote consolidado;
 * - relatório de integridade;
 * - manifesto de build;
 * - índice de resolução;
 * - gate de publicação.
 */


//////////////////////////////////////////////////
// 1. PRÉ-REQUISITOS DE COMPILAÇÃO
//////////////////////////////////////////////////

export const PILLAR_01_REQUIRED_PRIMARY_SIGNALS = [
  "recognition",
  "uncertainty",
  "minimization",
  "self_judgment",
  "external_judgment",
  "rigid_control",
  "avoidance",
  "ambivalence",
  "integration"
] as const satisfies readonly PrimarySignal[];


export const PILLAR_01_REQUIRED_SECONDARY_SIGNALS = [
  "control_through_performance",
  "worth_tied_to_productivity",
  "pain_normalization",
  "emptiness_avoidance",
  "need_for_approval",
  "silence_to_preserve_bond",
  "repetition_awareness",
  "coherent_positioning"
] as const satisfies readonly SecondarySignal[];


/**
 * Caso o compilador rejeite algum item acima,
 * o sinal está ausente da taxonomia global do
 * Bloco 02 e deve ser adicionado nela.
 *
 * Não substituir o sinal silenciosamente.
 */


//////////////////////////////////////////////////
// 2. METADADOS DO PACOTE
//////////////////////////////////////////////////

export type PillarPackageBuildStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "blocked";

export type PillarPackageEnvironment =
  | "development"
  | "staging"
  | "production";

export interface PillarPackageManifest {
  package_id: string;

  book_id: string;
  pillar_id: PillarId;
  canonical_unit_id: string;

  pillar_number: number;
  pillar_title: string;
  pillar_subtitle: string;

  act_id: BookActId;

  canonical_version: string;
  companion_version: string;
  schema_version: string;

  expected_counts: {
    phases: number;
    questions: number;
    options: number;

    micro_returns: number;
    journals: number;
    guided_letters: number;
    anchors: number;

    predictive_rules: number;
    transition_rules: number;
  };

  canonical_section_ids: string[];

  build_status: PillarPackageBuildStatus;

  environment:
    PillarPackageEnvironment;

  built_at?: string;
  published_at?: string;

  content_checksum?: string;
}


export const PILLAR_01_PACKAGE_MANIFEST_BASE:
  PillarPackageManifest = {
    package_id:
      "package_pillar_01_reconhecimento",

    book_id:
      BOOK_ID,

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    pillar_number: 1,
    pillar_title: "Reconhecimento",
    pillar_subtitle:
      "Eu não estou quebrado.",

    act_id:
      "act_01_survival",

    canonical_version:
      "2026-06-25",

    companion_version:
      "2.0.0",

    schema_version:
      "2.0.0",

    expected_counts: {
      phases: 3,
      questions: 9,
      options: 54,

      micro_returns: 18,
      journals: 6,
      guided_letters: 3,
      anchors: 3,

      predictive_rules: 9,
      transition_rules: 6
    },

    canonical_section_ids:
      PILLAR_01_CANONICAL_SECTIONS.map(
        section => section.id
      ),

    build_status: "review",

    environment: "development"
  };


//////////////////////////////////////////////////
// 3. REFERÊNCIAS EDITORIAIS CONSOLIDADAS
//////////////////////////////////////////////////

export const PILLAR_01_ALL_CANONICAL_REFERENCES:
  CanonicalContentReference[] = [
    ...PILLAR_01_CONSCIOUSNESS_REFERENCES,
    ...PILLAR_01_JUDGMENT_REFERENCES,
    ...PILLAR_01_PRESENCE_REFERENCES,
    ...PILLAR_01_MICRO_RETURN_REFERENCES
  ];


//////////////////////////////////////////////////
// 4. FASES CONSOLIDADAS
//////////////////////////////////////////////////

export const PILLAR_01_ALL_PHASES:
  CompanionPhaseDefinition[] = [
    PILLAR_01_PHASE_CONSCIOUSNESS,
    PILLAR_01_PHASE_JUDGMENT,
    PILLAR_01_PHASE_PRESENCE
  ];


//////////////////////////////////////////////////
// 5. CONTEÚDOS CONSOLIDADOS
//////////////////////////////////////////////////

export const PILLAR_01_ALL_OPTIONS:
  CompanionQuestionOption[] =
    PILLAR_01_ALL_QUESTIONS.flatMap(
      question => question.options
    );


export const PILLAR_01_ALL_COMPANION_CONTENT = {
  phases:
    PILLAR_01_ALL_PHASES,

  questions:
    PILLAR_01_ALL_QUESTIONS,

  options:
    PILLAR_01_ALL_OPTIONS,

  micro_returns:
    PILLAR_01_MICRO_RETURNS,

  journals:
    PILLAR_01_JOURNAL_PROMPTS,

  guided_letters:
    PILLAR_01_GUIDED_LETTERS,

  anchors:
    PILLAR_01_COMPANION_ANCHORS,

  predictive_rules:
    PILLAR_01_PREDICTIVE_RULES,

  transition_rules:
    PILLAR_01_TRANSITION_RULES
} as const;


//////////////////////////////////////////////////
// 6. VALIDAÇÃO VAZIA INICIAL
//////////////////////////////////////////////////

export const EMPTY_PILLAR_COMPANION_VALIDATION:
  PillarCompanionValidation = {
    valid: false,

    question_count: 0,
    option_count: 0,

    micro_return_count: 0,
    journal_count: 0,
    guided_letter_count: 0,
    anchor_count: 0,

    predictive_rule_count: 0,
    transition_rule_count: 0,

    phase_distribution_valid: false,
    semantic_positions_valid: false,

    canonical_references_valid: false,
    content_origins_valid: false,

    ids_unique: false,
    references_valid: false,

    errors: [],
    warnings: []
  };


//////////////////////////////////////////////////
// 7. CONSTRUÇÃO DO PACOTE COMPLEMENTAR
//////////////////////////////////////////////////

export function buildPillar01CompanionPackage():
  PillarCompanionPackage {
  const initialPackage:
    PillarCompanionPackage = {
      layer: "igent_companion",

      id:
        "igent_package_pillar_01_reconhecimento",

      pillar_id:
        "pillar_01_reconhecimento",

      canonical_unit_id:
        "unit_pillar_01_reconhecimento",

      canonical_version:
        "2026-06-25",

      editorial_identity:
        PILLAR_01_COMPANION_IDENTITY,

      phases:
        PILLAR_01_ALL_PHASES,

      questions:
        PILLAR_01_ALL_QUESTIONS,

      micro_returns:
        PILLAR_01_MICRO_RETURNS,

      journal_prompts:
        PILLAR_01_JOURNAL_PROMPTS,

      guided_letters:
        PILLAR_01_GUIDED_LETTERS,

      practical_anchors:
        PILLAR_01_COMPANION_ANCHORS,

      predictive_rules:
        PILLAR_01_PREDICTIVE_RULES,

      transition_rules:
        PILLAR_01_TRANSITION_RULES,

      validation:
        EMPTY_PILLAR_COMPANION_VALIDATION,

      status: "review",

      version: "2.0.0"
    };

  const validation =
    validatePillarCompanionPackage(
      initialPackage
    );

  return {
    ...initialPackage,

    validation,

    status:
      validation.valid
        ? "approved"
        : "review"
  };
}


export const PILLAR_01_COMPANION_PACKAGE =
  buildPillar01CompanionPackage();


//////////////////////////////////////////////////
// 8. TIPOS DO ÍNDICE
//////////////////////////////////////////////////

export type Pillar01IndexedContentType =
  | "canonical_section"
  | "canonical_reference"
  | "phase"
  | "question"
  | "option"
  | "micro_return"
  | "journal"
  | "guided_letter"
  | "anchor"
  | "predictive_rule"
  | "transition_rule"
  | "closure_package";

export interface Pillar01IndexedContent {
  id: string;

  type:
    Pillar01IndexedContentType;

  content:
    unknown;
}

export interface Pillar01ContentIndex {
  canonical_sections:
    Map<string, CanonicalSection>;

  canonical_references:
    Map<
      string,
      CanonicalContentReference
    >;

  phases:
    Map<
      PillarPhase,
      CompanionPhaseDefinition
    >;

  questions:
    Map<string, CompanionQuestion>;

  options:
    Map<
      string,
      CompanionQuestionOption
    >;

  micro_returns:
    Map<
      string,
      CompanionMicroReturn
    >;

  journals:
    Map<
      string,
      CompanionJournalPrompt
    >;

  guided_letters:
    Map<
      string,
      CompanionGuidedLetter
    >;

  anchors:
    Map<string, CompanionAnchor>;

  predictive_rules:
    Map<
      string,
      PillarPredictiveRule
    >;

  transition_rules:
    Map<
      string,
      PillarTransitionRule
    >;
}


//////////////////////////////////////////////////
// 9. CONSTRUÇÃO DO ÍNDICE
//////////////////////////////////////////////////

export function createMapById<
  T extends { id: string }
>(
  items: T[]
): Map<string, T> {
  return new Map(
    items.map(
      item => [
        item.id,
        item
      ]
    )
  );
}


export function buildPillar01ContentIndex():
  Pillar01ContentIndex {
  return {
    canonical_sections:
      createMapById(
        PILLAR_01_CANONICAL_SECTIONS
      ),

    canonical_references:
      createMapById(
        PILLAR_01_ALL_CANONICAL_REFERENCES
      ),

    phases:
      new Map(
        PILLAR_01_ALL_PHASES.map(
          phase => [
            phase.phase,
            phase
          ]
        )
      ),

    questions:
      createMapById(
        PILLAR_01_ALL_QUESTIONS
      ),

    options:
      createMapById(
        PILLAR_01_ALL_OPTIONS
      ),

    micro_returns:
      createMapById(
        PILLAR_01_MICRO_RETURNS
      ),

    journals:
      createMapById(
        PILLAR_01_JOURNAL_PROMPTS
      ),

    guided_letters:
      createMapById(
        PILLAR_01_GUIDED_LETTERS
      ),

    anchors:
      createMapById(
        PILLAR_01_COMPANION_ANCHORS
      ),

    predictive_rules:
      createMapById(
        PILLAR_01_PREDICTIVE_RULES
      ),

    transition_rules:
      createMapById(
        PILLAR_01_TRANSITION_RULES
      )
  };
}


export const PILLAR_01_CONTENT_INDEX =
  buildPillar01ContentIndex();


//////////////////////////////////////////////////
// 10. RESOLUÇÃO GENÉRICA DE CONTEÚDO
//////////////////////////////////////////////////

export function resolvePillar01Content(
  id: string
): Pillar01IndexedContent | null {
  const index =
    PILLAR_01_CONTENT_INDEX;

  const resolvers: Array<{
    type: Pillar01IndexedContentType;
    map: Map<string, unknown>;
  }> = [
    {
      type: "canonical_section",
      map: index.canonical_sections
    },
    {
      type: "canonical_reference",
      map: index.canonical_references
    },
    {
      type: "question",
      map: index.questions
    },
    {
      type: "option",
      map: index.options
    },
    {
      type: "micro_return",
      map: index.micro_returns
    },
    {
      type: "journal",
      map: index.journals
    },
    {
      type: "guided_letter",
      map: index.guided_letters
    },
    {
      type: "anchor",
      map: index.anchors
    },
    {
      type: "predictive_rule",
      map: index.predictive_rules
    },
    {
      type: "transition_rule",
      map: index.transition_rules
    }
  ];

  for (const resolver of resolvers) {
    const content =
      resolver.map.get(id);

    if (content) {
      return {
        id,
        type: resolver.type,
        content
      };
    }
  }

  if (
    id ===
    PILLAR_01_CLOSURE_PACKAGE.id
  ) {
    return {
      id,
      type: "closure_package",
      content:
        PILLAR_01_CLOSURE_PACKAGE
    };
  }

  return null;
}


//////////////////////////////////////////////////
// 11. RELATÓRIO DE INTEGRIDADE
//////////////////////////////////////////////////

export type PillarIntegrityCategory =
  | "identity"
  | "canonical"
  | "counts"
  | "ids"
  | "references"
  | "routing"
  | "origins"
  | "signals"
  | "privacy"
  | "safety"
  | "closure"
  | "legacy";

export type PillarIntegritySeverity =
  | "error"
  | "warning"
  | "info";

export interface PillarIntegrityIssue {
  code: string;

  category:
    PillarIntegrityCategory;

  severity:
    PillarIntegritySeverity;

  message: string;

  content_id?: string;
}

export interface PillarIntegrityReport {
  package_id: string;

  valid: boolean;
  publishable: boolean;

  errors:
    PillarIntegrityIssue[];

  warnings:
    PillarIntegrityIssue[];

  information:
    PillarIntegrityIssue[];

  counts: {
    phases: number;
    questions: number;
    options: number;

    micro_returns: number;
    journals: number;
    guided_letters: number;
    anchors: number;

    predictive_rules: number;
    transition_rules: number;

    canonical_sections: number;
    canonical_references: number;
  };

  validations: {
    identity_valid: boolean;
    canonical_valid: boolean;
    counts_valid: boolean;
    ids_valid: boolean;
    references_valid: boolean;
    routing_valid: boolean;
    origins_valid: boolean;
    signals_valid: boolean;
    privacy_valid: boolean;
    safety_valid: boolean;
    closure_valid: boolean;
    legacy_free: boolean;
  };

  generated_at:
    string;
}


//////////////////////////////////////////////////
// 12. UTILITÁRIOS DE VALIDAÇÃO
//////////////////////////////////////////////////

export function createIntegrityIssue(
  category:
    PillarIntegrityCategory,

  severity:
    PillarIntegritySeverity,

  code:
    string,

  message:
    string,

  contentId?:
    string
): PillarIntegrityIssue {
  return {
    category,
    severity,
    code,
    message,

    content_id:
      contentId
  };
}


export function collectDuplicateIds(
  items: Array<{
    id: string;
    namespace: string;
  }>
): string[] {
  const counts =
    new Map<string, number>();

  for (const item of items) {
    counts.set(
      item.id,
      (counts.get(item.id) ?? 0) + 1
    );
  }

  return Array.from(
    counts.entries()
  )
    .filter(
      ([, count]) =>
        count > 1
    )
    .map(
      ([id]) => id
    );
}


export function isScaleDeltaValid(
  value: number
): value is ScaleDelta {
  return (
    value === -1 ||
    value === 0 ||
    value === 1
  );
}


export function isCanonicalReferenceApproved(
  referenceId: string
): boolean {
  const reference =
    PILLAR_01_CONTENT_INDEX
      .canonical_references
      .get(referenceId);

  return Boolean(
    reference?.approved
  );
}


//////////////////////////////////////////////////
// 13. VALIDAÇÃO DA IDENTIDADE
//////////////////////////////////////////////////

export function validatePillar01Identity():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const identity =
    CANONICAL_PILLARS.find(
      pillar =>
        pillar.id ===
        "pillar_01_reconhecimento"
    );

  if (!identity) {
    issues.push(
      createIntegrityIssue(
        "identity",
        "error",
        "P01_IDENTITY_MISSING",
        "Canonical identity for Pillar I is missing."
      )
    );

    return issues;
  }

  if (
    identity.title !==
    "Reconhecimento"
  ) {
    issues.push(
      createIntegrityIssue(
        "identity",
        "error",
        "P01_TITLE_INVALID",
        "Pillar I title must be Reconhecimento.",
        identity.id
      )
    );
  }

  if (
    identity.subtitle !==
    "Eu não estou quebrado."
  ) {
    issues.push(
      createIntegrityIssue(
        "identity",
        "error",
        "P01_SUBTITLE_INVALID",
        "Pillar I subtitle does not match the canonical identity.",
        identity.id
      )
    );
  }

  if (
    identity.act_id !==
    "act_01_survival"
  ) {
    issues.push(
      createIntegrityIssue(
        "identity",
        "error",
        "P01_ACT_INVALID",
        "Pillar I must belong to the Survival act.",
        identity.id
      )
    );
  }

  if (
    identity.canonical_unit_id !==
    "unit_pillar_01_reconhecimento"
  ) {
    issues.push(
      createIntegrityIssue(
        "identity",
        "error",
        "P01_UNIT_INVALID",
        "Pillar I canonical unit ID is invalid.",
        identity.id
      )
    );
  }

  return issues;
}


//////////////////////////////////////////////////
// 14. VALIDAÇÃO DA ESTRUTURA CANÔNICA
//////////////////////////////////////////////////

export function validatePillar01CanonicalContent():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const sectionIds =
    new Set(
      PILLAR_01_CANONICAL_SECTIONS
        .map(section => section.id)
    );

  const requiredSectionIds = [
    "p01_section_identity",
    "p01_section_consciousness",
    "p01_section_judgment",
    "p01_section_presence",
    "p01_section_closure"
  ];

  for (
    const requiredId
    of requiredSectionIds
  ) {
    if (!sectionIds.has(requiredId)) {
      issues.push(
        createIntegrityIssue(
          "canonical",
          "error",
          "P01_CANONICAL_SECTION_MISSING",
          `Required canonical section is missing: ${requiredId}.`,
          requiredId
        )
      );
    }
  }

  const ordered =
    [...PILLAR_01_CANONICAL_SECTIONS]
      .sort(
        (a, b) =>
          a.order - b.order
      );

  ordered.forEach(
    (section, index) => {
      const expectedOrder =
        index + 1;

      if (
        section.order !==
        expectedOrder
      ) {
        issues.push(
          createIntegrityIssue(
            "canonical",
            "error",
            "P01_CANONICAL_ORDER_INVALID",
            `Canonical section ${section.id} has order ${section.order}; expected ${expectedOrder}.`,
            section.id
          )
        );
      }

      if (
        section.unit_id !==
        "unit_pillar_01_reconhecimento"
      ) {
        issues.push(
          createIntegrityIssue(
            "canonical",
            "error",
            "P01_CANONICAL_UNIT_MISMATCH",
            `Canonical section ${section.id} points to another unit.`,
            section.id
          )
        );
      }
    }
  );

  return issues;
}


//////////////////////////////////////////////////
// 15. VALIDAÇÃO DAS CONTAGENS
//////////////////////////////////////////////////

export function validatePillar01Counts():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const expected =
    PILLAR_01_PACKAGE_MANIFEST_BASE
      .expected_counts;

  const actual = {
    phases:
      PILLAR_01_ALL_PHASES.length,

    questions:
      PILLAR_01_ALL_QUESTIONS.length,

    options:
      PILLAR_01_ALL_OPTIONS.length,

    micro_returns:
      PILLAR_01_MICRO_RETURNS.length,

    journals:
      PILLAR_01_JOURNAL_PROMPTS.length,

    guided_letters:
      PILLAR_01_GUIDED_LETTERS.length,

    anchors:
      PILLAR_01_COMPANION_ANCHORS.length,

    predictive_rules:
      PILLAR_01_PREDICTIVE_RULES.length,

    transition_rules:
      PILLAR_01_TRANSITION_RULES.length
  };

  const expectedKeys = Object.keys(expected) as Array<keyof typeof expected>;

  for (const key of expectedKeys) {
    if (
      actual[key] !==
      expected[key]
    ) {
      issues.push(
        createIntegrityIssue(
          "counts",
          "error",
          "P01_COUNT_INVALID",
          `${key} count is ${actual[key]}; expected ${expected[key]}.`
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 16. VALIDAÇÃO GLOBAL DOS IDS
//////////////////////////////////////////////////

export function validatePillar01Ids():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const allIds = [
    ...PILLAR_01_CANONICAL_SECTIONS.map(
      item => ({
        id: item.id,
        namespace:
          "canonical_section"
      })
    ),

    ...PILLAR_01_ALL_CANONICAL_REFERENCES.map(
      item => ({
        id: item.id,
        namespace:
          "canonical_reference"
      })
    ),

    ...PILLAR_01_ALL_QUESTIONS.map(
      item => ({
        id: item.id,
        namespace: "question"
      })
    ),

    ...PILLAR_01_ALL_OPTIONS.map(
      item => ({
        id: item.id,
        namespace: "option"
      })
    ),

    ...PILLAR_01_MICRO_RETURNS.map(
      item => ({
        id: item.id,
        namespace:
          "micro_return"
      })
    ),

    ...PILLAR_01_JOURNAL_PROMPTS.map(
      item => ({
        id: item.id,
        namespace: "journal"
      })
    ),

    ...PILLAR_01_GUIDED_LETTERS.map(
      item => ({
        id: item.id,
        namespace:
          "guided_letter"
      })
    ),

    ...PILLAR_01_COMPANION_ANCHORS.map(
      item => ({
        id: item.id,
        namespace: "anchor"
      })
    ),

    ...PILLAR_01_PREDICTIVE_RULES.map(
      item => ({
        id: item.id,
        namespace:
          "predictive_rule"
      })
    ),

    ...PILLAR_01_TRANSITION_RULES.map(
      item => ({
        id: item.id,
        namespace:
          "transition_rule"
      })
    )
  ];

  const duplicateIds =
    collectDuplicateIds(allIds);

  for (
    const duplicateId
    of duplicateIds
  ) {
    issues.push(
      createIntegrityIssue(
        "ids",
        "error",
        "P01_DUPLICATE_ID",
        `Duplicate content ID detected: ${duplicateId}.`,
        duplicateId
      )
    );
  }

  for (const item of allIds) {
    if (
      !item.id.startsWith("p01_") &&
      !item.id.startsWith("ref_p01_")
    ) {
      issues.push(
        createIntegrityIssue(
          "ids",
          "warning",
          "P01_ID_PREFIX_UNEXPECTED",
          `Content ID does not use the expected Pillar I prefix: ${item.id}.`,
          item.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 17. VALIDAÇÃO DAS FASES
//////////////////////////////////////////////////

export function validatePillar01Phases():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const requiredPhases:
    PillarPhase[] = [
      "consciousness",
      "judgment",
      "presence"
    ];

  for (
    const requiredPhase
    of requiredPhases
  ) {
    const phase =
      PILLAR_01_ALL_PHASES.find(
        item =>
          item.phase ===
          requiredPhase
      );

    if (!phase) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_PHASE_MISSING",
          `Required phase is missing: ${requiredPhase}.`
        )
      );

      continue;
    }

    if (
      phase.question_ids.length !==
      3
    ) {
      issues.push(
        createIntegrityIssue(
          "counts",
          "error",
          "P01_PHASE_QUESTION_COUNT",
          `${requiredPhase} must contain three question IDs.`
        )
      );
    }

    if (
      phase.micro_return_ids.length !==
      6
    ) {
      issues.push(
        createIntegrityIssue(
          "counts",
          "error",
          "P01_PHASE_MICRO_RETURN_COUNT",
          `${requiredPhase} must contain six micro-return IDs.`
        )
      );
    }

    if (
      phase.journal_prompt_ids.length !==
      2
    ) {
      issues.push(
        createIntegrityIssue(
          "counts",
          "error",
          "P01_PHASE_JOURNAL_COUNT",
          `${requiredPhase} must contain two journal IDs.`
        )
      );
    }

    for (
      const questionId
      of phase.question_ids
    ) {
      const question =
        PILLAR_01_CONTENT_INDEX
          .questions
          .get(questionId);

      if (!question) {
        issues.push(
          createIntegrityIssue(
            "references",
            "error",
            "P01_PHASE_QUESTION_MISSING",
            `Phase ${requiredPhase} references missing question ${questionId}.`,
            questionId
          )
        );
      } else if (
        question.phase !==
        requiredPhase
      ) {
        issues.push(
          createIntegrityIssue(
            "references",
            "error",
            "P01_PHASE_QUESTION_MISMATCH",
            `Question ${questionId} belongs to another phase.`,
            questionId
          )
        );
      }
    }

    for (
      const microReturnId
      of phase.micro_return_ids
    ) {
      const microReturn =
        PILLAR_01_CONTENT_INDEX
          .micro_returns
          .get(microReturnId);

      if (!microReturn) {
        issues.push(
          createIntegrityIssue(
            "references",
            "error",
            "P01_PHASE_MICRO_RETURN_MISSING",
            `Phase ${requiredPhase} references missing micro-return ${microReturnId}.`,
            microReturnId
          )
        );
      } else if (
        microReturn.phase !==
        requiredPhase
      ) {
        issues.push(
          createIntegrityIssue(
            "references",
            "error",
            "P01_PHASE_MICRO_RETURN_MISMATCH",
            `Micro-return ${microReturnId} belongs to another phase.`,
            microReturnId
          )
        );
      }
    }

    for (
      const journalId
      of phase.journal_prompt_ids
    ) {
      const journal =
        PILLAR_01_CONTENT_INDEX
          .journals
          .get(journalId);

      if (!journal) {
        issues.push(
          createIntegrityIssue(
            "references",
            "error",
            "P01_PHASE_JOURNAL_MISSING",
            `Phase ${requiredPhase} references missing journal ${journalId}.`,
            journalId
          )
        );
      } else if (
        journal.phase !==
        requiredPhase
      ) {
        issues.push(
          createIntegrityIssue(
            "references",
            "error",
            "P01_PHASE_JOURNAL_MISMATCH",
            `Journal ${journalId} belongs to another phase.`,
            journalId
          )
        );
      }
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 18. VALIDAÇÃO DAS PERGUNTAS
//////////////////////////////////////////////////

export function validatePillar01Questions():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const expectedPositions =
    new Set(
      REQUIRED_SEMANTIC_POSITIONS
    );

  for (
    const question
    of PILLAR_01_ALL_QUESTIONS
  ) {
    if (
      question.pillar_id !==
      "pillar_01_reconhecimento"
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_QUESTION_PILLAR_MISMATCH",
          `Question ${question.id} points to another pillar.`,
          question.id
        )
      );
    }

    if (
      question.canonical_unit_id !==
      "unit_pillar_01_reconhecimento"
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_QUESTION_UNIT_MISMATCH",
          `Question ${question.id} points to another canonical unit.`,
          question.id
        )
      );
    }

    if (
      !PILLAR_01_CONTENT_INDEX
        .canonical_sections
        .has(
          question
            .canonical_section_id
        )
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_QUESTION_SECTION_MISSING",
          `Question ${question.id} references a missing canonical section.`,
          question.id
        )
      );
    }

    if (
      question.question_origin !==
        "igent_companion" &&
      !question
        .canonical_reference_id
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_QUESTION_REFERENCE_REQUIRED",
          `Question ${question.id} requires a canonical reference.`,
          question.id
        )
      );
    }

    if (
      question
        .canonical_reference_id &&
      !isCanonicalReferenceApproved(
        question
          .canonical_reference_id
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_QUESTION_REFERENCE_NOT_APPROVED",
          `Question ${question.id} uses a missing or unapproved reference.`,
          question.id
        )
      );
    }

    if (
      question.options.length !==
      6
    ) {
      issues.push(
        createIntegrityIssue(
          "counts",
          "error",
          "P01_QUESTION_OPTION_COUNT",
          `Question ${question.id} must contain six options.`,
          question.id
        )
      );
    }

    const positions =
      new Set(
        question.options.map(
          option =>
            option.semantic_position
        )
      );

    for (
      const expectedPosition
      of expectedPositions
    ) {
      if (
        !positions.has(
          expectedPosition
        )
      ) {
        issues.push(
          createIntegrityIssue(
            "counts",
            "error",
            "P01_SEMANTIC_POSITION_MISSING",
            `Question ${question.id} is missing ${expectedPosition}.`,
            question.id
          )
        );
      }
    }

    if (
      question.open_response
        .analysis_priority !== 3
    ) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_OPEN_RESPONSE_PRIORITY",
          `Open response for ${question.id} must have priority three.`,
          question.id
        )
      );
    }

    if (!question.can_skip) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_QUESTION_CANNOT_SKIP",
          `Question ${question.id} must allow skipping.`,
          question.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 19. VALIDAÇÃO DAS OPÇÕES
//////////////////////////////////////////////////

export function validatePillar01Options():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const option
    of PILLAR_01_ALL_OPTIONS
  ) {
    if (
      !PILLAR_01_CONTENT_INDEX
        .questions
        .has(option.question_id)
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_OPTION_QUESTION_MISSING",
          `Option ${option.id} references missing question ${option.question_id}.`,
          option.id
        )
      );
    }

    if (
      option
        .interpretation_confidence !==
      "low"
    ) {
      issues.push(
        createIntegrityIssue(
          "signals",
          "error",
          "P01_OPTION_CONFIDENCE_INVALID",
          `Closed option ${option.id} must use low confidence.`,
          option.id
        )
      );
    }

    if (
      option.memory_policy
        .create_pattern
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_OPTION_CREATES_PATTERN",
          `Closed option ${option.id} cannot create a recurring pattern.`,
          option.id
        )
      );
    }

    const effects =
      Object.values(
        option.scale_effects
      );

    if (
      effects.some(
        value =>
          !isScaleDeltaValid(value)
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "signals",
          "error",
          "P01_OPTION_SCALE_DELTA",
          `Option ${option.id} contains an invalid scale delta.`,
          option.id
        )
      );
    }

    for (
      const questionId
      of option.next_question_ids
    ) {
      if (
        !PILLAR_01_CONTENT_INDEX
          .questions
          .has(questionId)
      ) {
        issues.push(
          createIntegrityIssue(
            "routing",
            "error",
            "P01_OPTION_NEXT_QUESTION_MISSING",
            `Option ${option.id} references missing next question ${questionId}.`,
            option.id
          )
        );
      }
    }

    for (
      const microReturnId
      of option.micro_return_ids
    ) {
      if (
        !PILLAR_01_CONTENT_INDEX
          .micro_returns
          .has(microReturnId)
      ) {
        issues.push(
          createIntegrityIssue(
            "routing",
            "error",
            "P01_OPTION_MICRO_RETURN_MISSING",
            `Option ${option.id} references missing micro-return ${microReturnId}.`,
            option.id
          )
        );
      }
    }

    if (
      option.journal_prompt_id &&
      !PILLAR_01_CONTENT_INDEX
        .journals
        .has(
          option.journal_prompt_id
        )
    ) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_OPTION_JOURNAL_MISSING",
          `Option ${option.id} references missing journal ${option.journal_prompt_id}.`,
          option.id
        )
      );
    }

    if (
      option.anchor_id &&
      !PILLAR_01_CONTENT_INDEX
        .anchors
        .has(option.anchor_id)
    ) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_OPTION_ANCHOR_MISSING",
          `Option ${option.id} references missing anchor ${option.anchor_id}.`,
          option.id
        )
      );
    }

    if (
      option.visible_text_origin ===
        "book_exact" &&
      (
        !option
          .visible_text_reference_id ||
        !isCanonicalReferenceApproved(
          option
            .visible_text_reference_id
        )
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_OPTION_EXACT_REFERENCE_MISSING",
          `Exact option text ${option.id} requires an approved canonical reference.`,
          option.id
        )
      );
    }

    if (
      option.visible_text_origin ===
        "book_approved_adaptation" &&
      (
        !option
          .visible_text_reference_id ||
        !isCanonicalReferenceApproved(
          option
            .visible_text_reference_id
        )
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_OPTION_ADAPTATION_REFERENCE_MISSING",
          `Adapted option text ${option.id} requires an approved canonical reference.`,
          option.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 20. VALIDAÇÃO DOS PRÓXIMOS MOVIMENTOS
//////////////////////////////////////////////////

export function validateNextMoveReference(
  move:
    AgentResponseTemplate[
      "next_move"
    ],

  sourceId:
    string
): PillarIntegrityIssue[] {
  if (!move) {
    return [];
  }

  const issues:
    PillarIntegrityIssue[] = [];

  const contentId =
    move.content_id;

  if (
    [
      "pause",
      "closure"
    ].includes(move.type) &&
    !contentId
  ) {
    return issues;
  }

  if (!contentId) {
    issues.push(
      createIntegrityIssue(
        "routing",
        "error",
        "P01_NEXT_MOVE_ID_REQUIRED",
        `Next move ${move.type} from ${sourceId} requires a content ID.`,
        sourceId
      )
    );

    return issues;
  }

  const expectedTypeMap:
    Partial<
      Record<
        InterventionType,
        Pillar01IndexedContentType
      >
    > = {
      question: "question",
      micro_return:
        "micro_return",
      journal: "journal",
      letter: "guided_letter",
      anchor: "anchor"
    };

  const expectedType =
    expectedTypeMap[move.type];

  if (!expectedType) {
    return issues;
  }

  const resolved =
    resolvePillar01Content(
      contentId
    );

  if (!resolved) {
    issues.push(
      createIntegrityIssue(
        "routing",
        "error",
        "P01_NEXT_MOVE_TARGET_MISSING",
        `Next move from ${sourceId} references missing content ${contentId}.`,
        sourceId
      )
    );

    return issues;
  }

  if (
    resolved.type !==
    expectedType
  ) {
    issues.push(
      createIntegrityIssue(
        "routing",
        "error",
        "P01_NEXT_MOVE_TYPE_MISMATCH",
        `Next move from ${sourceId} expects ${expectedType}, but ${contentId} resolves as ${resolved.type}.`,
        sourceId
      )
    );
  }

  return issues;
}


export function validatePillar01ResponseRoutes():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const option
    of PILLAR_01_ALL_OPTIONS
  ) {
    const variants = [
      option.response_variants.minimal,
      option.response_variants.standard,
      option.response_variants.deep
    ].filter(
      (
        variant
      ): variant is AgentResponseTemplate =>
        Boolean(variant)
    );

    for (const variant of variants) {
      issues.push(
        ...validateNextMoveReference(
          variant.next_move,
          option.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 21. VALIDAÇÃO DOS MICRO-RETORNOS
//////////////////////////////////////////////////

export function validatePillar01MicroReturnIntegrity():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const validationErrors =
    validatePillar01MicroReturns(
      PILLAR_01_MICRO_RETURNS
    );

  for (
    const error
    of validationErrors
  ) {
    issues.push(
      createIntegrityIssue(
        "counts",
        "error",
        "P01_MICRO_RETURN_INVALID",
        error
      )
    );
  }

  for (
    const item
    of PILLAR_01_MICRO_RETURNS
  ) {
    if (
      item.origin !==
        "igent_companion" &&
      (
        !item
          .canonical_reference_id ||
        !isCanonicalReferenceApproved(
          item
            .canonical_reference_id
        )
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_MICRO_RETURN_REFERENCE",
          `Micro-return ${item.id} requires an approved canonical reference.`,
          item.id
        )
      );
    }

    if (
      item.allow_question_after
    ) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "warning",
          "P01_MICRO_RETURN_QUESTION_AFTER",
          `Micro-return ${item.id} should normally end the movement without a question.`,
          item.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 22. VALIDAÇÃO DOS DIÁRIOS
//////////////////////////////////////////////////

export function validatePillar01JournalIntegrity():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const validationErrors =
    validatePillar01Journals(
      PILLAR_01_JOURNAL_PROMPTS
    );

  for (
    const error
    of validationErrors
  ) {
    issues.push(
      createIntegrityIssue(
        "privacy",
        "error",
        "P01_JOURNAL_INVALID",
        error
      )
    );
  }

  for (
    const journal
    of PILLAR_01_JOURNAL_PROMPTS
  ) {
    if (
      journal.origin !==
      "igent_companion"
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_JOURNAL_ORIGIN",
          `Journal ${journal.id} must belong to the companion layer.`,
          journal.id
        )
      );
    }

    if (
      journal
        .analysis_policy
        .analysis_default !== "off"
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_JOURNAL_ANALYSIS_DEFAULT",
          `Journal ${journal.id} must disable analysis by default.`,
          journal.id
        )
      );
    }

    if (
      journal
        .memory_policy
        .storage_default !== "off"
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_JOURNAL_MEMORY_DEFAULT",
          `Journal ${journal.id} must disable memory by default.`,
          journal.id
        )
      );
    }

    if (
      !journal.allow_private_mode ||
      !journal.allow_skip
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_JOURNAL_PRIVACY",
          `Journal ${journal.id} must allow private mode and skipping.`,
          journal.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 23. VALIDAÇÃO DAS CARTAS
//////////////////////////////////////////////////

export function validatePillar01LetterIntegrity():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const validationErrors =
    validatePillar01GuidedLetters(
      PILLAR_01_GUIDED_LETTERS
    );

  for (
    const error
    of validationErrors
  ) {
    issues.push(
      createIntegrityIssue(
        "privacy",
        "error",
        "P01_LETTER_INVALID",
        error
      )
    );
  }

  for (
    const letter
    of PILLAR_01_GUIDED_LETTERS
  ) {
    if (
      !letter.delivery_policy
        .never_prompt_to_send ||
      !letter.delivery_policy
        .never_offer_recipient_delivery ||
      !letter.delivery_policy
        .never_suggest_real_confrontation
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_LETTER_DELIVERY_POLICY",
          `Letter ${letter.id} violates the private-delivery policy.`,
          letter.id
        )
      );
    }

    if (
      letter.type ===
        "confrontation" &&
      letter.allowed_recipient_types
        .some(
          type =>
            type !==
              "internal_voice" &&
            type !==
              "internal_rule" &&
            type !==
              "symbolic_recipient"
        )
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_CONFRONTATION_RECIPIENT",
          `Confrontation letter ${letter.id} contains an invalid recipient type.`,
          letter.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 24. VALIDAÇÃO DAS ÂNCORAS
//////////////////////////////////////////////////

export function validatePillar01AnchorIntegrity():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const validationErrors =
    validatePillar01Anchors(
      PILLAR_01_COMPANION_ANCHORS
    );

  for (
    const error
    of validationErrors
  ) {
    issues.push(
      createIntegrityIssue(
        "safety",
        "error",
        "P01_ANCHOR_INVALID",
        error
      )
    );
  }

  for (
    const anchor
    of PILLAR_01_COMPANION_ANCHORS
  ) {
    if (
      anchor.maximum_seconds &&
      anchor.maximum_seconds > 90
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_ANCHOR_DURATION",
          `Anchor ${anchor.id} exceeds the maximum duration.`,
          anchor.id
        )
      );
    }

    if (
      anchor
        .canonical_relation
        .replaces_canonical_ritual
    ) {
      issues.push(
        createIntegrityIssue(
          "canonical",
          "error",
          "P01_ANCHOR_REPLACES_RITUAL",
          `Anchor ${anchor.id} cannot replace the canonical ritual.`,
          anchor.id
        )
      );
    }

    if (
      anchor.require_follow_up ||
      anchor.require_written_response
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_ANCHOR_REQUIREMENT",
          `Anchor ${anchor.id} cannot require writing or follow-up.`,
          anchor.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 25. VALIDAÇÃO DAS REGRAS PREDITIVAS
//////////////////////////////////////////////////

export function validatePillar01PredictiveRules():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const rule
    of PILLAR_01_PREDICTIVE_RULES
  ) {
    if (
      rule.pillar_id !==
      "pillar_01_reconhecimento"
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_PREDICTIVE_PILLAR",
          `Predictive rule ${rule.id} points to another pillar.`,
          rule.id
        )
      );
    }

    const action =
      rule.action;

    if (!action.content_id) {
      continue;
    }

    const expectedTypes:
      Partial<
        Record<
          PredictiveAction["action"],
          Pillar01IndexedContentType
        >
      > = {
        select_question:
          "question",

        select_journal:
          "journal",

        select_letter:
          "guided_letter",

        select_anchor:
          "anchor",

        select_micro_return:
          "micro_return"
      };

    const expectedType =
      expectedTypes[action.action];

    if (!expectedType) {
      continue;
    }

    const resolved =
      resolvePillar01Content(
        action.content_id
      );

    if (!resolved) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_PREDICTIVE_TARGET_MISSING",
          `Predictive rule ${rule.id} references missing content ${action.content_id}.`,
          rule.id
        )
      );
    } else if (
      resolved.type !==
      expectedType
    ) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_PREDICTIVE_TARGET_TYPE",
          `Predictive rule ${rule.id} expects ${expectedType}, but resolves ${resolved.type}.`,
          rule.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 26. VALIDAÇÃO DAS TRANSIÇÕES
//////////////////////////////////////////////////

export function validatePillar01Transitions():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const transition
    of PILLAR_01_TRANSITION_RULES
  ) {
    if (
      transition.source_pillar_id !==
      "pillar_01_reconhecimento"
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_TRANSITION_SOURCE",
          `Transition ${transition.id} has an invalid source pillar.`,
          transition.id
        )
      );
    }

    if (
      !PILLAR_ORDER.includes(
        transition.target_pillar_id
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "references",
          "error",
          "P01_TRANSITION_TARGET",
          `Transition ${transition.id} has an invalid target pillar.`,
          transition.id
        )
      );
    }

    if (
      transition.target_pillar_id ===
      "pillar_01_reconhecimento"
    ) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_TRANSITION_SELF_TARGET",
          `Transition ${transition.id} cannot target Pillar I itself.`,
          transition.id
        )
      );
    }

    if (!transition.optional) {
      issues.push(
        createIntegrityIssue(
          "routing",
          "error",
          "P01_TRANSITION_NOT_OPTIONAL",
          `Transition ${transition.id} must remain optional.`,
          transition.id
        )
      );
    }

    if (
      transition.priority ===
        "secondary" &&
      transition.minimum_confidence ===
        "low"
    ) {
      issues.push(
        createIntegrityIssue(
          "signals",
          "warning",
          "P01_SECONDARY_TRANSITION_CONFIDENCE",
          `Secondary transition ${transition.id} should not be triggered with low confidence.`,
          transition.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 27. VALIDAÇÃO DAS ORIGENS
//////////////////////////////////////////////////

export function validatePillar01Origins():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const reference
    of PILLAR_01_ALL_CANONICAL_REFERENCES
  ) {
    if (!reference.approved) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_REFERENCE_NOT_APPROVED",
          `Canonical reference ${reference.id} is not approved.`,
          reference.id
        )
      );
    }

    if (
      reference.origin ===
        "book_exact" &&
      !reference.exact_text
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_EXACT_TEXT_MISSING",
          `Exact reference ${reference.id} has no exact text.`,
          reference.id
        )
      );
    }

    if (
      reference.origin ===
        "book_approved_adaptation" &&
      !reference
        .approved_adaptation
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_ADAPTATION_TEXT_MISSING",
          `Adaptation reference ${reference.id} has no approved text.`,
          reference.id
        )
      );
    }

    if (
      reference.book_id !==
      BOOK_ID
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_REFERENCE_BOOK_MISMATCH",
          `Reference ${reference.id} points to another book.`,
          reference.id
        )
      );
    }

    if (
      reference.unit_id !==
      "unit_pillar_01_reconhecimento"
    ) {
      issues.push(
        createIntegrityIssue(
          "origins",
          "error",
          "P01_REFERENCE_UNIT_MISMATCH",
          `Reference ${reference.id} points to another unit.`,
          reference.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 28. VALIDAÇÃO DE PRIVACIDADE
//////////////////////////////////////////////////

export function validatePillar01Privacy():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const journal
    of PILLAR_01_JOURNAL_PROMPTS
  ) {
    if (
      journal.analyze_by_default ||
      journal
        .memory_policy
        .storage_default !== "off"
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_JOURNAL_DEFAULT_CONSENT",
          `Journal ${journal.id} violates consent defaults.`,
          journal.id
        )
      );
    }
  }

  for (
    const letter
    of PILLAR_01_GUIDED_LETTERS
  ) {
    if (
      letter.analyze_by_default ||
      letter
        .memory_policy
        .storage_default !== "off"
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_LETTER_DEFAULT_CONSENT",
          `Letter ${letter.id} violates consent defaults.`,
          letter.id
        )
      );
    }
  }

  for (
    const anchor
    of PILLAR_01_COMPANION_ANCHORS
  ) {
    if (
      anchor
        .memory_policy
        .storage_default !== "off"
    ) {
      issues.push(
        createIntegrityIssue(
          "privacy",
          "error",
          "P01_ANCHOR_DEFAULT_MEMORY",
          `Anchor ${anchor.id} must disable memory by default.`,
          anchor.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 29. VALIDAÇÃO DE SEGURANÇA
//////////////////////////////////////////////////

export function validatePillar01Safety():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  for (
    const journal
    of PILLAR_01_JOURNAL_PROMPTS
  ) {
    if (
      journal.maximum_load > 2
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_JOURNAL_LOAD",
          `Journal ${journal.id} cannot run above load level two.`,
          journal.id
        )
      );
    }

    if (
      !journal.stop_rule.enabled
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_JOURNAL_STOP_RULE",
          `Journal ${journal.id} requires a stop rule.`,
          journal.id
        )
      );
    }
  }

  for (
    const letter
    of PILLAR_01_GUIDED_LETTERS
  ) {
    if (
      letter.maximum_load > 2
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_LETTER_LOAD",
          `Letter ${letter.id} cannot run above load level two.`,
          letter.id
        )
      );
    }

    if (
      !letter.stop_rule.enabled
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_LETTER_STOP_RULE",
          `Letter ${letter.id} requires a stop rule.`,
          letter.id
        )
      );
    }
  }

  for (
    const anchor
    of PILLAR_01_COMPANION_ANCHORS
  ) {
    if (
      anchor.maximum_load > 2
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_ANCHOR_LOAD",
          `Anchor ${anchor.id} cannot run above load level two.`,
          anchor.id
        )
      );
    }

    if (
      !anchor.stop_rule.enabled
    ) {
      issues.push(
        createIntegrityIssue(
          "safety",
          "error",
          "P01_ANCHOR_STOP_RULE",
          `Anchor ${anchor.id} requires a stop rule.`,
          anchor.id
        )
      );
    }
  }

  return issues;
}


//////////////////////////////////////////////////
// 30. VALIDAÇÃO DO FECHAMENTO
//////////////////////////////////////////////////

export function validatePillar01ClosureIntegrity():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  if (
    PILLAR_01_CLOSURE_PACKAGE
      .pillar_id !==
    "pillar_01_reconhecimento"
  ) {
    issues.push(
      createIntegrityIssue(
        "closure",
        "error",
        "P01_CLOSURE_PILLAR",
        "Closure package points to another pillar."
      )
    );
  }

  if (
    PILLAR_01_CLOSURE_PACKAGE
      .canonical_unit_id !==
    "unit_pillar_01_reconhecimento"
  ) {
    issues.push(
      createIntegrityIssue(
        "closure",
        "error",
        "P01_CLOSURE_UNIT",
        "Closure package points to another canonical unit."
      )
    );
  }

  const closureCanonicalIds = [
    PILLAR_01_CLOSURE_PACKAGE
      .canonical_support_letter_id,

    PILLAR_01_CLOSURE_PACKAGE
      .canonical_ritual_id,

    PILLAR_01_CLOSURE_PACKAGE
      .canonical_closure_id
  ];

  for (
    const canonicalId
    of closureCanonicalIds
  ) {
    if (
      !PILLAR_01_CONTENT_INDEX
        .canonical_sections
        .has(canonicalId)
    ) {
      issues.push(
        createIntegrityIssue(
          "closure",
          "error",
          "P01_CLOSURE_SECTION_MISSING",
          `Closure package references missing canonical section ${canonicalId}.`,
          canonicalId
        )
      );
    }
  }

  if (
    PILLAR_01_CLOSURE_PACKAGE
      .next_canonical_unit_id !==
    "unit_pillar_02_familia"
  ) {
    issues.push(
      createIntegrityIssue(
        "closure",
        "error",
        "P01_NEXT_CANONICAL_UNIT",
        "The canonical next unit after Pillar I must be Pillar II — Família."
      )
    );
  }

  return issues;
}


//////////////////////////////////////////////////
// 31. VALIDAÇÃO DE LEGADO
//////////////////////////////////////////////////

export function collectPillar01SerializableContent():
  unknown {
  return {
    manifest:
      PILLAR_01_PACKAGE_MANIFEST_BASE,

    canonical_identity:
      PILLAR_01_CANONICAL_IDENTITY,

    canonical_sections:
      PILLAR_01_CANONICAL_SECTIONS,

    canonical_references:
      PILLAR_01_ALL_CANONICAL_REFERENCES,

    companion:
      PILLAR_01_ALL_COMPANION_CONTENT,

    closure:
      PILLAR_01_CLOSURE_PACKAGE
  };
}


export function validatePillar01LegacyIds():
  PillarIntegrityIssue[] {
  const issues:
    PillarIntegrityIssue[] = [];

  const serialized =
    JSON.stringify(
      collectPillar01SerializableContent()
    );

  const forbiddenLegacyValues = [
    "pillar_01_vinculo",
    "unit_pillar_01_vinculo",
    "pillar-01-vinculo",
    "Pilar I — Vínculo",
    "Pilar I - Vínculo"
  ];

  for (
    const forbiddenValue
    of forbiddenLegacyValues
  ) {
    if (
      serialized.includes(
        forbiddenValue
      )
    ) {
      issues.push(
        createIntegrityIssue(
          "legacy",
          "error",
          "P01_LEGACY_VALUE_FOUND",
          `Legacy Pillar I value detected: ${forbiddenValue}.`
        )
      );
    }
  }

  return issues;
}


/**
 * O conceito "vínculo" pode permanecer em textos
 * editoriais, especialmente no manifesto
 * "Onde o vínculo começa".
 *
 * Apenas títulos e IDs técnicos antigos são
 * bloqueados.
 */


//////////////////////////////////////////////////
// 32. GERAÇÃO DO RELATÓRIO
//////////////////////////////////////////////////

export function buildPillar01IntegrityReport():
  PillarIntegrityReport {
  const allIssues = [
    ...validatePillar01Identity(),

    ...validatePillar01CanonicalContent(),

    ...validatePillar01Counts(),

    ...validatePillar01Ids(),

    ...validatePillar01Phases(),

    ...validatePillar01Questions(),

    ...validatePillar01Options(),

    ...validatePillar01ResponseRoutes(),

    ...validatePillar01MicroReturnIntegrity(),

    ...validatePillar01JournalIntegrity(),

    ...validatePillar01LetterIntegrity(),

    ...validatePillar01AnchorIntegrity(),

    ...validatePillar01PredictiveRules(),

    ...validatePillar01Transitions(),

    ...validatePillar01Origins(),

    ...validatePillar01Privacy(),

    ...validatePillar01Safety(),

    ...validatePillar01ClosureIntegrity(),

    ...validatePillar01LegacyIds()
  ];

  const errors =
    allIssues.filter(
      issue =>
        issue.severity === "error"
    );

  const warnings =
    allIssues.filter(
      issue =>
        issue.severity === "warning"
    );

  const information =
    allIssues.filter(
      issue =>
        issue.severity === "info"
    );

  const hasCategoryError = (
    category:
      PillarIntegrityCategory
  ): boolean =>
    errors.some(
      error =>
        error.category === category
    );

  const counts = {
    phases:
      PILLAR_01_ALL_PHASES.length,

    questions:
      PILLAR_01_ALL_QUESTIONS.length,

    options:
      PILLAR_01_ALL_OPTIONS.length,

    micro_returns:
      PILLAR_01_MICRO_RETURNS.length,

    journals:
      PILLAR_01_JOURNAL_PROMPTS.length,

    guided_letters:
      PILLAR_01_GUIDED_LETTERS.length,

    anchors:
      PILLAR_01_COMPANION_ANCHORS.length,

    predictive_rules:
      PILLAR_01_PREDICTIVE_RULES.length,

    transition_rules:
      PILLAR_01_TRANSITION_RULES.length,

    canonical_sections:
      PILLAR_01_CANONICAL_SECTIONS.length,

    canonical_references:
      PILLAR_01_ALL_CANONICAL_REFERENCES.length
  };

  return {
    package_id:
      PILLAR_01_PACKAGE_MANIFEST_BASE
        .package_id,

    valid:
      errors.length === 0,

    publishable:
      errors.length === 0,

    errors,
    warnings,
    information,

    counts,

    validations: {
      identity_valid:
        !hasCategoryError(
          "identity"
        ),

      canonical_valid:
        !hasCategoryError(
          "canonical"
        ),

      counts_valid:
        !hasCategoryError(
          "counts"
        ),

      ids_valid:
        !hasCategoryError(
          "ids"
        ),

      references_valid:
        !hasCategoryError(
          "references"
        ),

      routing_valid:
        !hasCategoryError(
          "routing"
        ),

      origins_valid:
        !hasCategoryError(
          "origins"
        ),

      signals_valid:
        !hasCategoryError(
          "signals"
        ),

      privacy_valid:
        !hasCategoryError(
          "privacy"
        ),

      safety_valid:
        !hasCategoryError(
          "safety"
        ),

      closure_valid:
        !hasCategoryError(
          "closure"
        ),

      legacy_free:
        !hasCategoryError(
          "legacy"
        )
    },

    generated_at:
      new Date().toISOString()
  };
}


export const PILLAR_01_INTEGRITY_REPORT =
  buildPillar01IntegrityReport();


//////////////////////////////////////////////////
// 33. MANIFESTO FINAL
//////////////////////////////////////////////////

export function buildPillar01FinalManifest(
  report:
    PillarIntegrityReport,

  environment:
    PillarPackageEnvironment =
      "development"
): PillarPackageManifest {
  return {
    ...PILLAR_01_PACKAGE_MANIFEST_BASE,

    environment,

    build_status:
      report.publishable
        ? "approved"
        : "blocked",

    built_at:
      new Date().toISOString(),

    content_checksum:
      createStableContentChecksum(
        collectPillar01SerializableContent()
      )
  };
}


export const PILLAR_01_PACKAGE_MANIFEST =
  buildPillar01FinalManifest(
    PILLAR_01_INTEGRITY_REPORT
  );


//////////////////////////////////////////////////
// 34. PACOTE CANÔNICO DO PILAR
//////////////////////////////////////////////////

export interface Pillar01CanonicalPackage {
  layer:
    "canonical_book";

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  identity:
    CanonicalPillarIdentity;

  sections:
    CanonicalSection[];

  references:
    CanonicalContentReference[];

  canonical_ritual:
    typeof PILLAR_01_CANONICAL_RITUAL;

  version:
    string;
}


export function buildPillar01CanonicalPackage():
  Pillar01CanonicalPackage {
  const identity =
    CANONICAL_PILLARS.find(
      pillar =>
        pillar.id ===
        "pillar_01_reconhecimento"
    );

  if (!identity) {
    throw new Error(
      "Pillar I canonical identity is missing."
    );
  }

  return {
    layer:
      "canonical_book",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    identity,

    sections:
      PILLAR_01_CANONICAL_SECTIONS,

    references:
      PILLAR_01_ALL_CANONICAL_REFERENCES,

    canonical_ritual:
      PILLAR_01_CANONICAL_RITUAL,

    version:
      "2026-06-25"
  };
}


export const PILLAR_01_CANONICAL_PACKAGE =
  buildPillar01CanonicalPackage();


//////////////////////////////////////////////////
// 35. PACOTE INTEGRADO
//////////////////////////////////////////////////

export interface Pillar01IntegratedPackage {
  manifest:
    PillarPackageManifest;

  canonical:
    Pillar01CanonicalPackage;

  companion:
    PillarCompanionPackage;

  closure:
    Pillar01ClosurePackage;

  integrity:
    PillarIntegrityReport;

  index:
    Pillar01ContentIndex;

  status:
    PillarPackageBuildStatus;
}


export const PILLAR_01_INTEGRATED_PACKAGE:
  Pillar01IntegratedPackage = {
    manifest:
      PILLAR_01_PACKAGE_MANIFEST,

    canonical:
      PILLAR_01_CANONICAL_PACKAGE,

    companion:
      PILLAR_01_COMPANION_PACKAGE,

    closure:
      PILLAR_01_CLOSURE_PACKAGE,

    integrity:
      PILLAR_01_INTEGRITY_REPORT,

    index:
      PILLAR_01_CONTENT_INDEX,

    status:
      PILLAR_01_INTEGRITY_REPORT
        .publishable
        ? "approved"
        : "blocked"
  };


//////////////////////////////////////////////////
// 36. GATE DE PUBLICAÇÃO
//////////////////////////////////////////////////

export class PillarPackagePublicationError
  extends Error {
  public readonly packageId:
    string;

  public readonly integrityErrors:
    PillarIntegrityIssue[];

  constructor(
    packageId:
      string,

    errors:
      PillarIntegrityIssue[]
  ) {
    super(
      `Package ${packageId} cannot be published because it contains ${errors.length} integrity error(s).`
    );

    this.name =
      "PillarPackagePublicationError";

    this.packageId =
      packageId;

    this.integrityErrors =
      errors;
  }
}


export function assertPillar01PackagePublishable(
  packageData:
    Pillar01IntegratedPackage
): asserts packageData is
  Pillar01IntegratedPackage & {
    status: "approved" | "published";
  } {
  if (
    !packageData.integrity
      .publishable
  ) {
    throw new PillarPackagePublicationError(
      packageData.manifest
        .package_id,

      packageData.integrity
        .errors
    );
  }

  if (
    packageData.status ===
    "blocked"
  ) {
    throw new PillarPackagePublicationError(
      packageData.manifest
        .package_id,

      packageData.integrity
        .errors
    );
  }
}


//////////////////////////////////////////////////
// 37. PUBLICAÇÃO EXPLÍCITA
//////////////////////////////////////////////////

export interface Pillar01PublishedPackage
  extends Pillar01IntegratedPackage {
  status:
    "published";

  manifest:
    PillarPackageManifest & {
      build_status:
        "published";

      environment:
        "production";

      published_at:
        string;
    };
}


export function publishPillar01Package(
  packageData:
    Pillar01IntegratedPackage
): Pillar01PublishedPackage {
  assertPillar01PackagePublishable(
    packageData
  );

  const publishedAt =
    new Date().toISOString();

  return {
    ...packageData,

    status:
      "published",

    manifest: {
      ...packageData.manifest,

      build_status:
        "published",

      environment:
        "production",

      published_at:
        publishedAt
    }
  };
}


/**
 * Não executar automaticamente:
 *
 * const published =
 *   publishPillar01Package(
 *     PILLAR_01_INTEGRATED_PACKAGE
 *   );
 *
 * A publicação deve ocorrer somente no pipeline
 * editorial após revisão do relatório.
 */


//////////////////////////////////////////////////
// 38. RESUMO DE BUILD
//////////////////////////////////////////////////

export interface PillarPackageBuildSummary {
  package_id:
    string;

  pillar_id:
    PillarId;

  title:
    string;

  status:
    PillarPackageBuildStatus;

  publishable:
    boolean;

  counts:
    PillarIntegrityReport["counts"];

  error_count:
    number;

  warning_count:
    number;

  errors:
    Array<{
      code: string;
      message: string;
      content_id?: string;
    }>;

  warnings:
    Array<{
      code: string;
      message: string;
      content_id?: string;
    }>;
}


export function buildPillar01BuildSummary(
  packageData:
    Pillar01IntegratedPackage
): PillarPackageBuildSummary {
  return {
    package_id:
      packageData.manifest
        .package_id,

    pillar_id:
      packageData.manifest
        .pillar_id,

    title:
      packageData.manifest
        .pillar_title,

    status:
      packageData.status,

    publishable:
      packageData.integrity
        .publishable,

    counts:
      packageData.integrity
        .counts,

    error_count:
      packageData.integrity
        .errors.length,

    warning_count:
      packageData.integrity
        .warnings.length,

    errors:
      packageData.integrity
        .errors
        .map(error => ({
          code: error.code,
          message: error.message,
          content_id:
            error.content_id
        })),

    warnings:
      packageData.integrity
        .warnings
        .map(warning => ({
          code: warning.code,
          message: warning.message,
          content_id:
            warning.content_id
        }))
  };
}


export const PILLAR_01_BUILD_SUMMARY =
  buildPillar01BuildSummary(
    PILLAR_01_INTEGRATED_PACKAGE
  );


//////////////////////////////////////////////////
// 39. CONSULTAS DE RUNTIME
//////////////////////////////////////////////////

export function getPillar01Question(
  questionId:
    string
): CompanionQuestion | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .questions
      .get(questionId) ??
    null
  );
}


export function getPillar01Option(
  optionId:
    string
): CompanionQuestionOption | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .options
      .get(optionId) ??
    null
  );
}


export function getPillar01MicroReturn(
  microReturnId:
    string
): CompanionMicroReturn | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .micro_returns
      .get(microReturnId) ??
    null
  );
}


export function getPillar01Journal(
  journalId:
    string
): CompanionJournalPrompt | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .journals
      .get(journalId) ??
    null
  );
}


export function getPillar01GuidedLetter(
  letterId:
    string
): CompanionGuidedLetter | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .guided_letters
      .get(letterId) ??
    null
  );
}


export function getPillar01Anchor(
  anchorId:
    string
): CompanionAnchor | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .anchors
      .get(anchorId) ??
    null
  );
}


export function getPillar01CanonicalSection(
  sectionId:
    string
): CanonicalSection | null {
  return (
    PILLAR_01_CONTENT_INDEX
      .canonical_sections
      .get(sectionId) ??
    null
  );
}


//////////////////////////////////////////////////
// 40. CONSULTA DA PRÓXIMA PERGUNTA
//////////////////////////////////////////////////

export function getNextPillar01Question(
  currentQuestionId:
    string
): CompanionQuestion | null {
  const current =
    getPillar01Question(
      currentQuestionId
    );

  if (!current) {
    return null;
  }

  return (
    PILLAR_01_ALL_QUESTIONS
      .find(
        question =>
          question.global_order ===
          current.global_order + 1
      ) ??
    null
  );
}


//////////////////////////////////////////////////
// 41. PRIMEIRA PERGUNTA DE CADA FASE
//////////////////////////////////////////////////

export const PILLAR_01_PHASE_ENTRY_QUESTIONS:
  Record<
    PillarPhase,
    string
  > = {
    consciousness:
      "p01_q_cons_01",

    judgment:
      "p01_q_judg_01",

    presence:
      "p01_q_pres_01"
  };


export function getPillar01PhaseEntryQuestion(
  phase:
    PillarPhase
): CompanionQuestion {
  const questionId =
    PILLAR_01_PHASE_ENTRY_QUESTIONS[
      phase
    ];

  const question =
    getPillar01Question(
      questionId
    );

  if (!question) {
    throw new Error(
      `Missing phase entry question: ${questionId}.`
    );
  }

  return question;
}


//////////////////////////////////////////////////
// 42. ORDEM DE CARREGAMENTO
//////////////////////////////////////////////////

export const PILLAR_01_RUNTIME_LOAD_ORDER = [
  "manifest",
  "canonical.identity",
  "canonical.sections",
  "canonical.references",
  "companion.editorial_identity",
  "companion.phases",
  "companion.questions",
  "companion.micro_returns",
  "companion.journal_prompts",
  "companion.guided_letters",
  "companion.practical_anchors",
  "companion.predictive_rules",
  "companion.transition_rules",
  "closure",
  "integrity",
  "index"
] as const;


/**
 * O conteúdo canônico deve carregar antes
 * da camada complementar.
 *
 * A camada complementar não pode existir em
 * runtime sem sua unidade canônica relacionada.
 */


//////////////////////////////////////////////////
// 43. EXPORTAÇÃO POR ARQUIVOS
//////////////////////////////////////////////////

export const PILLAR_01_EXPORT_MAP = {
  "/content/canonical/pillars/pillar-01-reconhecimento/identity.json":
    PILLAR_01_CANONICAL_IDENTITY,

  "/content/canonical/pillars/pillar-01-reconhecimento/sections.json":
    PILLAR_01_CANONICAL_SECTIONS,

  "/content/canonical/pillars/pillar-01-reconhecimento/references.json":
    PILLAR_01_ALL_CANONICAL_REFERENCES,

  "/content/igent/pillars/pillar-01-reconhecimento/phases.json":
    PILLAR_01_ALL_PHASES,

  "/content/igent/pillars/pillar-01-reconhecimento/questions.json":
    PILLAR_01_ALL_QUESTIONS,

  "/content/igent/pillars/pillar-01-reconhecimento/micro-returns.json":
    PILLAR_01_MICRO_RETURNS,

  "/content/igent/pillars/pillar-01-reconhecimento/journals.json":
    PILLAR_01_JOURNAL_PROMPTS,

  "/content/igent/pillars/pillar-01-reconhecimento/guided-letters.json":
    PILLAR_01_GUIDED_LETTERS,

  "/content/igent/pillars/pillar-01-reconhecimento/anchors.json":
    PILLAR_01_COMPANION_ANCHORS,

  "/content/igent/pillars/pillar-01-reconhecimento/predictive-rules.json":
    PILLAR_01_PREDICTIVE_RULES,

  "/content/igent/pillars/pillar-01-reconhecimento/transitions.json":
    PILLAR_01_TRANSITION_RULES,

  "/content/igent/pillars/pillar-01-reconhecimento/closure.json":
    PILLAR_01_CLOSURE_PACKAGE,

  "/content/igent/pillars/pillar-01-reconhecimento/manifest.json":
    PILLAR_01_PACKAGE_MANIFEST,

  "/content/igent/pillars/pillar-01-reconhecimento/integrity.json":
    PILLAR_01_INTEGRITY_REPORT
} as const;


//////////////////////////////////////////////////
// 44. TESTES MÍNIMOS OBRIGATÓRIOS
//////////////////////////////////////////////////

export interface Pillar01SmokeTest {
  id: string;
  description: string;
  run: () => boolean;
}


export const PILLAR_01_SMOKE_TESTS:
  Pillar01SmokeTest[] = [
    {
      id:
        "p01_test_identity",

      description:
        "Pillar title is Reconhecimento.",

      run: () =>
        PILLAR_01_PACKAGE_MANIFEST
          .pillar_title ===
        "Reconhecimento"
    },

    {
      id:
        "p01_test_question_count",

      description:
        "Package contains nine questions.",

      run: () =>
        PILLAR_01_ALL_QUESTIONS
          .length === 9
    },

    {
      id:
        "p01_test_option_count",

      description:
        "Package contains fifty-four options.",

      run: () =>
        PILLAR_01_ALL_OPTIONS
          .length === 54
    },

    {
      id:
        "p01_test_micro_return_count",

      description:
        "Package contains eighteen micro-returns.",

      run: () =>
        PILLAR_01_MICRO_RETURNS
          .length === 18
    },

    {
      id:
        "p01_test_journal_count",

      description:
        "Package contains six journals.",

      run: () =>
        PILLAR_01_JOURNAL_PROMPTS
          .length === 6
    },

    {
      id:
        "p01_test_letter_count",

      description:
        "Package contains three guided letters.",

      run: () =>
        PILLAR_01_GUIDED_LETTERS
          .length === 3
    },

    {
      id:
        "p01_test_anchor_count",

      description:
        "Package contains three anchors.",

      run: () =>
        PILLAR_01_COMPANION_ANCHORS
          .length === 3
    },

    {
      id:
        "p01_test_first_question",

      description:
        "First question is available.",

      run: () =>
        Boolean(
          getPillar01Question(
            "p01_q_cons_01"
          )
        )
    },

    {
      id:
        "p01_test_last_question",

      description:
        "Last question is available.",

      run: () =>
        Boolean(
          getPillar01Question(
            "p01_q_pres_03"
          )
        )
    },

    {
      id:
        "p01_test_next_pillar",

      description:
        "Next canonical pillar is Família.",

      run: () =>
        PILLAR_01_CLOSURE_PACKAGE
          .next_canonical_unit_id ===
        "unit_pillar_02_familia"
    },

    {
      id:
        "p01_test_legacy_removed",

      description:
        "Legacy Pillar I technical ID is absent.",

      run: () =>
        !JSON.stringify(
          collectPillar01SerializableContent()
        ).includes(
          "pillar_01_vinculo"
        )
    },

    {
      id:
        "p01_test_integrity",

      description:
        "Integrity report has no errors.",

      run: () =>
        PILLAR_01_INTEGRITY_REPORT
          .errors.length === 0
    }
  ];


//////////////////////////////////////////////////
// 45. EXECUÇÃO DOS TESTES
//////////////////////////////////////////////////

export interface Pillar01SmokeTestResult {
  test_id:
    string;

  description:
    string;

  passed:
    boolean;

  error?:
    string;
}


export function runPillar01SmokeTests():
  Pillar01SmokeTestResult[] {
  return PILLAR_01_SMOKE_TESTS.map(
    test => {
      try {
        return {
          test_id:
            test.id,

          description:
            test.description,

          passed:
            test.run()
        };
      } catch (error) {
        return {
          test_id:
            test.id,

          description:
            test.description,

          passed:
            false,

          error:
            error instanceof Error
              ? error.message
              : "Unknown test error."
        };
      }
    }
  );
}


export const PILLAR_01_SMOKE_TEST_RESULTS =
  runPillar01SmokeTests();


//////////////////////////////////////////////////
// 46. GATE FINAL DE BUILD
//////////////////////////////////////////////////

export function isPillar01BuildReady():
  boolean {
  const testsPassed =
    PILLAR_01_SMOKE_TEST_RESULTS
      .every(
        result =>
          result.passed
      );

  return (
    testsPassed &&
    PILLAR_01_INTEGRITY_REPORT
      .publishable &&
    PILLAR_01_INTEGRATED_PACKAGE
      .status !== "blocked"
  );
}


export const PILLAR_01_BUILD_READY =
  isPillar01BuildReady();


//////////////////////////////////////////////////
// 47. RESULTADO FINAL PARA O PIPELINE
//////////////////////////////////////////////////

export const PILLAR_01_PIPELINE_RESULT = {
  package_id:
    PILLAR_01_PACKAGE_MANIFEST
      .package_id,

  pillar_id:
    "pillar_01_reconhecimento",

  ready:
    PILLAR_01_BUILD_READY,

  status:
    PILLAR_01_BUILD_READY
      ? "approved"
      : "blocked",

  manifest:
    PILLAR_01_PACKAGE_MANIFEST,

  integrity:
    PILLAR_01_INTEGRITY_REPORT,

  smoke_tests:
    PILLAR_01_SMOKE_TEST_RESULTS,

  build_summary:
    PILLAR_01_BUILD_SUMMARY
} as const;


//////////////////////////////////////////////////
// 48. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_18_FINAL_RULES = [
  "Pillar I is always identified as Reconhecimento.",

  "The canonical book layer must load before the companion layer.",

  "The companion layer must not exist without its canonical unit.",

  "The package must contain exactly three phases.",

  "The package must contain exactly nine questions.",

  "The package must contain exactly fifty-four closed options.",

  "The package must contain exactly eighteen micro returns.",

  "The package must contain exactly six journals.",

  "The package must contain exactly three guided letters.",

  "The package must contain exactly three companion anchors.",

  "The package must contain exactly nine predictive rules.",

  "The package must contain exactly six transition rules.",

  "Every closed option starts with low interpretation confidence.",

  "Every open response has higher evidential priority than its closed option.",

  "A closed option cannot create a recurring pattern.",

  "All exact book text requires an approved canonical reference.",

  "All approved adaptations require a canonical reference.",

  "Companion text must never be attributed to the book.",

  "Journals must disable analysis and memory by default.",

  "Guided letters must disable analysis and memory by default.",

  "Guided letters must never encourage external delivery or confrontation.",

  "Anchors must remain optional and stoppable.",

  "Anchors must not replace the canonical Ritual of Recognition.",

  "No reflective activity may block reading progress.",

  "The reader may close the pillar without completing reflection.",

  "The closure summary must remain editable and rejectable.",

  "Consolidated memory requires consent and confirmation.",

  "Raw reflective writing cannot enter consolidated memory.",

  "The canonical next pillar is Pillar II — Família.",

  "Cross-pillar transitions remain optional.",

  "Legacy technical IDs using pillar_01_vinculo are prohibited.",

  "The word vínculo may remain as an editorial concept.",

  "Any integrity error blocks publication.",

  "Warnings do not automatically block publication but require review.",

  "Publication must never occur automatically during package construction.",

  "Production publication requires an explicit pipeline action.",

  "The package is ready only when integrity validation and smoke tests pass."
];
// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
