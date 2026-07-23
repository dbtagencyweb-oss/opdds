import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_ID,
  PILLAR_04_ID,
  type Pillar03Block28Counts,
  type Pillar03Block28ValidationIssue,
  type Pillar03Block28ValidationReport,
  type Pillar03ScaleDelta,
} from "./pillar-03.block28.contracts";

import { PILLAR_03_CANONICAL_SECTIONS } from "./pillar-03.canonical";
import { PILLAR_03_DOSSIER } from "./pillar-03.dossier";
import {
  PILLAR_03_ENTRY,
  validatePillar03EntryCompatibility,
} from "./pillar-03.entry";
import { PILLAR_03_IDENTITY } from "./pillar-03.identity";
import { PILLAR_03_PREDICTIVE_RULES } from "./pillar-03.predictive";
import { PILLAR_03_SIGNALS } from "./pillar-03.signals";

const EXPECTED_SECTION_ORDER = Object.freeze([
  "identity",
  "threshold",
  "manifesto",
  "narrative",
  "consciousness",
  "judgment",
  "presence",
  "support_letter",
  "anchor",
  "closing",
] as const);

const EXPECTED_SECTION_TITLES = Object.freeze([
  "Luto",
  "Vazio",
  "O que continua doendo depois que tudo já aconteceu",
  "O luto que não teve corpo para cair",
  "O que continua faltando mesmo quando a vida seguiu",
  "Quando sentir saudade vira atraso",
  "Ficar com o vazio sem transformá-lo em fuga",
  "A quem está cansado de provar",
  "O ritual do nome não dito",
  "Nem toda perda se fecha. Mas toda perda ignorada cobra.",
] as const);

const EXPECTED_PAGE_RANGES = Object.freeze([
  [154, 154],
  [155, 155],
  [156, 158],
  [159, 161],
  [161, 163],
  [163, 164],
  [165, 166],
  [166, 167],
  [167, 167],
  [167, 168],
] as const);

const VALID_DELTAS = new Set<Pillar03ScaleDelta>([
  -1,
  0,
  1,
]);

const VALID_PRIORITIES = new Set([
  "explicit_choice",
  "overload",
  "pause",
  "state",
  "depth",
  "signal",
  "open_thread",
  "progression",
  "memory",
  "editorial_rotation",
]);

function issue(
  code: string,
  message: string,
  path?: string,
): Pillar03Block28ValidationIssue {
  return Object.freeze({
    code,
    message,
    path,
  });
}

export function getPillar03Block28Counts(): Pillar03Block28Counts {
  return Object.freeze({
    canonicalSections:
      PILLAR_03_CANONICAL_SECTIONS.length,
    signals: PILLAR_03_SIGNALS.length,
    predictiveRules:
      PILLAR_03_PREDICTIVE_RULES.length,

    consciousnessSignals:
      PILLAR_03_SIGNALS.filter(
        (signal) =>
          signal.phase === "consciousness",
      ).length,

    judgmentSignals:
      PILLAR_03_SIGNALS.filter(
        (signal) => signal.phase === "judgment",
      ).length,

    presenceSignals:
      PILLAR_03_SIGNALS.filter(
        (signal) => signal.phase === "presence",
      ).length,

    deepeningRules:
      PILLAR_03_PREDICTIVE_RULES.filter(
        (rule) => rule.family === "deepening",
      ).length,

    protectionRules:
      PILLAR_03_PREDICTIVE_RULES.filter(
        (rule) => rule.family === "protection",
      ).length,

    integrationRules:
      PILLAR_03_PREDICTIVE_RULES.filter(
        (rule) => rule.family === "integration",
      ).length,
  });
}

