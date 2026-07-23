// src/igentmind/core/invariants.ts

import {
  BookCursor,
  GenerationMode,
  INTERVENTION_TYPES,
  InterventionType,
  InterpretationEvidence,
  InterpretationSnapshot,
  NextMove,
  PillarId,
  PILLAR_IDS,
  PRIORITY_RULES,
  PriorityRule,
  ScaleChange,
  ScaleDelta,
  ScaleName,
  VisibleMoveSnapshot,
} from "./contracts";

export class DomainInvariantError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainInvariantError";
  }
}

export function clampScale(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    throw new DomainInvariantError(
      "INVALID_SCALE_VALUE",
      "O valor da escala precisa ser finito.",
    );
  }

  return Math.min(4, Math.max(0, Math.round(value)));
}

export function isScaleDelta(
  value: unknown,
): value is ScaleDelta {
  return value === -1 || value === 0 || value === 1;
}

export function applyScaleDelta(
  scale: ScaleName,
  before: number,
  delta: number,
): ScaleChange {
  if (!isScaleDelta(delta)) {
    throw new DomainInvariantError(
      "INVALID_SCALE_DELTA",
      "Alterações de escala aceitam apenas -1, 0 ou 1.",
    );
  }

  const normalizedBefore = clampScale(before);

  return {
    scale,
    before: normalizedBefore,
    delta,
    after: clampScale(normalizedBefore + delta),
  };
}

export function resolvePriority(
  candidates: readonly PriorityRule[],
): {
  selected: PriorityRule;
  trace: PriorityRule[];
} {
  const uniqueCandidates = Array.from(
    new Set(candidates),
  );

  const trace = PRIORITY_RULES.filter(
    (priority) =>
      uniqueCandidates.includes(priority),
  );

  if (trace.length === 0) {
    return {
      selected: "editorial_rotation",
      trace: ["editorial_rotation"],
    };
  }

  return {
    selected: trace[0],
    trace,
  };
}

export function isBookCursor(
  value: unknown,
): value is BookCursor {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record =
    value as Record<string, unknown>;

  return (
    typeof record.contentId === "string" &&
    typeof record.sectionId === "string" &&
    typeof record.anchorId === "string" &&
    (
      record.offset === undefined ||
      typeof record.offset === "number"
    )
  );
}

export function isPillarId(
  value: unknown,
): value is PillarId {
  return Object.values(PILLAR_IDS).includes(
    value as PillarId,
  );
}

function requiredString(
  value: unknown,
  code: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new DomainInvariantError(
      code,
      "Campo textual obrigatório ausente.",
    );
  }

  return value;
}

/**
 * Aceita formatos legados apenas na fronteira.
 * A saída é sempre o formato discriminado oficial.
 */
export function normalizeNextMove(
  input: unknown,
): NextMove {
  if (typeof input === "string") {
    return normalizeNextMove({
      kind: input,
    });
  }

  if (!input || typeof input !== "object") {
    throw new DomainInvariantError(
      "INVALID_NEXT_MOVE",
      "next_move precisa ser uma string ou objeto.",
    );
  }

  const record =
    input as Record<string, unknown>;

  const rawKind =
    record.kind ??
    record.type ??
    record.action;

  const kind = requiredString(
    rawKind,
    "INVALID_NEXT_MOVE_KIND",
  );

  const targetId =
    record.targetId ??
    record.target_id ??
    record.target;

  const rawCursor =
    record.bookCursor ??
    record.book_cursor ??
    record.cursor;

  const reasonCode =
    typeof record.reasonCode === "string"
      ? record.reasonCode
      : typeof record.reason_code === "string"
        ? record.reason_code
        : undefined;

  switch (kind) {
    case "continue_reading":
      return {
        kind,
        reasonCode,
      };

    case "return_to_book":
      if (!isBookCursor(rawCursor)) {
        throw new DomainInvariantError(
          "NEXT_MOVE_CURSOR_REQUIRED",
          "return_to_book exige bookCursor.",
        );
      }

      return {
        kind,
        bookCursor: rawCursor,
        reasonCode,
      };

    case "ask_question":
      return {
        kind,
        targetId:
          typeof targetId === "string"
            ? targetId
            : undefined,
        reasonCode,
      };

    case "micro_return":
    case "open_journal":
    case "open_letter":
    case "open_anchor":
      return {
        kind,
        targetId: requiredString(
          targetId,
          "NEXT_MOVE_TARGET_REQUIRED",
        ),
        reasonCode,
      };

    case "pause":
      return {
        kind,
        reasonCode,
      };

    case "close_pillar":
      return {
        kind,
        targetId:
          typeof targetId === "string"
            ? targetId
            : undefined,
        reasonCode,
      };

    case "continue_to_pillar":
      if (!isPillarId(targetId)) {
        throw new DomainInvariantError(
          "INVALID_TARGET_PILLAR",
          "continue_to_pillar exige um PillarId oficial.",
        );
      }

      if (!isBookCursor(rawCursor)) {
        throw new DomainInvariantError(
          "NEXT_MOVE_CURSOR_REQUIRED",
          "continue_to_pillar exige bookCursor.",
        );
      }

      return {
        kind,
        targetId,
        bookCursor: rawCursor,
        reasonCode,
      };

    case "safety_stop":
      return {
        kind,
        reasonCode: requiredString(
          reasonCode,
          "SAFETY_REASON_REQUIRED",
        ),
      };

    default:
      throw new DomainInvariantError(
        "UNKNOWN_NEXT_MOVE",
        `next_move não reconhecido: ${kind}`,
      );
  }
}

