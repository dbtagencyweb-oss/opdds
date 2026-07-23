import type {
  PillarId,
  ReflectionPhase,
  ResponseDepth,
} from "../core";

import type {
  FinalComplementaryResource,
  FinalGeneratedQuestion,
  FinalGeneratedQuestionOption,
  FinalMicroReturnFunction,
  FinalPillarMasterSpec,
  FinalPillarPackage,
  FinalPredictiveRule,
  FinalSemanticPosition,
  FinalTransitionRule,
} from "./final.contracts";

const PHASES = Object.freeze([
  "consciousness",
  "judgment",
  "presence",
] satisfies readonly ReflectionPhase[]);

const SEMANTIC_POSITIONS = Object.freeze([
  "recognition",
  "minimization",
  "defense",
  "ambivalence",
  "desire",
  "uncertainty",
] satisfies readonly FinalSemanticPosition[]);

const MICRO_FUNCTIONS = Object.freeze([
  "recognition",
  "contradiction",
  "protection",
  "cost",
  "permission",
  "presence",
] satisfies readonly FinalMicroReturnFunction[]);

const DEPTHS = Object.freeze([
  "minimal",
  "standard",
  "deep",
] satisfies readonly ResponseDepth[]);

const POSITION_COPY: Readonly<
  Record<FinalSemanticPosition, string>
> = Object.freeze({
  recognition:
    "Consigo reconhecer que isso toca minha vida agora.",
  minimization:
    "Talvez eu esteja diminuindo isso para seguir funcionando.",
  defense:
    "Uma parte de mim tenta explicar, controlar ou afastar o tema.",
  ambivalence:
    "Uma parte percebe algo, outra ainda resiste a tocar nisso.",
  desire:
    "Existe algo que eu gostaria de viver de outro modo.",
  uncertainty:
    "Ainda não sei nomear exatamente o que acontece em mim.",
});

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function phaseIndex(phase: ReflectionPhase): number {
  return PHASES.indexOf(phase);
}

function phaseQuestionOffset(
  phase: ReflectionPhase,
): number {
  return phaseIndex(phase) * 3;
}

function questionId(
  spec: FinalPillarMasterSpec,
  phase: ReflectionPhase,
  order: number,
): string {
  return `p${pad(spec.ordinal)}_${phase}_q${pad(order)}`;
}

function resourceId(
  spec: FinalPillarMasterSpec,
  kind: FinalComplementaryResource["kind"],
  phase: ReflectionPhase,
  order: number,
): string {
  const segment =
    kind === "micro_return"
      ? "micro"
      : kind;

  return `p${pad(spec.ordinal)}_${segment}_${phase}_${pad(order)}`;
}

function responseBlocks(
  spec: FinalPillarMasterSpec,
  option: FinalSemanticPosition,
  question: string,
): Readonly<Record<ResponseDepth, readonly string[]>> {
  const mirror =
    option === "uncertainty"
      ? "Ainda não nomear também é uma informação."
      : POSITION_COPY[option];

  const displacement =
    `${spec.threshold} aparece aqui como território de leitura, não como diagnóstico.`;

  const next =
    `Volte para a pergunta sem pressa: ${question}`;

  return Object.freeze({
    minimal: Object.freeze([mirror]),
    standard: Object.freeze([
      mirror,
      displacement,
    ]),
    deep: Object.freeze([
      mirror,
      displacement,
      next,
    ]),
  });
}

function createQuestionOption(
  spec: FinalPillarMasterSpec,
  question: string,
  questionIdValue: string,
  semanticPosition: FinalSemanticPosition,
  optionOrder: number,
): FinalGeneratedQuestionOption {
  return Object.freeze({
    id: `${questionIdValue}_opt_${pad(optionOrder)}`,
    semanticPosition,
    visibleText: POSITION_COPY[semanticPosition],
    interpretationConfidence: "low",
    createsPatternAlone: false,
    privateContentInTelemetry: false,
    responses: responseBlocks(
      spec,
      semanticPosition,
      question,
    ),
  });
}

