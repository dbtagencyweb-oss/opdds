import {
  PILLAR_03_ID,
  type Pillar03ScaleDelta,
  type Pillar03ScaleKey,
} from "./pillar-03.block28.contracts";

import {
  type CreatePillar03QuestionInput,
  type Pillar03LayeredResponse,
  type Pillar03OpenAnswerDefinition,
  type Pillar03OptionBlueprint,
  type Pillar03Question,
  type Pillar03QuestionOption,
  type Pillar03SemanticPosition,
  type Pillar03SignalBinding,
} from "./pillar-03.block29.contracts";

const SEMANTIC_POSITIONS =
  Object.freeze([
    "recognition",
    "minimization",
    "defense",
    "ambivalence",
    "desire",
    "uncertainty",
  ] satisfies readonly Pillar03SemanticPosition[]);

const DEFAULT_SCALE_EFFECTS: Readonly<
  Record<
    Pillar03SemanticPosition,
    Readonly<
      Partial<
        Record<
          Pillar03ScaleKey,
          Pillar03ScaleDelta
        >
      >
    >
  >
> = Object.freeze({
  recognition: Object.freeze({
    awareness: 1,
  }),
  minimization: Object.freeze({
    avoidance: 1,
  }),
  defense: Object.freeze({
    judgment: 1,
    avoidance: 1,
  }),
  ambivalence: Object.freeze({
    awareness: 1,
  }),
  desire: Object.freeze({
    readiness: 1,
    agency: 1,
  }),
  uncertainty: Object.freeze({}),
});

const SIGNAL_EVIDENCE: Readonly<
  Record<
    Pillar03SemanticPosition,
    {
      readonly evidence: "weak" | "moderate";
      readonly occurrenceIncrement: 0 | 1;
    }
  >
> = Object.freeze({
  recognition: Object.freeze({
    evidence: "moderate",
    occurrenceIncrement: 1,
  }),
  minimization: Object.freeze({
    evidence: "weak",
    occurrenceIncrement: 0,
  }),
  defense: Object.freeze({
    evidence: "weak",
    occurrenceIncrement: 1,
  }),
  ambivalence: Object.freeze({
    evidence: "moderate",
    occurrenceIncrement: 1,
  }),
  desire: Object.freeze({
    evidence: "moderate",
    occurrenceIncrement: 1,
  }),
  uncertainty: Object.freeze({
    evidence: "weak",
    occurrenceIncrement: 0,
  }),
});

function countQuestionMarks(text: string): number {
  return [...text].filter(
    (character) => character === "?",
  ).length;
}

function assertSingleQuestionAtMost(
  texts: readonly string[],
  context: string,
): void {
  const count = texts.reduce(
    (total, text) =>
      total + countQuestionMarks(text),
    0,
  );

  if (count > 1) {
    throw new Error(
      `${context} contém mais de uma pergunta visível.`,
    );
  }
}

function assertSemanticPositions(
  options: readonly Pillar03OptionBlueprint[],
  questionId: string,
): void {
  if (options.length !== 6) {
    throw new Error(
      `${questionId} deve possuir exatamente seis opções.`,
    );
  }

  const received = new Set(
    options.map(
      (option) => option.semanticPosition,
    ),
  );

  for (const position of SEMANTIC_POSITIONS) {
    if (!received.has(position)) {
      throw new Error(
        `${questionId} não possui a posição semântica ${position}.`,
      );
    }
  }

  if (received.size !== 6) {
    throw new Error(
      `${questionId} possui posição semântica duplicada.`,
    );
  }
}

function createSignalBinding(
  primarySignalId: string,
  semanticPosition:
    Pillar03SemanticPosition,
): Pillar03SignalBinding {
  const evidence =
    SIGNAL_EVIDENCE[semanticPosition];

  return Object.freeze({
    signalId: primarySignalId,
    role: "primary",
    evidence: evidence.evidence,
    occurrenceIncrement:
      evidence.occurrenceIncrement,
    createsPatternAlone: false,
  });
}

function createLayeredResponses(
  option: Pillar03OptionBlueprint,
): Readonly<
  Record<
    "minimal" | "standard" | "deep",
    Pillar03LayeredResponse
  >
> {
  assertSingleQuestionAtMost(
    [option.mirror],
    `${option.id}.minimal`,
  );

  assertSingleQuestionAtMost(
    [
      option.mirror,
      option.displacement,
    ],
    `${option.id}.standard`,
  );

  assertSingleQuestionAtMost(
    [
      option.mirror,
      option.displacement,
      option.nextMove.text,
    ],
    `${option.id}.deep`,
  );

  return Object.freeze({
    minimal: Object.freeze({
      depth: "minimal",
      blocks: Object.freeze([
        Object.freeze({
          kind: "mirror",
          text: option.mirror,
        }),
      ]),
      visibleMoves: 1,
      asksAtMostOneQuestion: true,
      diagnostic: false,
      claimsResolution: false,
    }),

    standard: Object.freeze({
      depth: "standard",
      blocks: Object.freeze([
        Object.freeze({
          kind: "mirror",
          text: option.mirror,
        }),
        Object.freeze({
          kind: "displacement",
          text: option.displacement,
        }),
      ]),
      visibleMoves: 2,
      asksAtMostOneQuestion: true,
      diagnostic: false,
      claimsResolution: false,
    }),

    deep: Object.freeze({
      depth: "deep",
      blocks: Object.freeze([
        Object.freeze({
          kind: "mirror",
          text: option.mirror,
        }),
        Object.freeze({
          kind: "displacement",
          text: option.displacement,
        }),
        Object.freeze({
          kind: "next_move",
          interventionType:
            option.nextMove.interventionType,
          text: option.nextMove.text,
        }),
      ]),
      visibleMoves: 3,
      asksAtMostOneQuestion: true,
      diagnostic: false,
      claimsResolution: false,
    }),
  });
}

