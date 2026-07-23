// src/igentmind/core/closure.ts

import {
  ClosureSnapshot,
  ClosureStatus,
} from "./contracts";

export interface ClosureState {
  status: ClosureStatus;
  synthesisGenerated: boolean;
}

export const PILLAR_01_CLOSURE_ROUTES = [
  "canonical_support_letter",
  "canonical_recognition_ritual",
  "canonical_pillar_closing",
  "pause",
  "pillar_02_familia",
] as const;

export function createInitialClosureState():
  ClosureState {
  return {
    status: "not_started",
    synthesisGenerated: false,
  };
}

export function deriveClosureComplete(
  status: ClosureStatus,
): boolean {
  return (
    status === "completed" ||
    status ===
      "completed_without_synthesis"
  );
}

export function materializeClosure(
  state: ClosureState,
): ClosureSnapshot {
  return {
    status: state.status,
    complete:
      deriveClosureComplete(state.status),
    synthesisGenerated:
      state.synthesisGenerated,
    availableRoutes:
      deriveClosureComplete(state.status)
        ? [...PILLAR_01_CLOSURE_ROUTES]
        : [],
  };
}

export function markClosurePartial():
  ClosureState {
  return {
    status: "partial",
    synthesisGenerated: false,
  };
}

export function completeClosureWithSynthesis():
  ClosureState {
  return {
    status: "completed",
    synthesisGenerated: true,
  };
}

export function completeClosureWithoutSynthesis():
  ClosureState {
  return {
    status:
      "completed_without_synthesis",
    synthesisGenerated: false,
  };
}
