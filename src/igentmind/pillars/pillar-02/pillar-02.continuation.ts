import {
  INTERLUDE_FENDA_ID,
  PILLAR_03_ID,
  type ExperienceTarget,
} from "./pillar-02.block26.contracts";

export const PILLAR_02_IMMEDIATE_CONTINUATION = Object.freeze({
  kind: "interlude",
  experienceId: INTERLUDE_FENDA_ID,
  nextPillarId: PILLAR_03_ID,
} satisfies ExperienceTarget);

export const INTERLUDE_FENDA_EXIT = Object.freeze({
  kind: "pillar",
  pillarId: PILLAR_03_ID,
} satisfies ExperienceTarget);

export function resolvePillar02ImmediateContinuation(): ExperienceTarget {
  return PILLAR_02_IMMEDIATE_CONTINUATION;
}

export function resolveInterludeFendaExit(): ExperienceTarget {
  return INTERLUDE_FENDA_EXIT;
}

export function canBypassInterludeFendaFromPillar02(
  target: ExperienceTarget,
): boolean {
  return target.kind === "pillar";
}
