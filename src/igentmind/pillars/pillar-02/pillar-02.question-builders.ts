// src/igentmind/pillars/pillar-02/pillar-02.question-builders.ts

import {
  createOptionId,
  type EditorialContent,
  type PillarQuestion,
  type PillarQuestionOption,
  type ResponseVariants,
  type ScaleEffect,
  type SignalBinding,
} from "../template";

export interface Pillar02ResponseCopy {
  minimal: string;
  standard: string;
  deep: string;
}

export interface CreatePillar02OptionInput {
  questionId: string;
  order: number;
  label: string;

  signalIds: readonly string[];
  scaleEffects: readonly ScaleEffect[];

  responses: Pillar02ResponseCopy;
}

export interface CreatePillar02QuestionInput {
  id: string;
  phase: PillarQuestion["phase"];
  order: PillarQuestion["order"];

  prompt: EditorialContent;

  options: readonly PillarQuestionOption[];

  openResponse: Pillar02ResponseCopy;
}

export function pillar02BookExact(
  id: string,
  text: string,
): EditorialContent {
  return {
    id,
    text,
    editorialOrigin: "book_exact",
    generationMode: "fixed",
  };
}

export function pillar02Companion(
  id: string,
  text: string,
): EditorialContent {
  return {
    id,
    text,
    editorialOrigin: "igent_companion",
    generationMode: "fixed",
  };
}

export function createPillar02ResponseVariants(
  idPrefix: string,
  copy: Pillar02ResponseCopy,
): ResponseVariants {
  return {
    minimal: pillar02Companion(
      `${idPrefix}_minimal`,
      copy.minimal,
    ),

    standard: pillar02Companion(
      `${idPrefix}_standard`,
      copy.standard,
    ),

    deep: pillar02Companion(
      `${idPrefix}_deep`,
      copy.deep,
    ),
  };
}

function createSignalBindings(
  signalIds: readonly string[],
): readonly SignalBinding[] {
  return signalIds.map(
    (signalId, index): SignalBinding => ({
      signalId,

      confidence:
        index === 0
          ? 0.3
          : index === 1
            ? 0.2
            : 0.15,

      role:
        index === 0
          ? "primary"
          : "secondary",
    }),
  );
}

export function createPillar02Option(
  input: CreatePillar02OptionInput,
): PillarQuestionOption {
  const optionId = createOptionId(
    input.questionId,
    input.order,
  );

  return {
    id: optionId,

    label: pillar02Companion(
      `${optionId}_label`,
      input.label,
    ),

    signals: createSignalBindings(
      input.signalIds,
    ),

    scaleEffects: [
      ...input.scaleEffects,
    ],

    responses:
      createPillar02ResponseVariants(
        `${optionId}_response`,
        input.responses,
      ),
  };
}

export function createPillar02Question(
  input: CreatePillar02QuestionInput,
): PillarQuestion {
  return {
    id: input.id,
    phase: input.phase,
    order: input.order,
    prompt: input.prompt,

    options: [
      ...input.options,
    ],

    allowOpenAnswer: true,

    openResponse:
      createPillar02ResponseVariants(
        `${input.id}_open_response`,
        input.openResponse,
      ),
  };
}
