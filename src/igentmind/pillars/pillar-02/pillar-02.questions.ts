// src/igentmind/pillars/pillar-02/pillar-02.questions.ts

import type {
  PillarQuestion,
  PillarQuestionOption,
} from "../template";

import {
  PILLAR_02_CONSCIOUSNESS_QUESTIONS,
} from "./pillar-02.questions-consciousness";

import {
  PILLAR_02_JUDGMENT_QUESTIONS,
} from "./pillar-02.questions-judgment";

import {
  PILLAR_02_PRESENCE_QUESTIONS,
} from "./pillar-02.questions-presence";

export const PILLAR_02_QUESTIONS:
  readonly PillarQuestion[] = [
    ...PILLAR_02_CONSCIOUSNESS_QUESTIONS,
    ...PILLAR_02_JUDGMENT_QUESTIONS,
    ...PILLAR_02_PRESENCE_QUESTIONS,
  ] as const;

export const PILLAR_02_OPTIONS:
  readonly PillarQuestionOption[] =
    PILLAR_02_QUESTIONS.flatMap(
      (question) => question.options,
    );

export const PILLAR_02_QUESTIONS_BY_PHASE = {
  consciousness:
    PILLAR_02_CONSCIOUSNESS_QUESTIONS,

  judgment:
    PILLAR_02_JUDGMENT_QUESTIONS,

  presence:
    PILLAR_02_PRESENCE_QUESTIONS,
} as const;

export const PILLAR_02_QUESTION_INDEX =
  new Map(
    PILLAR_02_QUESTIONS.map(
      (question) => [
        question.id,
        question,
      ],
    ),
  );

export const PILLAR_02_OPTION_INDEX =
  new Map(
    PILLAR_02_OPTIONS.map(
      (option) => [
        option.id,
        option,
      ],
    ),
  );