export function isInterventionType(
  value: unknown,
): value is InterventionType {
  return INTERVENTION_TYPES.includes(
    value as InterventionType,
  );
}

export function composeVisibleResponse(input: {
  requestedMoves: readonly VisibleMoveSnapshot[];
  requestedQuestionCount: number;
  requestedMemoryIds: readonly string[];
  nextMove: NextMove | null;
}): {
  questionCount: number;
  visibleMoves: VisibleMoveSnapshot[];
  usedMemoryIds: string[];
  nextMove: NextMove | null;
} {
  return {
    questionCount:
      input.requestedQuestionCount > 0
        ? 1
        : 0,

    visibleMoves:
      input.requestedMoves.slice(0, 3),

    usedMemoryIds:
      input.requestedMemoryIds.slice(0, 1),

    nextMove: input.nextMove,
  };
}

export function normalizeInterpretation(input: {
  closedEvidence?: InterpretationEvidence[];
  openEvidence?: InterpretationEvidence;
  memoryEvidence?: InterpretationEvidence;
  stateEvidence?: InterpretationEvidence;
}): InterpretationSnapshot {
  const closedEvidence =
    (input.closedEvidence ?? []).map(
      (evidence) => ({
        ...evidence,
        confidence: Math.min(
          0.35,
          Math.max(0, evidence.confidence),
        ),
        superseded:
          input.openEvidence !== undefined
            ? true
            : evidence.superseded,
      }),
    );

  if (input.openEvidence) {
    return {
      authoritativeSource: "open",
      evidence: [
        ...closedEvidence,
        {
          ...input.openEvidence,
          source: "open",
          confidence: Math.max(
            0.5,
            Math.min(
              1,
              input.openEvidence.confidence,
            ),
          ),
        },
      ],
    };
  }

  if (input.memoryEvidence) {
    return {
      authoritativeSource: "memory",
      evidence: [
        ...closedEvidence,
        input.memoryEvidence,
      ],
    };
  }

  if (input.stateEvidence) {
    return {
      authoritativeSource: "state",
      evidence: [
        ...closedEvidence,
        input.stateEvidence,
      ],
    };
  }

  if (closedEvidence.length > 0) {
    return {
      authoritativeSource: "closed",
      evidence: closedEvidence,
    };
  }

  return {
    authoritativeSource: null,
    evidence: [],
  };
}

const PRIVATE_TELEMETRY_KEYS =
  new Set([
    "text",
    "content",
    "body",
    "snippet",
    "answer",
    "openAnswer",
    "open_answer",
    "journal",
    "letter",
    "memoryText",
    "memory_text",
    "rawText",
    "raw_text",
  ]);

export function sanitizeTelemetryPayload(
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map(
      sanitizeTelemetryPayload,
    );
  }

  if (
    !value ||
    typeof value !== "object"
  ) {
    return value;
  }

  const record =
    value as Record<string, unknown>;

  const sanitized:
    Record<string, unknown> = {};

  for (const [key, child] of Object.entries(record)) {
    if (PRIVATE_TELEMETRY_KEYS.has(key)) {
      continue;
    }

    sanitized[key] =
      sanitizeTelemetryPayload(child);
  }

  return sanitized;
}

export function assertEditorialCombination(input: {
  editorialOrigin:
    | "book_exact"
    | "book_approved_adaptation"
    | "igent_companion";

  generationMode: GenerationMode;
}): void {
  if (
    input.editorialOrigin === "book_exact" &&
    input.generationMode !== "fixed"
  ) {
    throw new DomainInvariantError(
      "INVALID_EDITORIAL_COMBINATION",
      "Conteúdo book_exact precisa usar generationMode fixed.",
    );
  }
}
