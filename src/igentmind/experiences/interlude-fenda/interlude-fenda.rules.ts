import type { ExperiencePredictiveRule } from "../experience.contracts";

export const INTERLUDE_FENDA_PREDICTIVE_RULES:
  readonly ExperiencePredictiveRule[] =
  Object.freeze([
    Object.freeze({
      id: "ifd_rule_global_overload_01",
      phase: "global",
      priority: "overload",
      minimumOccurrences: 1,
      when: [
        "reader.load >= 3",
        "reader.presence <= 1",
      ],
      action: "offer_pause",
      avoid: [
        "new_question",
        "interpretive_confrontation",
        "memory_recall",
      ],
    }),
    Object.freeze({
      id: "ifd_rule_global_explicit_continue_01",
      phase: "global",
      priority: "explicit_choice",
      minimumOccurrences: 1,
      when: ["reader.explicitChoice === 'continue'"],
      action: "return_to_book",
      avoid: [
        "forced_reflection",
        "additional_question",
      ],
    }),
    Object.freeze({
      id: "ifd_rule_consciousness_adaptation_01",
      phase: "consciousness",
      priority: "signal",
      minimumOccurrences: 2,
      when: [
        "signal.ifd_automatic_adaptation >= 2",
        "reader.load <= 2",
      ],
      action: "offer_micro_return",
      resourceId: "ifd_micro_consciousness_02",
      avoid: [
        "origin_claim",
        "third_party_classification",
      ],
    }),
    Object.freeze({
      id: "ifd_rule_judgment_shame_01",
      phase: "judgment",
      priority: "state",
      minimumOccurrences: 2,
      when: [
        "signal.ifd_belonging_shame >= 2",
        "reader.judgment >= 3",
      ],
      action: "mirror_only",
      resourceId: "ifd_micro_judgment_01",
      avoid: [
        "moral_correction",
        "challenge",
        "diagnostic_language",
      ],
    }),
    Object.freeze({
      id: "ifd_rule_presence_anchor_01",
      phase: "presence",
      priority: "progression",
      minimumOccurrences: 1,
      when: [
        "reader.presence >= 2",
        "reader.readiness >= 2",
        "reader.load <= 2",
      ],
      action: "offer_canonical_anchor",
      resourceId: "ifd_anchor",
      avoid: [
        "replace_canonical_anchor",
        "forced_action",
      ],
    }),
    Object.freeze({
      id: "ifd_rule_closure_continue_01",
      phase: "global",
      priority: "progression",
      minimumOccurrences: 1,
      when: [
        "experience.closureComplete === true",
        "reader.explicitChoice === 'continue_to_pillar_03'",
      ],
      action: "continue_to_next_pillar",
      avoid: [
        "skip_interlude_automatically",
        "mark_emotional_resolution",
      ],
    }),
  ]);