function validateIdentity(
  errors: Pillar03Block28ValidationIssue[],
): void {
  if (PILLAR_03_IDENTITY.id !== PILLAR_03_ID) {
    errors.push(
      issue(
        "P03_INVALID_ID",
        "O ID oficial deve ser pillar_03_luto.",
        "identity.id",
      ),
    );
  }

  if (
    PILLAR_03_IDENTITY.previousPillarId !==
    PILLAR_02_ID
  ) {
    errors.push(
      issue(
        "P03_INVALID_PREVIOUS_PILLAR",
        "O pilar anterior deve permanecer pillar_02_familia.",
        "identity.previousPillarId",
      ),
    );
  }

  if (
    PILLAR_03_IDENTITY.entryExperienceId !==
    INTERLUDE_FENDA_ID
  ) {
    errors.push(
      issue(
        "P03_INVALID_ENTRY_EXPERIENCE",
        "A entrada imediata deve vir de interlude_fenda.",
        "identity.entryExperienceId",
      ),
    );
  }

  if (
    PILLAR_03_IDENTITY.nextPillarId !==
    PILLAR_04_ID
  ) {
    errors.push(
      issue(
        "P03_INVALID_NEXT_PILLAR",
        "O próximo pilar deve ser pillar_04_trabalho.",
        "identity.nextPillarId",
      ),
    );
  }

  if (PILLAR_03_IDENTITY.blocksReading) {
    errors.push(
      issue(
        "P03_BLOCKS_READING",
        "O Pilar III não pode bloquear a leitura.",
        "identity.blocksReading",
      ),
    );
  }
}

function validateEntry(
  errors: Pillar03Block28ValidationIssue[],
): void {
  if (!validatePillar03EntryCompatibility()) {
    errors.push(
      issue(
        "P03_INTERLUDE_ENTRY_INCOMPATIBLE",
        "A saída do Interlúdio Fenda não corresponde à entrada do Pilar III.",
        "entry",
      ),
    );
  }

  if (
    PILLAR_03_ENTRY.source.kind !== "interlude" ||
    PILLAR_03_ENTRY.source.experienceId !==
      INTERLUDE_FENDA_ID
  ) {
    errors.push(
      issue(
        "P03_INVALID_ENTRY_SOURCE",
        "A origem imediata deve ser a experiência interlude_fenda.",
        "entry.source",
      ),
    );
  }

  if (
    PILLAR_03_ENTRY.target.kind !== "pillar" ||
    PILLAR_03_ENTRY.target.pillarId !==
      PILLAR_03_ID
  ) {
    errors.push(
      issue(
        "P03_INVALID_ENTRY_TARGET",
        "O destino da entrada deve ser pillar_03_luto.",
        "entry.target",
      ),
    );
  }

  if (
    PILLAR_03_ENTRY.automatic ||
    !PILLAR_03_ENTRY.explicitChoicePreserved
  ) {
    errors.push(
      issue(
        "P03_AUTOMATIC_ENTRY",
        "A entrada não pode remover a escolha explícita do leitor.",
        "entry",
      ),
    );
  }

  if (
    "pillarId" in PILLAR_03_ENTRY.source
  ) {
    errors.push(
      issue(
        "P03_INTERLUDE_AS_PILLAR",
        "interlude_fenda não pode aparecer como PillarId.",
        "entry.source",
      ),
    );
  }
}

