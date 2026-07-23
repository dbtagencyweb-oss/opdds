// src/igentmind/pillars/pillar-02/pillar-02.resource-builders.ts

import type {
  ReflectionPhase,
} from "../../core";

import {
  createResourceId,
  type EditorialContent,
  type MicroReturnFunction,
  type PillarAnchor,
  type PillarAnchorStep,
  type PillarJournal,
  type PillarLetter,
  type PillarMicroReturn,
} from "../template";

export function pillar02ResourceCopy(
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

export interface CreatePillar02MicroReturnInput {
  phase: ReflectionPhase;
  order: number;
  function: MicroReturnFunction;
  triggerSignalIds: readonly string[];
  text: string;
}

export function createPillar02MicroReturn(
  input: CreatePillar02MicroReturnInput,
): PillarMicroReturn {
  const id = createResourceId(
    2,
    "micro_return",
    input.phase,
    input.order,
  );

  return {
    id,
    phase: input.phase,
    order: input.order,
    function: input.function,
    triggerSignalIds: [
      ...input.triggerSignalIds,
    ],

    copy: pillar02ResourceCopy(
      `${id}_copy`,
      input.text,
    ),
  };
}

export interface CreatePillar02JournalInput {
  phase: ReflectionPhase;
  order: 1 | 2;
  title: string;
  prompt: string;
}

export function createPillar02Journal(
  input: CreatePillar02JournalInput,
): PillarJournal {
  const id = createResourceId(
    2,
    "journal",
    input.phase,
    input.order,
  );

  return {
    id,
    phase: input.phase,
    order: input.order,

    title: pillar02ResourceCopy(
      `${id}_title`,
      input.title,
    ),

    prompt: pillar02ResourceCopy(
      `${id}_prompt`,
      input.prompt,
    ),

    visibility: "private",
    exportAllowed: false,
    telemetryContentAllowed: false,
  };
}

export interface CreatePillar02LetterInput {
  phase: ReflectionPhase;
  title: string;
  prompt: string;
}

export function createPillar02Letter(
  input: CreatePillar02LetterInput,
): PillarLetter {
  const id = createResourceId(
    2,
    "letter",
    input.phase,
    1,
  );

  return {
    id,
    phase: input.phase,
    order: 1,

    title: pillar02ResourceCopy(
      `${id}_title`,
      input.title,
    ),

    prompt: pillar02ResourceCopy(
      `${id}_prompt`,
      input.prompt,
    ),

    visibility: "private",
    sendAllowed: false,
    telemetryContentAllowed: false,
  };
}

export interface CreatePillar02AnchorInput {
  phase: ReflectionPhase;
  title: string;
  introduction: string;
  steps: readonly string[];
}

export function createPillar02Anchor(
  input: CreatePillar02AnchorInput,
): PillarAnchor {
  const id = createResourceId(
    2,
    "anchor",
    input.phase,
    1,
  );

  const steps: PillarAnchorStep[] =
    input.steps.map(
      (text, index) => ({
        id:
          `${id}_step_${String(
            index + 1,
          ).padStart(2, "0")}`,

        order: index + 1,

        copy: pillar02ResourceCopy(
          `${id}_step_${String(
            index + 1,
          ).padStart(2, "0")}_copy`,
          text,
        ),
      }),
    );

  return {
    id,
    phase: input.phase,
    order: 1,

    title: pillar02ResourceCopy(
      `${id}_title`,
      input.title,
    ),

    introduction:
      pillar02ResourceCopy(
        `${id}_introduction`,
        input.introduction,
      ),

    steps,

    interruptionAllowed: true,
    completionRequired: false,
    replacesCanonicalAnchor: false,
  };
}
