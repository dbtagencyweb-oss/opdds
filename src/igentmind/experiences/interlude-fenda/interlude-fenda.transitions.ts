import type { IntermediateExperienceTransition } from "../experience.contracts";

import { INTERLUDE_FENDA_EXIT_TARGET } from "./interlude-fenda.contracts";

export const INTERLUDE_FENDA_TRANSITIONS:
  readonly IntermediateExperienceTransition[] = Object.freeze([
  Object.freeze({
    id: "ifd_transition_01",
    from: "entry",
    to: "book",
    trigger: "experience_entered",
    optional: false,
    blocking: false,
  }),
  Object.freeze({
    id: "ifd_transition_02",
    from: "book",
    to: "consciousness",
    trigger: "automatic_invite",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "ifd_transition_03",
    from: "consciousness",
    to: "judgment",
    trigger: "phase_complete",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "ifd_transition_04",
    from: "judgment",
    to: "presence",
    trigger: "phase_complete",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "ifd_transition_05",
    from: "presence",
    to: "closure",
    trigger: "phase_complete",
    optional: true,
    blocking: false,
  }),
  Object.freeze({
    id: "ifd_transition_06",
    from: "closure",
    to: "exit",
    trigger: "experience_complete",
    optional: true,
    blocking: false,
    target: INTERLUDE_FENDA_EXIT_TARGET,
  }),
  Object.freeze({
    id: "ifd_transition_07",
    from: "pause",
    to: "book",
    trigger: "resume_requested",
    optional: true,
    blocking: false,
  }),
]);
