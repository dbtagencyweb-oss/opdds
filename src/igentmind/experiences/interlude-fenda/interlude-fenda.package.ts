import { createIntermediateExperiencePackage } from "../experience.factory";
import type { IntermediateExperienceCounts } from "../experience.contracts";

import { INTERLUDE_FENDA_CANONICAL_SECTIONS } from "./interlude-fenda.canonical";
import { INTERLUDE_FENDA_CLOSURE } from "./interlude-fenda.closure";
import { INTERLUDE_FENDA_IDENTITY } from "./interlude-fenda.identity";
import { INTERLUDE_FENDA_INVITATIONS } from "./interlude-fenda.invitations";
import { INTERLUDE_FENDA_MICRO_RETURNS } from "./interlude-fenda.resources";
import { INTERLUDE_FENDA_PREDICTIVE_RULES } from "./interlude-fenda.rules";
import { INTERLUDE_FENDA_SIGNALS } from "./interlude-fenda.signals";
import { INTERLUDE_FENDA_TRANSITIONS } from "./interlude-fenda.transitions";

export const INTERLUDE_FENDA_PACKAGE_INPUT = Object.freeze({
  identity: INTERLUDE_FENDA_IDENTITY,
  canonicalSections: INTERLUDE_FENDA_CANONICAL_SECTIONS,
  signals: INTERLUDE_FENDA_SIGNALS,
  invitations: INTERLUDE_FENDA_INVITATIONS,
  microReturns: INTERLUDE_FENDA_MICRO_RETURNS,
  predictiveRules: INTERLUDE_FENDA_PREDICTIVE_RULES,
  transitions: INTERLUDE_FENDA_TRANSITIONS,
  closure: INTERLUDE_FENDA_CLOSURE,
  allowedReaderStates: Object.freeze([
    "unmapped",
    "observing",
    "defensive",
    "oscillating",
    "available",
    "integrating",
    "overloaded",
    "paused",
  ] as const),
});

export const INTERLUDE_FENDA_PACKAGE =
  createIntermediateExperiencePackage(
    INTERLUDE_FENDA_PACKAGE_INPUT,
    {
      mode: "publication",
    },
  );

export function getInterludeFendaCounts(): IntermediateExperienceCounts {
  return Object.freeze({
    canonicalSections:
      INTERLUDE_FENDA_CANONICAL_SECTIONS.length,
    signals: INTERLUDE_FENDA_SIGNALS.length,
    invitations: INTERLUDE_FENDA_INVITATIONS.length,
    actionChoices: INTERLUDE_FENDA_INVITATIONS.reduce(
      (total, invitation) => total + invitation.choices.length,
      0,
    ),
    microReturns: INTERLUDE_FENDA_MICRO_RETURNS.length,
    predictiveRules:
      INTERLUDE_FENDA_PREDICTIVE_RULES.length,
    transitions: INTERLUDE_FENDA_TRANSITIONS.length,
    closureRoutes: INTERLUDE_FENDA_CLOSURE.routes.length,
  });
}