function validateCanonicalSections(
  errors: Pillar03Block28ValidationIssue[],
): void {
  if (
    PILLAR_03_CANONICAL_SECTIONS.length !== 10
  ) {
    errors.push(
      issue(
        "P03_CANONICAL_COUNT",
        "O Pilar III deve possuir dez seções canônicas.",
        "canonicalSections",
      ),
    );

    return;
  }

  PILLAR_03_CANONICAL_SECTIONS.forEach(
    (section, index) => {
      if (
        section.kind !==
        EXPECTED_SECTION_ORDER[index]
      ) {
        errors.push(
          issue(
            "P03_CANONICAL_ORDER",
            `Ordem canônica inválida na posição ${index}.`,
            `canonicalSections.${index}.kind`,
          ),
        );
      }

      if (
        section.title !==
        EXPECTED_SECTION_TITLES[index]
      ) {
        errors.push(
          issue(
            "P03_CANONICAL_TITLE",
            `Título canônico inválido em ${section.id}.`,
            `canonicalSections.${index}.title`,
          ),
        );
      }

      if (
        section.sourceReference.pageStart !==
          EXPECTED_PAGE_RANGES[index][0] ||
        section.sourceReference.pageEnd !==
          EXPECTED_PAGE_RANGES[index][1]
      ) {
        errors.push(
          issue(
            "P03_CANONICAL_PAGE_RANGE",
            `Faixa de páginas inválida em ${section.id}.`,
            `canonicalSections.${index}.sourceReference`,
          ),
        );
      }

      if (
        section.editorialOrigin !==
          "book_exact" ||
        section.generationMode !== "fixed"
      ) {
        errors.push(
          issue(
            "P03_CANONICAL_ORIGIN",
            `${section.id} deve ser book_exact e fixed.`,
            `canonicalSections.${index}`,
          ),
        );
      }

      if (
        section.bodyPolicy !==
        "canonical_source_reference_only"
      ) {
        errors.push(
          issue(
            "P03_CANONICAL_BODY_POLICY",
            `${section.id} não pode armazenar uma reconstrução do texto canônico.`,
            `canonicalSections.${index}.bodyPolicy`,
          ),
        );
      }

      if (
        "body" in section ||
        "text" in section ||
        "content" in section
      ) {
        errors.push(
          issue(
            "P03_CANONICAL_BODY_EMBEDDED",
            `${section.id} deve referenciar o PDF sem incorporar o corpo textual.`,
            `canonicalSections.${index}`,
          ),
        );
      }
    },
  );

  const automaticInviteKinds =
    PILLAR_03_CANONICAL_SECTIONS.filter(
      (section) =>
        section.automaticInviteAfter,
    ).map((section) => section.kind);

  if (
    JSON.stringify(automaticInviteKinds) !==
    JSON.stringify([
      "consciousness",
      "judgment",
      "presence",
    ])
  ) {
    errors.push(
      issue(
        "P03_AUTOMATIC_INVITE_SECTIONS",
        "Convites automáticos devem aparecer somente após Consciência, Julgamento e Presença.",
        "canonicalSections",
      ),
    );
  }
}

function validateDossier(
  errors: Pillar03Block28ValidationIssue[],
): void {
  if (
    PILLAR_03_DOSSIER.pillarId !==
    PILLAR_03_ID
  ) {
    errors.push(
      issue(
        "P03_DOSSIER_ID",
        "O dossiê não pertence ao Pilar III.",
        "dossier.pillarId",
      ),
    );
  }

  if (
    PILLAR_03_DOSSIER.editorialOrigin !==
      "igent_companion" ||
    PILLAR_03_DOSSIER.generationMode !==
      "fixed"
  ) {
    errors.push(
      issue(
        "P03_DOSSIER_ORIGIN",
        "O dossiê deve ser conteúdo complementar fixo.",
        "dossier",
      ),
    );
  }

  if (
    !PILLAR_03_DOSSIER.delegatesSafetyToCore ||
    PILLAR_03_DOSSIER.diagnosesReader ||
    PILLAR_03_DOSSIER.classifiesThirdParties ||
    PILLAR_03_DOSSIER.requiresClosure
  ) {
    errors.push(
      issue(
        "P03_DOSSIER_SAFETY",
        "O dossiê viola os limites de segurança ou autonomia.",
        "dossier",
      ),
    );
  }

  if (
    PILLAR_03_DOSSIER.connections.length !== 7
  ) {
    errors.push(
      issue(
        "P03_CONNECTION_COUNT",
        "O dossiê deve registrar sete conexões editoriais.",
        "dossier.connections",
      ),
    );
  }
}

