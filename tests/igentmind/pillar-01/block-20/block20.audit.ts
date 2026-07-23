// tests/igentmind/pillar-01/block-20/block20.audit.ts

import {
  AuditIssue,
  Block20Snapshot,
  LEGACY_PILLAR_01_ID,
  PILLAR_01_ID,
  PriorityRule,
  ScaleName,
} from "./block20.types";

export const BLOCK20_ISSUE_CATALOG = {
  B20_E001: "Contrato do adaptador de testes não conectado.",
  B20_E002: "ID legado pillar_01_vinculo ainda presente.",
  B20_E003: "Origem editorial e modo de geração estão misturados.",
  B20_E004: "Formato de next_move incompatível ou incompleto.",
  B20_E005: "Alteração de escala fora de -1, 0 ou 1.",
  B20_E006: "Escala resultante fora do intervalo de 0 a 4.",
  B20_E007: "Memória armazenada sem consentimento confirmado.",
  B20_E008: "Mais de uma memória usada na mesma resposta.",
  B20_E009: "Conteúdo privado apareceu em telemetria.",
  B20_E010: "Carta privada produziu saída externa.",
  B20_E011: "Mais de uma pergunta foi exibida no mesmo turno.",
  B20_E012: "Mais de três movimentos visíveis foram compostos.",
  B20_E013: "Resposta fechada recebeu confiança inicial excessiva.",
  B20_E014: "Resposta aberta não substituiu interpretação fechada.",
  B20_E015: "Cálculo de complete incompatível com o fechamento.",
  B20_E016: "Cursor do livro não foi preservado.",
  B20_E017: "Falha de referência produziu conteúdo inventado.",
  B20_E018: "Safety não venceu a cadeia de prioridades.",
  B20_E019: "Âncora interrompida foi marcada como concluída.",
  B20_E020: "Memória duplicada durante reabertura.",
  B20_E021: "Leitura bloqueada por reflexão opcional.",
  B20_E022: "Convite automático apareceu em seção proibida.",
} as const;

const PRIVATE_PAYLOAD_KEYS = new Set([
  "text",
  "content",
  "body",
  "snippet",
  "answer",
  "openAnswer",
  "journal",
  "letter",
  "memoryText",
  "rawText",
]);

const SCALE_NAMES: ScaleName[] = [
  "awareness",
  "judgment",
  "presence",
  "readiness",
  "load",
  "avoidance",
  "agency",
];

const PRIORITY_ORDER: PriorityRule[] = [
  "safety",
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
];

function push(
  issues: AuditIssue[],
  issue: AuditIssue,
): void {
  issues.push(issue);
}

function findPrivatePayloadPath(
  value: unknown,
  currentPath = "payload",
): string | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findPrivatePayloadPath(
        value[index],
        `${currentPath}[${index}]`,
      );

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const [key, child] of Object.entries(record)) {
    const childPath = `${currentPath}.${key}`;

    if (PRIVATE_PAYLOAD_KEYS.has(key) && child !== undefined) {
      return childPath;
    }

    const nested = findPrivatePayloadPath(child, childPath);

    if (nested) {
      return nested;
    }
  }

  return null;
}

