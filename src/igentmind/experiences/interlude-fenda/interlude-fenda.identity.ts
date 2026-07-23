import type { IntermediateExperienceIdentity } from "../experience.contracts";

import {
  INTERLUDE_FENDA_ID,
  INTERLUDE_FENDA_NEXT_PILLAR_ID,
  INTERLUDE_FENDA_PREVIOUS_PILLAR_ID,
  type InterludeFendaId,
} from "./interlude-fenda.contracts";

export const INTERLUDE_FENDA_IDENTITY = Object.freeze({
  id: INTERLUDE_FENDA_ID,
  kind: "interlude",
  title: "Interlúdio",
  internalTitle: "Fenda",
  previousPillarId: INTERLUDE_FENDA_PREVIOUS_PILLAR_ID,
  nextPillarId: INTERLUDE_FENDA_NEXT_PILLAR_ID,
  compact: true,
  countsAsPillar: false,
  blocksReading: false,
  skippableByExplicitChoice: true,
} satisfies IntermediateExperienceIdentity<InterludeFendaId>);
