import type {
  EditorialOrigin,
  GenerationMode,
  InterventionType,
  NextMove,
  PillarId,
  ReaderState,
  ReflectionPhase,
  ResponseDepth,
  ScaleDelta,
  ScaleName,
} from "../../core";

export interface EditorialContent {
  id: string;
  text: string;
  editorialOrigin: EditorialOrigin;
  generationMode: GenerationMode;
}

export type PillarAct =
  | "survival"
  | "reconstruction"
  | "continuity";

export interface PillarIdentity {
  id: PillarId;
  ordinal: number;
  slug: string;
  act: PillarAct;
  title: EditorialContent;
  subtitle: EditorialContent;
  openingQuote: EditorialContent;
  nextPillarId: PillarId;
}

export type PillarCanonicalSectionKind =
  | "identity"
  | "threshold"
  | "manifesto"
  | "narrative"
  | "consciousness"
  | "judgment"
  | "presence"
  | "support_letter"
  | "anchor"
  | "closing";

export type AutomaticInvitePolicy =
  | "none"
  | "after_section";

export interface PillarCanonicalSection {
  id: string;
  kind: PillarCanonicalSectionKind;
  title: EditorialContent;
  contentReferenceId: string;
  automaticInvite: AutomaticInvitePolicy;
  editorialOrigin: EditorialOrigin;
  generationMode: GenerationMode;
}

export interface PillarSignalDefinition {
  id: string;
  label: string;
  description: string;
  phase: ReflectionPhase;
  defaultConfidence: number;
}

export type PredictiveResponseDepth =
  | ResponseDepth
  | "adaptive";

export type PredictiveNextMoveKind =
  NextMove["kind"];

export interface PillarPredictiveRuleCondition {
  allSignalIds?: readonly string[];
  anySignalIds?: readonly string[];
  readerStates?: readonly ReaderState[];
  minReadiness?: number;
  maxLoad?: number;
  minLoad?: number;
}

export interface PillarPredictiveRuleEffect {
  intervention: InterventionType;
  responseDepth: PredictiveResponseDepth;
  nextMove: PredictiveNextMoveKind;
  resourceId?: string;
}

export interface PillarPredictiveRule {
  id: string;
  phase: ReflectionPhase;
  priority: 1 | 2 | 3;
  condition: PillarPredictiveRuleCondition;
  effect: PillarPredictiveRuleEffect;
}

export type MicroReturnFunction =
  | "recognition"
  | "contradiction"
  | "protection"
  | "cost"
  | "permission"
  | "presence";

export type PillarResourceKind =
  | "micro_return"
  | "journal"
  | "letter"
  | "anchor";

export interface PillarMicroReturn {
  id: string;
  phase: ReflectionPhase;
  order: number;
  function: MicroReturnFunction;
  triggerSignalIds: readonly string[];
  copy: EditorialContent;
}

export interface PillarJournal {
  id: string;
  phase: ReflectionPhase;
  order: 1 | 2;
  title: EditorialContent;
  prompt: EditorialContent;
  visibility: "private";
  exportAllowed: false;
  telemetryContentAllowed: false;
}

export interface PillarLetter {
  id: string;
  phase: ReflectionPhase;
  order: 1;
  title: EditorialContent;
  prompt: EditorialContent;
  visibility: "private";
  sendAllowed: false;
  telemetryContentAllowed: false;
}

export interface PillarAnchorStep {
  id: string;
  order: number;
  copy: EditorialContent;
}

export interface PillarAnchor {
  id: string;
  phase: ReflectionPhase;
  order: 1;
  title: EditorialContent;
  introduction: EditorialContent;
  steps: readonly PillarAnchorStep[];
  interruptionAllowed: true;
  completionRequired: false;
  replacesCanonicalAnchor: false;
}

export interface ResponseVariants {
  minimal: EditorialContent;
  standard: EditorialContent;
  deep: EditorialContent;
}

export interface SignalBinding {
  signalId: string;
  confidence: number;
  role: "primary" | "secondary";
}

export interface ScaleEffect {
  scale: ScaleName;
  delta: ScaleDelta;
}

export interface PillarQuestionOption {
  id: string;
  label: EditorialContent;
  signals: readonly SignalBinding[];
  scaleEffects: readonly ScaleEffect[];
  responses: ResponseVariants;
}

export interface PillarQuestion {
  id: string;
  phase: ReflectionPhase;
  order: 1 | 2 | 3;
  prompt: EditorialContent;
  options: readonly PillarQuestionOption[];
  allowOpenAnswer: true;
  openResponse: ResponseVariants;
}

export function createQuestionId(
  pillarOrdinal: number,
  phase: ReflectionPhase,
  order: 1 | 2 | 3,
): string {
  return `p${String(pillarOrdinal).padStart(2, "0")}_${phase}_q${String(order).padStart(2, "0")}`;
}

export function createOptionId(
  questionId: string,
  order: number,
): string {
  return `${questionId}_opt_${String(order).padStart(2, "0")}`;
}

export function createResourceId(
  pillarOrdinal: number,
  kind: PillarResourceKind,
  phase: ReflectionPhase,
  order: number,
): string {
  const segment =
    kind === "micro_return"
      ? "micro"
      : kind;

  return `p${String(pillarOrdinal).padStart(2, "0")}_${segment}_${phase}_${String(order).padStart(2, "0")}`;
}

export function createPredictiveRuleId(
  pillarOrdinal: number,
  phase: ReflectionPhase,
  order: 1 | 2 | 3,
): string {
  return `p${String(pillarOrdinal).padStart(2, "0")}_rule_${phase}_${String(order).padStart(2, "0")}`;
}

export interface MicroReturnSelectableSource {
  source: {
    microReturns: readonly PillarMicroReturn[];
  };
}

export interface SelectMicroReturnInput {
  phase: ReflectionPhase;
  signalIds: readonly string[];
  preferredFunction?: MicroReturnFunction;
  recentlyUsedIds?: readonly string[];
}

export function selectMicroReturn(
  pillar: MicroReturnSelectableSource,
  input: SelectMicroReturnInput,
): PillarMicroReturn | null {
  const recentlyUsedIds =
    new Set(input.recentlyUsedIds ?? []);

  const phaseItems =
    pillar.source.microReturns.filter(
      (item) => item.phase === input.phase,
    );

  const matchingSignals =
    phaseItems.filter((item) =>
      item.triggerSignalIds.some((signalId) =>
        input.signalIds.includes(signalId),
      ),
    );

  const matchingFunction =
    matchingSignals.filter(
      (item) =>
        input.preferredFunction === undefined ||
        item.function === input.preferredFunction,
    );

  const candidates =
    matchingFunction.length > 0
      ? matchingFunction
      : matchingSignals.length > 0
        ? matchingSignals
        : phaseItems;

  return (
    candidates.find(
      (item) => !recentlyUsedIds.has(item.id),
    ) ??
    candidates[0] ??
    null
  );
}

export interface PillarPackageOptions {
  mode: "publication";
}

export function createPillarPackage<
  TInput extends Record<string, unknown>,
>(
  input: TInput,
  options: PillarPackageOptions,
): Readonly<{
  mode: PillarPackageOptions["mode"];
  source: TInput;
}> {
  return Object.freeze({
    mode: options.mode,
    source: input,
  });
}