export function createFinalQuestionBank(
  spec: FinalPillarMasterSpec,
): readonly FinalGeneratedQuestion[] {
  return Object.freeze(
    PHASES.flatMap((phase) =>
      spec.questions[phase].map(
        (prompt, phaseOrder) => {
          const order =
            phaseQuestionOffset(phase) +
            phaseOrder +
            1;

          const id = questionId(
            spec,
            phase,
            phaseOrder + 1,
          );

          return Object.freeze({
            id,
            phase,
            order,
            prompt,
            oneQuestionPerTurn: true,
            optional: true,
            blocksReading: false,
            options: Object.freeze(
              SEMANTIC_POSITIONS.map(
                (semanticPosition, index) =>
                  createQuestionOption(
                    spec,
                    prompt,
                    id,
                    semanticPosition,
                    index + 1,
                  ),
              ),
            ),
            openAnswer: Object.freeze({
              id: `${id}_open`,
              enabled: true,
              priority:
                "higher_than_closed_option",
              telemetryContentAllowed: false,
              memoryRequiresConsent: true,
            }),
          } satisfies FinalGeneratedQuestion);
        },
      ),
    ),
  );
}

function createMicroReturns(
  spec: FinalPillarMasterSpec,
): readonly FinalComplementaryResource[] {
  return Object.freeze(
    PHASES.flatMap((phase) =>
      MICRO_FUNCTIONS.map((fn, index) =>
        Object.freeze({
          id: resourceId(
            spec,
            "micro_return",
            phase,
            index + 1,
          ),
          kind: "micro_return",
          phase,
          text:
            `${fn}: ${spec.threshold} pode ser observado sem virar sentença sobre você.`,
          private: false,
          sendAllowed: false,
          telemetryContentAllowed: false,
          replacesCanonicalContent: false,
          editorialOrigin: "igent_companion",
          generationMode: "fixed",
        } satisfies FinalComplementaryResource),
      ),
    ),
  );
}

function splitByPhase<T>(
  items: readonly T[],
): Readonly<Record<ReflectionPhase, readonly T[]>> {
  return Object.freeze({
    consciousness: Object.freeze(
      items.slice(0, 2),
    ),
    judgment: Object.freeze(items.slice(2, 4)),
    presence: Object.freeze(items.slice(4, 6)),
  });
}

function createPrivateWriting(
  spec: FinalPillarMasterSpec,
): readonly FinalComplementaryResource[] {
  const journalsByPhase =
    splitByPhase(spec.journals);

  const journals = PHASES.flatMap((phase) =>
    journalsByPhase[phase].map(
      (title, index) =>
        Object.freeze({
          id: resourceId(
            spec,
            "journal",
            phase,
            index + 1,
          ),
          kind: "journal",
          phase,
          title,
          text:
            `Escreva apenas para você: ${title}. Nenhum conteúdo privado entra em telemetria.`,
          private: true,
          sendAllowed: false,
          telemetryContentAllowed: false,
          replacesCanonicalContent: false,
          editorialOrigin: "igent_companion",
          generationMode: "fixed",
        } satisfies FinalComplementaryResource),
    ),
  );

  const letters = PHASES.map((phase, index) => {
    const title =
      spec.letters[index] ??
      `Carta privada de ${phase}`;

    return Object.freeze({
      id: resourceId(spec, "letter", phase, 1),
      kind: "letter",
      phase,
      title,
      text:
        `Carta não enviável: ${title}. Ela existe para organizar presença, não para produzir envio.`,
      private: true,
      sendAllowed: false,
      telemetryContentAllowed: false,
      replacesCanonicalContent: false,
      editorialOrigin: "igent_companion",
      generationMode: "fixed",
    } satisfies FinalComplementaryResource);
  });

  const anchors = PHASES.map((phase, index) => {
    const title =
      spec.anchors[index] ??
      `Âncora de ${phase}`;

    return Object.freeze({
      id: resourceId(spec, "anchor", phase, 1),
      kind: "anchor",
      phase,
      title,
      text:
        `Âncora interrompível: ${title}. Parar no meio preserva o estado incompleto.`,
      private: true,
      sendAllowed: false,
      telemetryContentAllowed: false,
      interruptionAllowed: true,
      replacesCanonicalContent: false,
      editorialOrigin: "igent_companion",
      generationMode: "fixed",
    } satisfies FinalComplementaryResource);
  });

  return Object.freeze([
    ...journals,
    ...letters,
    ...anchors,
  ]);
}

