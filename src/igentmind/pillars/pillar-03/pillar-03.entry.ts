import {
  INTERLUDE_FENDA_ID,
  PILLAR_03_ID,
  type Pillar03EntryDefinition,
} from "./pillar-03.block28.contracts";

import { INTERLUDE_FENDA_EXIT_TARGET } from "../../experiences/interlude-fenda";

export const PILLAR_03_ENTRY = Object.freeze({
  source: Object.freeze({
    kind: "interlude",
    experienceId: INTERLUDE_FENDA_ID,
  }),
  target: Object.freeze({
    kind: "pillar",
    pillarId: PILLAR_03_ID,
  }),
  automatic: false,
  explicitChoicePreserved: true,
  blocksReading: false,
} satisfies Pillar03EntryDefinition);

export function validatePillar03EntryCompatibility(): boolean {
  return (
    INTERLUDE_FENDA_EXIT_TARGET.kind === "pillar" &&
    INTERLUDE_FENDA_EXIT_TARGET.pillarId ===
      PILLAR_03_ENTRY.target.pillarId
  );
}
