import {
  buildInterludeFendaPublicationArtifact,
  createInterludeFendaPublicationManifest,
} from "./interlude-fenda.publication";

import {
  getInterludeFendaCounts,
  INTERLUDE_FENDA_PACKAGE,
} from "./interlude-fenda.package";

import { INTERLUDE_FENDA_CLOSURE } from "./interlude-fenda.closure";
import { INTERLUDE_FENDA_TRANSITIONS } from "./interlude-fenda.transitions";
import { validateInterludeFendaBlock27 } from "./interlude-fenda.validation";

export const INTERLUDE_FENDA_BLOCK_27_VALIDATION =
  validateInterludeFendaBlock27();

export const INTERLUDE_FENDA_PUBLICATION_ARTIFACT =
  buildInterludeFendaPublicationArtifact(
    INTERLUDE_FENDA_BLOCK_27_VALIDATION,
  );

export const INTERLUDE_FENDA_BLOCK_27 = Object.freeze({
  package: INTERLUDE_FENDA_PACKAGE,
  closure: INTERLUDE_FENDA_CLOSURE,
  transitions: INTERLUDE_FENDA_TRANSITIONS,
  counts: getInterludeFendaCounts(),
  manifest: createInterludeFendaPublicationManifest(),
  validation: INTERLUDE_FENDA_BLOCK_27_VALIDATION,
  publication: INTERLUDE_FENDA_PUBLICATION_ARTIFACT,
  readiness:
    INTERLUDE_FENDA_PUBLICATION_ARTIFACT.readiness,
});

export function assertInterludeFendaPublicationReady(): void {
  if (!INTERLUDE_FENDA_PUBLICATION_ARTIFACT.readiness) {
    const details =
      INTERLUDE_FENDA_BLOCK_27_VALIDATION.errors
        .map(
          (current) =>
            `${current.code}: ${current.message}`,
        )
        .join("\n");

    throw new Error(
      `O Interlúdio Fenda não está pronto para publicação.\n${details}`,
    );
  }
}