export function createFinalResources(
  spec: FinalPillarMasterSpec,
): readonly FinalComplementaryResource[] {
  return Object.freeze([
    ...createMicroReturns(spec),
    ...createPrivateWriting(spec),
  ]);
}

export function createFinalPredictiveRules(
  spec: FinalPillarMasterSpec,
  resources: readonly FinalComplementaryResource[],
): readonly FinalPredictiveRule[] {
  const rules = PHASES.flatMap((phase) => {
    const signals = spec.signals[phase];
    return signals.map((signalId, index) => {
      const family =
        index === 0
          ? "deepening"
          : index === 1
            ? "protection"
            : "integration";

      const resource =
        resources.find(
          (item) =>
            item.phase === phase &&
            (family === "integration"
              ? item.kind === "journal"
              : item.kind === "micro_return"),
        );

      return Object.freeze({
        id: `p${pad(spec.ordinal)}_rule_${phase}_${pad(index + 1)}`,
        phase,
        family,
        signalId,
        resourceId: resource?.id,
        depth:
          family === "protection"
            ? "minimal"
            : "standard",
        blocksReading: false,
        safetyDelegatedToCore: true,
      } satisfies FinalPredictiveRule);
    });
  });

  return Object.freeze(rules);
}

export function createFinalTransitions(
  spec: FinalPillarMasterSpec,
): readonly FinalTransitionRule[] {
  const previous =
    spec.ordinal > 3
      ? `pillar_${pad(spec.ordinal - 1)}_${
          [
            "",
            "",
            "",
            "luto",
            "trabalho",
            "dor",
            "desejo",
            "fe",
            "escassez",
          ][spec.ordinal - 1]
        }`
      : "pillar_02_familia";

  const next =
    spec.nextExperience ||
    `pillar_${pad(spec.ordinal + 1)}`;

  return Object.freeze([
    {
      id: `p${pad(spec.ordinal)}_transition_previous`,
      kind: "previous",
      targetId: previous,
      reason: "Retomar o território anterior sem punir interrupção.",
      automatic: false,
    },
    {
      id: `p${pad(spec.ordinal)}_transition_next`,
      kind: "next",
      targetId: next,
      reason: "Prosseguir apenas por escolha explícita do leitor.",
      automatic: false,
    },
    {
      id: `p${pad(spec.ordinal)}_transition_priority_01`,
      kind: "priority",
      targetId: "caderno_presenca_sobrevivencia",
      reason: "Reconectar com presença quando a carga pede pausa.",
      automatic: false,
    },
    {
      id: `p${pad(spec.ordinal)}_transition_priority_02`,
      kind: "priority",
      targetId: "caderno_presenca_reconstrucao",
      reason: "Apoiar reorganização sem transformar reflexão em obrigação.",
      automatic: false,
    },
    {
      id: `p${pad(spec.ordinal)}_transition_secondary_01`,
      kind: "secondary",
      targetId: "pillar_01_reconhecimento",
      reason: "Voltar ao reconhecimento quando o leitor precisar nomear antes de avançar.",
      automatic: false,
    },
    {
      id: `p${pad(spec.ordinal)}_transition_secondary_02`,
      kind: "secondary",
      targetId: "pillar_09_vazio",
      reason: "Permitir continuidade quando a síntese não for necessária.",
      automatic: false,
    },
  ] satisfies readonly FinalTransitionRule[]);
}

