// tests/igentmind/pillar-01/block-20/block20.types.ts

export {
  LEGACY_PILLAR_01_ID,
  PILLAR_01_ID,
  PILLAR_02_ID,
} from "../../../../src/igentmind/core";

export type {
  BookCursor,
  ClosureStatus,
  ContentReferenceSnapshot,
  CreateIGentMindAdapter,
  DebugSnapshot,
  EditorialOrigin,
  GenerationMode,
  IGentMindAdapter,
  IGentMindCommand,
  IGentMindCommandType,
  IGentMindFixture,
  IGentMindSnapshot,
  InterpretationEvidence,
  InterpretationSnapshot,
  InterventionType,
  LastTurnSnapshot,
  MemoryRecordSnapshot,
  MemorySnapshot,
  NavigationSnapshot,
  NextMove,
  OutboundMessageSnapshot,
  PillarId,
  PriorityRule,
  ReaderState,
  ReflectionPhase,
  ReflectionProgressSnapshot,
  ResponseDepth,
  SafetySnapshot,
  ScaleChange,
  ScaleDelta,
  ScaleName,
  ScaleSnapshot,
  TelemetryEventSnapshot,
  VisibleMoveSnapshot,
  WritingItemSnapshot,
  WritingResourceType,
  WritingSnapshot,
} from "../../../../src/igentmind/core";

import type {
  IGentMindAdapter,
  IGentMindCommand,
  IGentMindCommandType,
  IGentMindFixture,
  IGentMindSnapshot,
} from "../../../../src/igentmind/core";

export type Block20Adapter =
  IGentMindAdapter;

export type Block20Command =
  IGentMindCommand;

export type Block20CommandType =
  IGentMindCommandType;

export type Block20Fixture =
  IGentMindFixture;

export type Block20Snapshot =
  IGentMindSnapshot;

export type CreateBlock20Adapter =
  () => Promise<Block20Adapter>;

export type ScenarioArea =
  | "journey"
  | "integration"
  | "navigation"
  | "privacy"
  | "safety"
  | "regression";

export interface ScenarioMatrixItem {
  id: string;
  title: string;
  area: ScenarioArea;
  expected: string[];
}

export type AuditSeverity =
  | "error"
  | "warning";

export interface AuditIssue {
  code: string;
  severity: AuditSeverity;
  message: string;
  path?: string;
  observed?: unknown;
  expected?: unknown;
}