function createQuestionOption(
  questionId: string,
  primarySignalId: string,
  blueprint: Pillar03OptionBlueprint,
): Pillar03QuestionOption {
  return Object.freeze({
    id: blueprint.id,
    questionId,
    semanticPosition:
      blueprint.semanticPosition,
    visibleText: blueprint.visibleText,

    editorialOrigin: "igent_companion",
    generationMode: "fixed",

    interpretationConfidence: "low",
    isolatedSelectionCreatesPattern: false,

    signalBindings: Object.freeze([
      createSignalBinding(
        primarySignalId,
        blueprint.semanticPosition,
      ),
    ]),

    scaleEffects: Object.freeze({
      ...DEFAULT_SCALE_EFFECTS[
        blueprint.semanticPosition
      ],
      ...blueprint.scaleEffects,
    }),

    responses:
      createLayeredResponses(blueprint),
  });
}

function createOpenAnswer(
  questionId: string,
  displacement: string,
  nextMove: {
    readonly interventionType:
      | "question"
      | "pause";
    readonly text: string;
  },
): Pillar03OpenAnswerDefinition {
  const mirrorTemplate =
    "Você escreveu: “{{reader_excerpt}}”. Podemos começar pelas suas palavras, sem transformá-las em rótulo.";

  assertSingleQuestionAtMost(
    [mirrorTemplate],
    `${questionId}.open.minimal`,
  );

  assertSingleQuestionAtMost(
    [
      mirrorTemplate,
      displacement,
    ],
    `${questionId}.open.standard`,
  );

  assertSingleQuestionAtMost(
    [
      mirrorTemplate,
      displacement,
      nextMove.text,
    ],
    `${questionId}.open.deep`,
  );

  return Object.freeze({
    id: `${questionId}_open`,
    enabled: true,
    prompt:
      "Escreva com suas próprias palavras.",

    interpretivePriority:
      "higher_than_closed_option",

    signalExtractionMode:
      "tentative_from_reader_language",

    responseMustPrioritizeReaderWords: true,
    contradictionOverridesClosedOption: true,

    automaticMemoryCreation: false,
    memoryRequiresExplicitConsent: true,

    includedInTelemetry: false,
    includedInPublicSnapshot: false,

    responses: Object.freeze({
      minimal: Object.freeze({
        depth: "minimal",
        editorialOrigin: "igent_companion",
        generationMode: "templated",
        templateBlocks: Object.freeze([
          Object.freeze({
            kind: "mirror",
            text: mirrorTemplate,
          }),
        ]),
        visibleMoves: 1,
        asksAtMostOneQuestion: true,
      }),

      standard: Object.freeze({
        depth: "standard",
        editorialOrigin: "igent_companion",
        generationMode: "templated",
        templateBlocks: Object.freeze([
          Object.freeze({
            kind: "mirror",
            text: mirrorTemplate,
          }),
          Object.freeze({
            kind: "displacement",
            text: displacement,
          }),
        ]),
        visibleMoves: 2,
        asksAtMostOneQuestion: true,
      }),

      deep: Object.freeze({
        depth: "deep",
        editorialOrigin: "igent_companion",
        generationMode: "templated",
        templateBlocks: Object.freeze([
          Object.freeze({
            kind: "mirror",
            text: mirrorTemplate,
          }),
          Object.freeze({
            kind: "displacement",
            text: displacement,
          }),
          Object.freeze({
            kind: "next_move",
            interventionType:
              nextMove.interventionType,
            text: nextMove.text,
          }),
        ]),
        visibleMoves: 3,
        asksAtMostOneQuestion: true,
      }),
    }),
  });
}

export function createPillar03Question(
  input: CreatePillar03QuestionInput,
): Pillar03Question {
  assertSemanticPositions(
    input.options,
    input.id,
  );

  const optionIds = new Set<string>();

  for (const option of input.options) {
    if (optionIds.has(option.id)) {
      throw new Error(
        `ID de opção duplicado em ${input.id}: ${option.id}.`,
      );
    }

    optionIds.add(option.id);
  }

  return Object.freeze({
    id: input.id,
    pillarId: PILLAR_03_ID,
    order: input.order,
    phaseOrder: input.phaseOrder,
    phase: input.phase,

    prompt: input.prompt,
    canonicalSectionId:
      input.canonicalSectionId,

    editorialOrigin: "igent_companion",
    generationMode: "fixed",

    optional: true,
    blocking: false,
    oneQuestionPerTurn: true,

    options: Object.freeze(
      input.options.map((option) =>
        createQuestionOption(
          input.id,
          input.primarySignalId,
          option,
        ),
      ),
    ),

    openAnswer: createOpenAnswer(
      input.id,
      input.openAnswerDisplacement,
      input.openAnswerNextMove,
    ),
  });
}