function validateSignals(
  errors: Pillar03Block28ValidationIssue[],
): void {
  if (PILLAR_03_SIGNALS.length !== 9) {
    errors.push(
      issue(
        "P03_SIGNAL_COUNT",
        "O Pilar III deve possuir nove sinais.",
        "signals",
      ),
    );
  }

  const ids = new Set<string>();

  for (const signal of PILLAR_03_SIGNALS) {
    if (ids.has(signal.id)) {
      errors.push(
        issue(
          "P03_DUPLICATE_SIGNAL",
          `Sinal duplicado: ${signal.id}.`,
          `signals.${signal.id}`,
        ),
      );
    }

    ids.add(signal.id);

    if (!signal.id.startsWith("p03_")) {
      errors.push(
        issue(
          "P03_SIGNAL_PREFIX",
          `O sinal ${signal.id} não usa o prefixo p03_.`,
          `signals.${signal.id}`,
        ),
      );
    }

    if (signal.pillarId !== PILLAR_03_ID) {
      errors.push(
        issue(
          "P03_SIGNAL_PILLAR_ID",
          `O sinal ${signal.id} não pertence ao Pilar III.`,
          `signals.${signal.id}.pillarId`,
        ),
      );
    }

    if (
      signal.initialConfidence !== "low" ||
      signal.initialConfidenceValue !== 0.3
    ) {
      errors.push(
        issue(
          "P03_SIGNAL_CONFIDENCE",
          `O sinal ${signal.id} deve começar com confiança baixa.`,
          `signals.${signal.id}`,
        ),
      );
    }

    if (
      signal.minimumOccurrencesForPattern !==
        3 ||
      signal.isolatedClosedOptionCreatesPattern
    ) {
      errors.push(
        issue(
          "P03_SIGNAL_PATTERN_POLICY",
          `O sinal ${signal.id} viola a política de recorrência.`,
          `signals.${signal.id}`,
        ),
      );
    }

    if (
      signal.diagnostic ||
      signal.permanentTrait ||
      signal.classifiesThirdParty
    ) {
      errors.push(
        issue(
          "P03_DIAGNOSTIC_SIGNAL",
          `O sinal ${signal.id} não pode diagnosticar ou definir traços permanentes.`,
          `signals.${signal.id}`,
        ),
      );
    }

    for (const delta of Object.values(
      signal.scaleEffects,
    )) {
      if (
        delta !== undefined &&
        !VALID_DELTAS.has(delta)
      ) {
        errors.push(
          issue(
            "P03_INVALID_SCALE_DELTA",
            `O sinal ${signal.id} possui delta fora de -1, 0 ou 1.`,
            `signals.${signal.id}.scaleEffects`,
          ),
        );
      }
    }
  }

  const counts = getPillar03Block28Counts();

  if (
    counts.consciousnessSignals !== 3 ||
    counts.judgmentSignals !== 3 ||
    counts.presenceSignals !== 3
  ) {
    errors.push(
      issue(
        "P03_SIGNAL_PHASE_DISTRIBUTION",
        "Devem existir três sinais por fase.",
        "signals",
      ),
    );
  }
}

function validatePredictiveRules(
  errors: Pillar03Block28ValidationIssue[],
): void {
  if (
    PILLAR_03_PREDICTIVE_RULES.length !== 9
  ) {
    errors.push(
      issue(
        "P03_PREDICTIVE_RULE_COUNT",
        "O Pilar III deve possuir nove regras preditivas.",
        "predictiveRules",
      ),
    );
  }

  const signalIds: Set<string> = new Set(
    PILLAR_03_SIGNALS.map(
      (signal) => signal.id,
    ),
  );

  const ruleIds = new Set<string>();

  for (const rule of PILLAR_03_PREDICTIVE_RULES) {
    if (ruleIds.has(rule.id)) {
      errors.push(
        issue(
          "P03_DUPLICATE_RULE",
          `Regra duplicada: ${rule.id}.`,
          `predictiveRules.${rule.id}`,
        ),
      );
    }

    ruleIds.add(rule.id);

    if (
      !rule.id.startsWith(
        `p03_rule_${rule.phase}_`,
      )
    ) {
      errors.push(
        issue(
          "P03_RULE_ID_PHASE",
          `A regra ${rule.id} não corresponde à própria fase.`,
          `predictiveRules.${rule.id}`,
        ),
      );
    }

    if (rule.pillarId !== PILLAR_03_ID) {
      errors.push(
        issue(
          "P03_RULE_PILLAR",
          `A regra ${rule.id} não pertence ao Pilar III.`,
          `predictiveRules.${rule.id}`,
        ),
      );
    }

    if (!VALID_PRIORITIES.has(rule.priority)) {
      errors.push(
        issue(
          "P03_RULE_PRIORITY",
          `Prioridade inválida na regra ${rule.id}.`,
          `predictiveRules.${rule.id}.priority`,
        ),
      );
    }

    if (
      !rule.delegatesSafetyToCore ||
      !rule.readerChoicePreserved ||
      rule.blocksReading
    ) {
      errors.push(
        issue(
          "P03_RULE_AUTONOMY",
          `A regra ${rule.id} viola segurança, escolha ou navegação.`,
          `predictiveRules.${rule.id}`,
        ),
      );
    }

    for (const condition of rule.conditions) {
      if (
        condition.source === "signal" &&
        !signalIds.has(condition.key)
      ) {
        errors.push(
          issue(
            "P03_RULE_UNKNOWN_SIGNAL",
            `A regra ${rule.id} referencia o sinal inexistente ${condition.key}.`,
            `predictiveRules.${rule.id}.conditions`,
          ),
        );
      }
    }

    const resourceIntent =
      rule.recommendedMove.resourceIntent;

    if (
      resourceIntent &&
      resourceIntent.bindingStatus !==
        "pending_block_30"
    ) {
      errors.push(
        issue(
          "P03_PREMATURE_RESOURCE_BINDING",
          `A regra ${rule.id} possui vínculo de recurso prematuro.`,
          `predictiveRules.${rule.id}.recommendedMove`,
        ),
      );
    }

    if (
      "resourceId" in rule.recommendedMove
    ) {
      errors.push(
        issue(
          "P03_DANGLING_RESOURCE_ID",
          `A regra ${rule.id} não pode referenciar recurso ainda inexistente.`,
          `predictiveRules.${rule.id}.recommendedMove`,
        ),
      );
    }
  }

  const counts = getPillar03Block28Counts();

  if (
    counts.deepeningRules !== 3 ||
    counts.protectionRules !== 3 ||
    counts.integrationRules !== 3
  ) {
    errors.push(
      issue(
        "P03_RULE_FAMILY_DISTRIBUTION",
        "Devem existir três regras de aprofundamento, três de proteção e três de integração.",
        "predictiveRules",
      ),
    );
  }

  for (const phase of [
    "consciousness",
    "judgment",
    "presence",
  ] as const) {
    const phaseRules =
      PILLAR_03_PREDICTIVE_RULES.filter(
        (rule) => rule.phase === phase,
      );

    if (phaseRules.length !== 3) {
      errors.push(
        issue(
          "P03_RULE_PHASE_DISTRIBUTION",
          `A fase ${phase} deve possuir três regras.`,
          `predictiveRules.${phase}`,
        ),
      );
    }
  }
}

