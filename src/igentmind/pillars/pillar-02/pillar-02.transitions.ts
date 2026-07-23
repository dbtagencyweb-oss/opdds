import type { Pillar02Transition } from "./pillar-02.block26.contracts";
import { PILLAR_02_IMMEDIATE_CONTINUATION } from "./pillar-02.continuation";

export const PILLAR_02_TRANSITIONS:
  readonly Pillar02Transition[] = Object.freeze([
  Object.freeze({
    id: "p02_transition_01",
    from: "book",
    to: "consciousness",
    trigger: "automatic_invite",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "p02_transition_02",
    from: "consciousness",
    to: "judgment",
    trigger: "phase_complete",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "p02_transition_03",
    from: "judgment",
    to: "presence",
    trigger: "phase_complete",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "p02_transition_04",
    from: "presence",
    to: "closure",
    trigger: "phase_complete",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "p02_transition_05",
    from: "closure",
    to: "interlude",
    trigger: "pillar_complete",
    optional: true,
    blocking: false,
    target: PILLAR_02_IMMEDIATE_CONTINUATION,
  }),
  Object.freeze({
    id: "p02_transition_06",
    from: "pause",
    to: "book",
    trigger: "resume_requested",
    optional: true,
    blocking: false,
  }),
]);