export function auditBlock20Snapshot(
  snapshot: Block20Snapshot,
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const serializedSnapshot = JSON.stringify(snapshot);

  if (serializedSnapshot.includes(LEGACY_PILLAR_01_ID)) {
    push(issues, {
      code: "B20_E002",
      severity: "error",
      message: BLOCK20_ISSUE_CATALOG.B20_E002,
      observed: LEGACY_PILLAR_01_ID,
      expected: PILLAR_01_ID,
    });
  }

  if (snapshot.pillarId !== PILLAR_01_ID) {
    push(issues, {
      code: "B20_E002",
      severity: "error",
      message: "O snapshot do Pilar I usa um ID diferente do ID oficial.",
      path: "pillarId",
      observed: snapshot.pillarId,
      expected: PILLAR_01_ID,
    });
  }

  for (const scaleName of SCALE_NAMES) {
    const value = snapshot.scales[scaleName];

    if (!Number.isInteger(value) || value < 0 || value > 4) {
      push(issues, {
        code: "B20_E006",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E006,
        path: `scales.${scaleName}`,
        observed: value,
        expected: "integer between 0 and 4",
      });
    }
  }

  if (snapshot.lastTurn) {
    if (snapshot.lastTurn.questionCount > 1) {
      push(issues, {
        code: "B20_E011",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E011,
        path: "lastTurn.questionCount",
        observed: snapshot.lastTurn.questionCount,
        expected: "<= 1",
      });
    }

    if (snapshot.lastTurn.visibleMoves.length > 3) {
      push(issues, {
        code: "B20_E012",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E012,
        path: "lastTurn.visibleMoves",
        observed: snapshot.lastTurn.visibleMoves.length,
        expected: "<= 3",
      });
    }

    if (snapshot.lastTurn.usedMemoryIds.length > 1) {
      push(issues, {
        code: "B20_E008",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E008,
        path: "lastTurn.usedMemoryIds",
        observed: snapshot.lastTurn.usedMemoryIds,
        expected: "maximum one memory ID",
      });
    }

    for (
      let index = 0;
      index < snapshot.lastTurn.scaleChanges.length;
      index += 1
    ) {
      const change = snapshot.lastTurn.scaleChanges[index];

      if (![-1, 0, 1].includes(change.delta)) {
        push(issues, {
          code: "B20_E005",
          severity: "error",
          message: BLOCK20_ISSUE_CATALOG.B20_E005,
          path: `lastTurn.scaleChanges[${index}].delta`,
          observed: change.delta,
          expected: "-1, 0 or 1",
        });
      }

      if (change.after < 0 || change.after > 4) {
        push(issues, {
          code: "B20_E006",
          severity: "error",
          message: BLOCK20_ISSUE_CATALOG.B20_E006,
          path: `lastTurn.scaleChanges[${index}].after`,
          observed: change.after,
          expected: "between 0 and 4",
        });
      }
    }

    for (
      let index = 0;
      index < snapshot.lastTurn.contentReferences.length;
      index += 1
    ) {
      const reference = snapshot.lastTurn.contentReferences[index];

      if (
        !reference.editorialOrigin ||
        !reference.generationMode ||
        reference.contentOrigin !== undefined
      ) {
        push(issues, {
          code: "B20_E003",
          severity: "error",
          message: BLOCK20_ISSUE_CATALOG.B20_E003,
          path: `lastTurn.contentReferences[${index}]`,
          observed: reference,
          expected: {
            editorialOrigin:
              "book_exact | book_approved_adaptation | igent_companion",
            generationMode: "fixed | templated | generated",
            contentOrigin: "absent",
          },
        });
      }

      if (
        reference.editorialOrigin === "book_exact" &&
        reference.generationMode !== "fixed"
      ) {
        push(issues, {
          code: "B20_E003",
          severity: "error",
          message:
            "Conteúdo literal do livro não pode ser marcado como templated ou generated.",
          path: `lastTurn.contentReferences[${index}]`,
          observed: reference.generationMode,
          expected: "fixed",
        });
      }
    }

    const nextMove = snapshot.lastTurn.nextMove;

    if (nextMove) {
      if (
        nextMove.kind === "continue_to_pillar" &&
        !nextMove.targetId
      ) {
        push(issues, {
          code: "B20_E004",
          severity: "error",
          message:
            "next_move continue_to_pillar não possui targetId.",
          path: "lastTurn.nextMove",
          observed: nextMove,
          expected: "targetId",
        });
      }

      if (
        nextMove.kind === "return_to_book" &&
        !nextMove.bookCursor
      ) {
        push(issues, {
          code: "B20_E004",
          severity: "error",
          message:
            "next_move return_to_book não possui bookCursor.",
          path: "lastTurn.nextMove",
          observed: nextMove,
          expected: "bookCursor",
        });
      }
    }

    const closedEvidence =
      snapshot.lastTurn.interpretation?.evidence.filter(
        (item) => item.source === "closed",
      ) ?? [];

    for (const evidence of closedEvidence) {
      if (evidence.confidence > 0.35) {
        push(issues, {
          code: "B20_E013",
          severity: "warning",
          message: BLOCK20_ISSUE_CATALOG.B20_E013,
          observed: evidence.confidence,
          expected: "<= 0.35",
        });
      }
    }

    if (
      snapshot.lastTurn.contentReferenceFailure?.active &&
      (
        !snapshot.lastTurn.contentReferenceFailure.failClosed ||
        snapshot.lastTurn.contentReferenceFailure.inventedReplacement
      )
    ) {
      push(issues, {
        code: "B20_E017",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E017,
        observed:
          snapshot.lastTurn.contentReferenceFailure,
        expected: {
          active: true,
          failClosed: true,
          inventedReplacement: false,
        },
      });
    }
  }

  for (const memory of snapshot.memory.confirmed) {
    if (
      memory.consent !== "confirmed" ||
      memory.source !== "reader_confirmed"
    ) {
      push(issues, {
        code: "B20_E007",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E007,
        path: `memory.confirmed.${memory.id}`,
        observed: memory,
        expected: {
          consent: "confirmed",
          source: "reader_confirmed",
        },
      });
    }
  }

  for (
    let index = 0;
    index < snapshot.telemetry.length;
    index += 1
  ) {
    const event = snapshot.telemetry[index];
    const privatePath = findPrivatePayloadPath(event.payload);

    if (privatePath) {
      push(issues, {
        code: "B20_E009",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E009,
        path: `telemetry[${index}].${privatePath}`,
        observed: event.eventName,
        expected: "metadata only",
      });
    }
  }

  if (snapshot.outbound.length > 0) {
    const privateWritingExists = snapshot.writing.items.some(
      (item) =>
        item.type === "letter" &&
        item.visibility === "private",
    );

    if (privateWritingExists) {
      push(issues, {
        code: "B20_E010",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E010,
        observed: snapshot.outbound.length,
        expected: 0,
      });
    }
  }

  const interruptedAnchor = snapshot.writing.items.find(
    (item) =>
      item.type === "anchor" &&
      item.status === "interrupted",
  );

  if (interruptedAnchor?.complete) {
    push(issues, {
      code: "B20_E019",
      severity: "error",
      message: BLOCK20_ISSUE_CATALOG.B20_E019,
      observed: interruptedAnchor,
      expected: {
        status: "interrupted",
        complete: false,
      },
    });
  }

  if (
    snapshot.closure.status === "partial" &&
    snapshot.closure.complete
  ) {
    push(issues, {
      code: "B20_E015",
      severity: "error",
      message: BLOCK20_ISSUE_CATALOG.B20_E015,
      observed: snapshot.closure,
      expected: {
        status: "partial",
        complete: false,
      },
    });
  }

  if (
    (
      snapshot.closure.status === "completed" ||
      snapshot.closure.status ===
        "completed_without_synthesis"
    ) &&
    !snapshot.closure.complete
  ) {
    push(issues, {
      code: "B20_E015",
      severity: "error",
      message: BLOCK20_ISSUE_CATALOG.B20_E015,
      observed: snapshot.closure,
      expected: {
        complete: true,
      },
    });
  }

  if (snapshot.navigation.blocked) {
    push(issues, {
      code: "B20_E021",
      severity: "error",
      message: BLOCK20_ISSUE_CATALOG.B20_E021,
      observed: true,
      expected: false,
    });
  }

  if (snapshot.safety.active) {
    if (
      snapshot.lastTurn?.selectedPriority !==
      PRIORITY_ORDER[0]
    ) {
      push(issues, {
        code: "B20_E018",
        severity: "error",
        message: BLOCK20_ISSUE_CATALOG.B20_E018,
        observed: snapshot.lastTurn?.selectedPriority,
        expected: "safety",
      });
    }

    if (!snapshot.safety.reflectionSuspended) {
      push(issues, {
        code: "B20_E018",
        severity: "error",
        message:
          "O modo de segurança foi ativado, mas a reflexão não foi suspensa.",
        observed: snapshot.safety,
        expected: {
          active: true,
          reflectionSuspended: true,
        },
      });
    }
  }

  return issues;
}

export function assertNoPrivateTextInTelemetry(
  snapshot: Block20Snapshot,
  privateTexts: string[],
): AuditIssue[] {
  const serializedTelemetry = JSON.stringify(
    snapshot.telemetry,
  );

  return privateTexts.flatMap((privateText) => {
    if (!privateText) {
      return [];
    }

    if (serializedTelemetry.includes(privateText)) {
      return [
        {
          code: "B20_E009",
          severity: "error" as const,
          message:
            "Texto privado literal encontrado na telemetria.",
          observed: privateText,
          expected: "absent",
        },
      ];
    }

    return [];
  });
}