function validatePrivateContentAbsence(
  errors: Pillar03Block28ValidationIssue[],
): void {
  const serialized = JSON.stringify({
    identity: PILLAR_03_IDENTITY,
    entry: PILLAR_03_ENTRY,
    canonical: PILLAR_03_CANONICAL_SECTIONS,
    dossier: PILLAR_03_DOSSIER,
    signals: PILLAR_03_SIGNALS,
    rules: PILLAR_03_PREDICTIVE_RULES,
  });

  const privateContentKeys = [
    "journalEntry",
    "letterBody",
    "openAnswerText",
    "readerPrivateText",
    "memoryText",
  ];

  for (const key of privateContentKeys) {
    if (serialized.includes(key)) {
      errors.push(
        issue(
          "P03_PRIVATE_CONTENT",
          `O Bloco 28 contém campo privado proibido: ${key}.`,
          "block28",
        ),
      );
    }
  }
}

function validateLegacyIds(
  errors: Pillar03Block28ValidationIssue[],
): void {
  const serialized = JSON.stringify({
    identity: PILLAR_03_IDENTITY,
    entry: PILLAR_03_ENTRY,
    canonical: PILLAR_03_CANONICAL_SECTIONS,
    dossier: PILLAR_03_DOSSIER,
    signals: PILLAR_03_SIGNALS,
    rules: PILLAR_03_PREDICTIVE_RULES,
  });

  if (serialized.includes("pillar_01_vinculo")) {
    errors.push(
      issue(
        "P03_LEGACY_ID",
        "O ID legado pillar_01_vinculo não pode aparecer.",
        "block28",
      ),
    );
  }
}

export function validatePillar03Block28(): Pillar03Block28ValidationReport {
  const errors:
    Pillar03Block28ValidationIssue[] = [];

  const warnings:
    Pillar03Block28ValidationIssue[] = [];

  validateIdentity(errors);
  validateEntry(errors);
  validateCanonicalSections(errors);
  validateDossier(errors);
  validateSignals(errors);
  validatePredictiveRules(errors);
  validatePrivateContentAbsence(errors);
  validateLegacyIds(errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}
