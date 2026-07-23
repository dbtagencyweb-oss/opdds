// src/igentmind/pillars/pillar-02/pillar-02.predictive-rules.connected.ts

import {
  createResourceId,
  type PillarPredictiveRule,
} from "../template";

import {
  PILLAR_02_PREDICTIVE_RULES,
} from "./pillar-02.predictive-rules";

const CONSCIOUSNESS_PROTECTION_MICRO_RETURN =
  createResourceId(
    2,
    "micro_return",
    "consciousness",
    3,
  );

const PRESENCE_BOUNDARY_ANCHOR =
  createResourceId(
    2,
    "anchor",
    "presence",
    1,
  );

const PRESENCE_BOUNDARY_JOURNAL =
  createResourceId(
    2,
    "journal",
    "presence",
    1,
  );

export const PILLAR_02_PREDICTIVE_RULES_CONNECTED:
  readonly PillarPredictiveRule[] =
    PILLAR_02_PREDICTIVE_RULES.map(
      (rule): PillarPredictiveRule => {
        switch (rule.id) {
          case "p02_rule_consciousness_02":
            return {
              ...rule,

              effect: {
                ...rule.effect,

                resourceId:
                  CONSCIOUSNESS_PROTECTION_MICRO_RETURN,
              },
            };

          case "p02_rule_presence_01":
            return {
              ...rule,

              effect: {
                ...rule.effect,

                resourceId:
                  PRESENCE_BOUNDARY_ANCHOR,
              },
            };

          case "p02_rule_presence_02":
            return {
              ...rule,

              effect: {
                ...rule.effect,

                resourceId:
                  PRESENCE_BOUNDARY_JOURNAL,
              },
            };

          default:
            return {
              ...rule,
              effect: {
                ...rule.effect,
              },
            };
        }
      },
    );

export const PILLAR_02_CONNECTED_RULE_INDEX =
  new Map(
    PILLAR_02_PREDICTIVE_RULES_CONNECTED
      .map(
        (rule) => [
          rule.id,
          rule,
        ],
      ),
  );
