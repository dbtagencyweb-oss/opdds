import { createPillarPackage } from "../template";

import {
  PILLAR_02_CANONICAL_SECTIONS,
  PILLAR_02_IDENTITY,
} from "./pillar-02.editorial";

import { PILLAR_02_SIGNALS } from "./pillar-02.signals";

import { PILLAR_02_QUESTIONS } from "./pillar-02.questions";

import {
  PILLAR_02_ANCHORS,
} from "./pillar-02.anchors";

import {
  PILLAR_02_JOURNALS,
} from "./pillar-02.journals";

import {
  PILLAR_02_LETTERS,
} from "./pillar-02.letters";

import {
  PILLAR_02_MICRO_RETURNS,
} from "./pillar-02.micro-returns";

import {
  PILLAR_02_PREDICTIVE_RULES_CONNECTED,
} from "./pillar-02.predictive-rules.connected";

import { PILLAR_02_CLOSURE } from "./pillar-02.closure";
import { PILLAR_02_TRANSITIONS } from "./pillar-02.transitions";

export const PILLAR_02_PACKAGE_INPUT = Object.freeze({
  identity: PILLAR_02_IDENTITY,
  canonicalSections: PILLAR_02_CANONICAL_SECTIONS,
  signals: PILLAR_02_SIGNALS,
  questions: PILLAR_02_QUESTIONS,
  microReturns: PILLAR_02_MICRO_RETURNS,
  journals: PILLAR_02_JOURNALS,
  letters: PILLAR_02_LETTERS,
  anchors: PILLAR_02_ANCHORS,
  predictiveRules: PILLAR_02_PREDICTIVE_RULES_CONNECTED,
  transitions: PILLAR_02_TRANSITIONS,
  closure: PILLAR_02_CLOSURE,
});

export const PILLAR_02_PACKAGE = createPillarPackage(
  PILLAR_02_PACKAGE_INPUT,
  {
    mode: "publication",
  },
);

export const PILLAR_02_RESOURCE_INDEXES = Object.freeze({
  canonicalSections: new Map(
    PILLAR_02_CANONICAL_SECTIONS.map((item) => [item.id, item]),
  ),
  signals: new Map(PILLAR_02_SIGNALS.map((item) => [item.id, item])),
  questions: new Map(PILLAR_02_QUESTIONS.map((item) => [item.id, item])),
  microReturns: new Map(
    PILLAR_02_MICRO_RETURNS.map((item) => [item.id, item]),
  ),
  journals: new Map(PILLAR_02_JOURNALS.map((item) => [item.id, item])),
  letters: new Map(PILLAR_02_LETTERS.map((item) => [item.id, item])),
  anchors: new Map(PILLAR_02_ANCHORS.map((item) => [item.id, item])),
  predictiveRules: new Map(
    PILLAR_02_PREDICTIVE_RULES_CONNECTED.map((item) => [item.id, item]),
  ),
  transitions: new Map(
    PILLAR_02_TRANSITIONS.map((item) => [item.id, item]),
  ),
});