function validateFinalPillarPackage(
  pkg: Omit<FinalPillarPackage, "publicationGate">,
): readonly string[] {
  const errors: string[] = [];

  if (pkg.questions.length !== 9) {
    errors.push(`${pkg.pillarId}: deve possuir 9 perguntas.`);
  }

  const optionCount = pkg.questions.reduce(
    (total, question) =>
      total + question.options.length,
    0,
  );

  if (optionCount !== 54) {
    errors.push(`${pkg.pillarId}: deve possuir 54 opções.`);
  }

  const resourcesByKind = new Map<string, number>();
  for (const resource of pkg.resources) {
    resourcesByKind.set(
      resource.kind,
      (resourcesByKind.get(resource.kind) ?? 0) + 1,
    );

    if (
      resource.private &&
      resource.telemetryContentAllowed
    ) {
      errors.push(`${resource.id}: conteúdo privado vazando em telemetria.`);
    }
  }

  if ((resourcesByKind.get("micro_return") ?? 0) !== 18) {
    errors.push(`${pkg.pillarId}: deve possuir 18 micro-retornos.`);
  }

  if ((resourcesByKind.get("journal") ?? 0) !== 6) {
    errors.push(`${pkg.pillarId}: deve possuir 6 diários.`);
  }

  if ((resourcesByKind.get("letter") ?? 0) !== 3) {
    errors.push(`${pkg.pillarId}: deve possuir 3 cartas.`);
  }

  if ((resourcesByKind.get("anchor") ?? 0) !== 3) {
    errors.push(`${pkg.pillarId}: deve possuir 3 âncoras.`);
  }

  if (pkg.predictiveRules.length !== 9) {
    errors.push(`${pkg.pillarId}: deve possuir 9 regras preditivas.`);
  }

  if (pkg.transitions.length !== 6) {
    errors.push(`${pkg.pillarId}: deve possuir 6 transições.`);
  }

  const serialized = JSON.stringify(pkg);
  if (serialized.includes("pillar_01_vinculo")) {
    errors.push("ID legado pillar_01_vinculo não pode aparecer.");
  }

  return Object.freeze(errors);
}

function blockRangeForPillar(ordinal: number): readonly number[] {
  const ranges: Record<number, readonly number[]> = {
    3: [30],
    4: [32, 33, 34],
    5: [35, 36, 37],
    6: [38, 39, 40],
    7: [42, 43, 44],
    8: [45, 46, 47],
    9: [48, 49, 50],
  };

  return ranges[ordinal] ?? [];
}

export function createFinalPillarPackage(
  spec: FinalPillarMasterSpec,
): FinalPillarPackage {
  const questions = createFinalQuestionBank(spec);
  const resources = createFinalResources(spec);
  const predictiveRules =
    createFinalPredictiveRules(spec, resources);
  const transitions = createFinalTransitions(spec);

  const withoutGate = Object.freeze({
    schemaVersion: "igentmind.final-pillar.v1",
    blockRange: blockRangeForPillar(spec.ordinal),
    pillarId: spec.id,
    ordinal: spec.ordinal,
    identity: Object.freeze({
      internalTitle: spec.internalTitle,
      subtitle: spec.subtitle,
      opening: spec.opening,
      threshold: spec.threshold,
      thesis: spec.thesis,
      centralMovement: spec.centralMovement,
      editorialOrigin: "igent_companion",
      generationMode: "fixed",
    }),
    canonicalSections: spec.canonicalSections,
    signals: Object.freeze(
      PHASES.flatMap((phase) => spec.signals[phase]),
    ),
    questions,
    resources,
    predictiveRules,
    transitions,
    closure: Object.freeze({
      id: `p${pad(spec.ordinal)}_closure`,
      completeRequiresAllQuestions: false,
      synthesisOptional: true,
      nextExperience: spec.nextExperience,
      blocksReading: false,
    }),
    memoryPolicy: Object.freeze({
      candidateAllowed: true,
      requiresExplicitConsent: true,
      editableBeforeConfirmation: true,
      oneMemoryPerResponse: true,
    }),
  } satisfies Omit<FinalPillarPackage, "publicationGate">);

  const errors =
    validateFinalPillarPackage(withoutGate);

  return Object.freeze({
    ...withoutGate,
    publicationGate: Object.freeze({
      mode: "publication",
      ready: errors.length === 0,
      errors,
    }),
  });
}
