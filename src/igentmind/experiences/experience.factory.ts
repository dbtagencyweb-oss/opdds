import type {
  IntermediateExperienceDefinition,
  IntermediateExperienceIndexes,
  IntermediateExperiencePackage,
} from "./experience.contracts";

function assertUniqueIds(
  collectionName: string,
  items: readonly { readonly id: string }[],
): void {
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(
        `ID duplicado em ${collectionName}: ${item.id}.`,
      );
    }

    ids.add(item.id);
  }
}

function createIndex<T extends { readonly id: string }>(
  items: readonly T[],
): ReadonlyMap<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function createIntermediateExperiencePackage<
  ExperienceId extends string,
>(
  definition: IntermediateExperienceDefinition<ExperienceId>,
  options: {
    readonly mode: "publication";
  },
): IntermediateExperiencePackage<ExperienceId> {
  assertUniqueIds(
    "canonicalSections",
    definition.canonicalSections,
  );
  assertUniqueIds("signals", definition.signals);
  assertUniqueIds("invitations", definition.invitations);
  assertUniqueIds("microReturns", definition.microReturns);
  assertUniqueIds(
    "predictiveRules",
    definition.predictiveRules,
  );
  assertUniqueIds("transitions", definition.transitions);
  assertUniqueIds("closure.routes", definition.closure.routes);

  const indexes: IntermediateExperienceIndexes =
    Object.freeze({
      canonicalSections: createIndex(
        definition.canonicalSections,
      ),
      signals: createIndex(definition.signals),
      invitations: createIndex(definition.invitations),
      microReturns: createIndex(definition.microReturns),
      predictiveRules: createIndex(
        definition.predictiveRules,
      ),
      transitions: createIndex(definition.transitions),
    });

  return Object.freeze({
    ...definition,
    indexes,
    mode: options.mode,
  });
}
