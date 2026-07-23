import type {
  Pillar03Question,
  Pillar03QuestionOption,
} from "./pillar-03.block29.contracts";

import {
  PILLAR_03_CONSCIOUSNESS_QUESTIONS,
} from "./pillar-03.questions.consciousness";

import {
  PILLAR_03_JUDGMENT_QUESTIONS,
} from "./pillar-03.questions.judgment";

import {
  PILLAR_03_PRESENCE_QUESTIONS,
} from "./pillar-03.questions.presence";

export const PILLAR_03_QUESTIONS =
  Object.freeze([
    ...PILLAR_03_CONSCIOUSNESS_QUESTIONS,
    ...PILLAR_03_JUDGMENT_QUESTIONS,
    ...PILLAR_03_PRESENCE_QUESTIONS,
  ] satisfies readonly Pillar03Question[]);

export const PILLAR_03_QUESTION_INDEX:
  ReadonlyMap<string, Pillar03Question> =
  new Map(
    PILLAR_03_QUESTIONS.map(
      (question) => [
        question.id,
        question,
      ],
    ),
  );

export const PILLAR_03_OPTION_INDEX:
  ReadonlyMap<
    string,
    Pillar03QuestionOption
  > = new Map(
    PILLAR_03_QUESTIONS.flatMap(
      (question) =>
        question.options.map(
          (option) => [
            option.id,
            option,
          ] as const,
        ),
    ),
  );

export const PILLAR_03_OPEN_ANSWER_INDEX:
  ReadonlyMap<
    string,
    Pillar03Question["openAnswer"]
  > = new Map(
    PILLAR_03_QUESTIONS.map(
      (question) => [
        question.openAnswer.id,
        question.openAnswer,
      ],
    ),
  );
