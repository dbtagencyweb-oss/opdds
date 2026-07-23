import type { ReaderState } from "../../core";

import {
  PILLAR_03_ID,
  type Pillar03PredictiveRuleDraft,
} from "./pillar-03.block28.contracts";

function readerStates(...states: ReaderState[]): readonly ReaderState[] {
  return Object.freeze(states);
}

const ALL_ACTIVE_READER_STATES = readerStates(
  "observing",
  "defensive",
  "oscillating",
  "available",
  "integrating",
);

export const PILLAR_03_PREDICTIVE_RULES:
  readonly Pillar03PredictiveRuleDraft[] =
  Object.freeze([
    Object.freeze({
      id: "p03_rule_consciousness_01",
      pillarId: PILLAR_03_ID,
      phase: "consciousness",
      family: "deepening",
      priority: "depth",
      minimumOccurrences: 2,
      allowedReaderStates: readerStates(
        "observing",
        "oscillating",
        "available",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_absence_still_active",
          operator: "repeated_gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "lte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "readiness",
          operator: "gte",
          value: 1,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "question",
        depth: "standard",
      }),
      avoid: Object.freeze([
        "assume_loss_type",
        "assume_person_involved",
        "ask_for_complete_history",
        "claim_origin",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_consciousness_02",
      pillarId: PILLAR_03_ID,
      phase: "consciousness",
      family: "protection",
      priority: "overload",
      minimumOccurrences: 1,
      allowedReaderStates: ALL_ACTIVE_READER_STATES,
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_functional_suspension",
          operator: "gte",
          value: 1,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "gte",
          value: 3,
        }),
        Object.freeze({
          source: "scale",
          key: "presence",
          operator: "lte",
          value: 1,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "pause",
        depth: "minimal",
      }),
      avoid: Object.freeze([
        "new_deep_question",
        "memory_recall",
        "interpretive_confrontation",
        "request_detailed_loss_description",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_consciousness_03",
      pillarId: PILLAR_03_ID,
      phase: "consciousness",
      family: "integration",
      priority: "progression",
      minimumOccurrences: 2,
      allowedReaderStates: readerStates(
        "oscillating",
        "available",
        "integrating",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_unritualized_loss",
          operator: "repeated_gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "lte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "readiness",
          operator: "gte",
          value: 2,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "journal",
        depth: "standard",
        resourceIntent: Object.freeze({
          resourceType: "journal",
          phase: "consciousness",
          slot: 1,
          bindingStatus: "pending_block_30",
        }),
      }),
      avoid: Object.freeze([
        "force_ritual",
        "require_explanation",
        "create_memory_automatically",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_judgment_01",
      pillarId: PILLAR_03_ID,
      phase: "judgment",
      family: "deepening",
      priority: "signal",
      minimumOccurrences: 2,
      allowedReaderStates: readerStates(
        "observing",
        "oscillating",
        "available",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_grief_timeline_pressure",
          operator: "repeated_gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "judgment",
          operator: "gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "lte",
          value: 2,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "question",
        depth: "standard",
      }),
      avoid: Object.freeze([
        "define_correct_grief_time",
        "compare_reader_to_others",
        "promise_resolution",
        "tell_reader_to_move_on",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_judgment_02",
      pillarId: PILLAR_03_ID,
      phase: "judgment",
      family: "protection",
      priority: "state",
      minimumOccurrences: 2,
      allowedReaderStates: readerStates(
        "defensive",
        "oscillating",
        "overloaded",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_longing_shame",
          operator: "repeated_gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "judgment",
          operator: "gte",
          value: 3,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "micro_return",
        depth: "minimal",
        resourceIntent: Object.freeze({
          resourceType: "micro_return",
          phase: "judgment",
          slot: 1,
          bindingStatus: "pending_block_30",
        }),
      }),
      avoid: Object.freeze([
        "challenge_grief",
        "moral_correction",
        "positive_reframe",
        "additional_question",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_judgment_03",
      pillarId: PILLAR_03_ID,
      phase: "judgment",
      family: "integration",
      priority: "progression",
      minimumOccurrences: 2,
      allowedReaderStates: readerStates(
        "oscillating",
        "available",
        "integrating",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_strength_obligation",
          operator: "repeated_gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "readiness",
          operator: "gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "lte",
          value: 2,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "letter",
        depth: "standard",
        resourceIntent: Object.freeze({
          resourceType: "letter",
          phase: "judgment",
          slot: 1,
          bindingStatus: "pending_block_30",
        }),
      }),
      avoid: Object.freeze([
        "send_letter",
        "analyze_letter_without_permission",
        "create_memory_automatically",
        "require_recipient",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_presence_01",
      pillarId: PILLAR_03_ID,
      phase: "presence",
      family: "deepening",
      priority: "depth",
      minimumOccurrences: 2,
      allowedReaderStates: readerStates(
        "available",
        "integrating",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_allowing_absence",
          operator: "repeated_gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "presence",
          operator: "gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "lte",
          value: 2,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "anchor",
        depth: "standard",
        resourceIntent: Object.freeze({
          resourceType: "anchor",
          phase: "presence",
          slot: 1,
          bindingStatus: "pending_block_30",
        }),
      }),
      avoid: Object.freeze([
        "replace_canonical_anchor",
        "force_completion",
        "interpret_pause_as_failure",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_presence_02",
      pillarId: PILLAR_03_ID,
      phase: "presence",
      family: "protection",
      priority: "pause",
      minimumOccurrences: 1,
      allowedReaderStates: readerStates(
        "defensive",
        "oscillating",
        "overloaded",
        "paused",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_non_replacement_capacity",
          operator: "gte",
          value: 1,
        }),
        Object.freeze({
          source: "scale",
          key: "load",
          operator: "gte",
          value: 3,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "pause",
        depth: "minimal",
      }),
      avoid: Object.freeze([
        "treat_openness_as_readiness",
        "offer_multiple_resources",
        "require_continuation",
        "generate_synthesis",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),

    Object.freeze({
      id: "p03_rule_presence_03",
      pillarId: PILLAR_03_ID,
      phase: "presence",
      family: "integration",
      priority: "memory",
      minimumOccurrences: 3,
      allowedReaderStates: readerStates(
        "available",
        "integrating",
      ),
      conditions: Object.freeze([
        Object.freeze({
          source: "signal",
          key: "p03_integration_without_erasure",
          operator: "repeated_gte",
          value: 3,
        }),
        Object.freeze({
          source: "scale",
          key: "presence",
          operator: "gte",
          value: 2,
        }),
        Object.freeze({
          source: "scale",
          key: "agency",
          operator: "gte",
          value: 2,
        }),
      ]),
      recommendedMove: Object.freeze({
        type: "closure",
        depth: "standard",
        memoryCandidatePolicy:
          "explicit_confirmation_only",
      }),
      avoid: Object.freeze([
        "claim_grief_resolved",
        "automatic_memory_save",
        "require_synthesis",
        "force_next_pillar",
      ]),
      delegatesSafetyToCore: true,
      readerChoicePreserved: true,
      blocksReading: false,
    }),
  ]);

export const PILLAR_03_PREDICTIVE_RULE_INDEX:
  ReadonlyMap<string, Pillar03PredictiveRuleDraft> =
  new Map(
    PILLAR_03_PREDICTIVE_RULES.map((rule) => [
      rule.id,
      rule,
    ]),
  );
