import {
  PILLAR_03_ID,
  type Pillar03CanonicalSection,
} from "./pillar-03.block28.contracts";

const DOCUMENT_ID =
  "O_Poder_dos_Desacreditados_FINAL_25-06-26" as const;

export const PILLAR_03_CANONICAL_SECTIONS =
  Object.freeze([
    Object.freeze({
      id: "p03_identity",
      pillarId: PILLAR_03_ID,
      kind: "identity",
      title: "Luto",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 154,
        pageEnd: 154,
      }),
    }),
    Object.freeze({
      id: "p03_threshold",
      pillarId: PILLAR_03_ID,
      kind: "threshold",
      title: "Vazio",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 155,
        pageEnd: 155,
      }),
    }),
    Object.freeze({
      id: "p03_manifesto",
      pillarId: PILLAR_03_ID,
      kind: "manifesto",
      title:
        "O que continua doendo depois que tudo já aconteceu",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 156,
        pageEnd: 158,
      }),
    }),
    Object.freeze({
      id: "p03_narrative",
      pillarId: PILLAR_03_ID,
      kind: "narrative",
      title: "O luto que não teve corpo para cair",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 159,
        pageEnd: 161,
      }),
    }),
    Object.freeze({
      id: "p03_consciousness",
      pillarId: PILLAR_03_ID,
      kind: "consciousness",
      title:
        "O que continua faltando mesmo quando a vida seguiu",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: true,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 161,
        pageEnd: 163,
      }),
    }),
    Object.freeze({
      id: "p03_judgment",
      pillarId: PILLAR_03_ID,
      kind: "judgment",
      title: "Quando sentir saudade vira atraso",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: true,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 163,
        pageEnd: 164,
      }),
    }),
    Object.freeze({
      id: "p03_presence",
      pillarId: PILLAR_03_ID,
      kind: "presence",
      title:
        "Ficar com o vazio sem transformá-lo em fuga",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: true,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 165,
        pageEnd: 166,
      }),
    }),
    Object.freeze({
      id: "p03_support_letter",
      pillarId: PILLAR_03_ID,
      kind: "support_letter",
      title: "A quem está cansado de provar",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 166,
        pageEnd: 167,
      }),
    }),
    Object.freeze({
      id: "p03_anchor",
      pillarId: PILLAR_03_ID,
      kind: "anchor",
      title: "O ritual do nome não dito",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 167,
        pageEnd: 167,
      }),
    }),
    Object.freeze({
      id: "p03_closing",
      pillarId: PILLAR_03_ID,
      kind: "closing",
      title:
        "Nem toda perda se fecha. Mas toda perda ignorada cobra.",
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      bodyPolicy:
        "canonical_source_reference_only",
      automaticInviteAfter: false,
      sourceReference: Object.freeze({
        documentId: DOCUMENT_ID,
        pageStart: 167,
        pageEnd: 168,
      }),
    }),
  ] satisfies readonly Pillar03CanonicalSection[]);
