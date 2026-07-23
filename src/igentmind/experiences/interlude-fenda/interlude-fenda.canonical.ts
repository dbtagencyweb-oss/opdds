import type { ExperienceCanonicalSection } from "../experience.contracts";

const DOCUMENT_ID =
  "O_Poder_dos_Desacreditados_FINAL_25-06-26" as const;

export const INTERLUDE_FENDA_CANONICAL_SECTIONS =
  Object.freeze([
    Object.freeze({
      id: "ifd_identity",
      kind: "identity",
      title: "Interlúdio",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 135,
        pageEnd: 135,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_threshold",
      kind: "threshold",
      title: "Fenda",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 136,
        pageEnd: 136,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_manifesto",
      kind: "manifesto",
      title: "O preço invisível de querer ficar",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 137,
        pageEnd: 140,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_narrative",
      kind: "narrative",
      title: "Quando a rejeição vira identidade",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 140,
        pageEnd: 143,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_consciousness",
      kind: "consciousness",
      title: "Onde eu me adapto para não ser excluído",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: true,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 144,
        pageEnd: 146,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_judgment",
      kind: "judgment",
      title:
        "Quando querer pertencer vira fraqueza aos próprios olhos",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: true,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 146,
        pageEnd: 148,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_presence",
      kind: "presence",
      title: "Ficar mesmo com o medo de não caber",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: true,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 148,
        pageEnd: 149,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_support_letter",
      kind: "support_letter",
      title: "Ficar mesmo com o medo de não caber",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 150,
        pageEnd: 150,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_anchor",
      kind: "anchor",
      title: "O exercício do espaço próprio",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 151,
        pageEnd: 151,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
    Object.freeze({
      id: "ifd_closing",
      kind: "closing",
      title: "Pertencer não é se reduzir",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 152,
        pageEnd: 152,
      }),
      bodyPolicy: "canonical_source_reference_only",
    }),
  ] satisfies readonly ExperienceCanonicalSection[]);
