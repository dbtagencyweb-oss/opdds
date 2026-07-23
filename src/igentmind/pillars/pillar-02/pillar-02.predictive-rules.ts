// src/igentmind/pillars/pillar-02/pillar-02.predictive-rules.ts

import {
  createPredictiveRuleId,
  type PillarPredictiveRule,
} from "../template";

export const PILLAR_02_PREDICTIVE_RULES:
  readonly PillarPredictiveRule[] = [
    /*
     * CONSCIÊNCIA
     */

    {
      id: createPredictiveRuleId(
        2,
        "consciousness",
        1,
      ),

      phase: "consciousness",
      priority: 1,

      condition: {
        anySignalIds: [
          "p02_learned_role",
        ],

        readerStates: [
          "observing",
          "available",
          "integrating",
        ],

        maxLoad: 2,
      },

      effect: {
        intervention: "mirror",
        responseDepth: "adaptive",
        nextMove: "continue_reading",
      },
    },

    {
      id: createPredictiveRuleId(
        2,
        "consciousness",
        2,
      ),

      phase: "consciousness",
      priority: 2,

      condition: {
        anySignalIds: [
          "p02_environment_vigilance",
        ],

        readerStates: [
          "defensive",
          "oscillating",
        ],
      },

      effect: {
        intervention: "micro_return",
        responseDepth: "minimal",
        nextMove: "continue_reading",
      },
    },

    {
      id: createPredictiveRuleId(
        2,
        "consciousness",
        3,
      ),

      phase: "consciousness",
      priority: 3,

      condition: {
        anySignalIds: [
          "p02_inherited_silence",
        ],

        minReadiness: 2,
        maxLoad: 2,
      },

      effect: {
        intervention: "question",
        responseDepth: "standard",
        nextMove: "ask_question",
      },
    },

    /*
     * JULGAMENTO
     */

    {
      id: createPredictiveRuleId(
        2,
        "judgment",
        1,
      ),

      phase: "judgment",
      priority: 1,

      condition: {
        anySignalIds: [
          "p02_family_guilt",
        ],

        minLoad: 3,
      },

      effect: {
        intervention: "displacement",
        responseDepth: "minimal",
        nextMove: "pause",
      },
    },

    {
      id: createPredictiveRuleId(
        2,
        "judgment",
        2,
      ),

      phase: "judgment",
      priority: 2,

      condition: {
        anySignalIds: [
          "p02_emotional_debt",
        ],

        readerStates: [
          "observing",
          "oscillating",
          "available",
        ],

        maxLoad: 3,
      },

      effect: {
        intervention: "mirror",
        responseDepth: "adaptive",
        nextMove: "continue_reading",
      },
    },

    {
      id: createPredictiveRuleId(
        2,
        "judgment",
        3,
      ),

      phase: "judgment",
      priority: 3,

      condition: {
        anySignalIds: [
          "p02_disloyalty_fear",
        ],

        minReadiness: 2,
        maxLoad: 2,
      },

      effect: {
        intervention: "question",
        responseDepth: "standard",
        nextMove: "ask_question",
      },
    },

    /*
     * PRESENÇA
     */

    {
      id: createPredictiveRuleId(
        2,
        "presence",
        1,
      ),

      phase: "presence",
      priority: 1,

      condition: {
        anySignalIds: [
          "p02_boundary_presence",
        ],

        readerStates: [
          "defensive",
          "oscillating",
        ],
      },

      effect: {
        intervention: "anchor",
        responseDepth: "minimal",
        nextMove: "open_anchor",
      },
    },

    {
      id: createPredictiveRuleId(
        2,
        "presence",
        2,
      ),

      phase: "presence",
      priority: 2,

      condition: {
        anySignalIds: [
          "p02_non_erasing_belonging",
        ],

        readerStates: [
          "available",
          "integrating",
        ],

        minReadiness: 2,
        maxLoad: 2,
      },

      effect: {
        intervention: "journal",
        responseDepth: "adaptive",
        nextMove: "open_journal",
      },
    },

    {
      id: createPredictiveRuleId(
        2,
        "presence",
        3,
      ),

      phase: "presence",
      priority: 3,

      condition: {
        anySignalIds: [
          "p02_ambivalence_capacity",
        ],

        readerStates: [
          "available",
          "integrating",
        ],

        minReadiness: 3,
        maxLoad: 2,
      },

      effect: {
        intervention: "connection",
        responseDepth: "deep",
        nextMove: "continue_reading",
      },
    },
  ] as const;
