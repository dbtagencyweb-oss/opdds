// src/igentmind/pillars/pillar-02/pillar-02.editorial.ts

import {
  PILLAR_IDS,
} from "../../core";

import type {
  EditorialContent,
  PillarCanonicalSection,
  PillarIdentity,
} from "../template";

import type {
  Pillar02EditorialDossier,
} from "./pillar-02.contracts";

import {
  PILLAR_02_EXPERIENCE_IDS,
} from "./pillar-02.contracts";

function bookExact(
  id: string,
  text: string,
): EditorialContent {
  return {
    id,
    text,
    editorialOrigin: "book_exact",
    generationMode: "fixed",
  };
}

function companionFixed(
  id: string,
  text: string,
): EditorialContent {
  return {
    id,
    text,
    editorialOrigin: "igent_companion",
    generationMode: "fixed",
  };
}

export const PILLAR_02_IDENTITY:
  PillarIdentity = {
    id: PILLAR_IDS.family,
    ordinal: 2,
    slug: "familia",
    act: "survival",

    title: bookExact(
      "p02_identity_title",
      "Família",
    ),

    subtitle: bookExact(
      "p02_identity_subtitle",
      "O primeiro lugar onde aprendemos a nos calar.",
    ),

    openingQuote: bookExact(
      "p02_identity_opening_quote",
      "Os primeiros vínculos moldam quem acreditamos precisar ser para continuar pertencendo.",
    ),

    /**
     * O próximo pilar é Luto.
     * A navegação imediata, porém, passa pelo Interlúdio Fenda.
     */
    nextPillarId: PILLAR_IDS.grief,
  };

export const PILLAR_02_INTERNAL_BOOK_HEADING =
  bookExact(
    "p02_internal_book_heading",
    "Pilar II — Família & Lealdades Invisíveis",
  );

export const PILLAR_02_CANONICAL_SECTIONS:
  readonly PillarCanonicalSection[] = [
    {
      id: "p02_section_identity",
      kind: "identity",

      title: bookExact(
        "p02_section_identity_title",
        "Família",
      ),

      contentReferenceId:
        "pillar_02_familia:identity",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_threshold",
      kind: "threshold",

      title: bookExact(
        "p02_section_threshold_title",
        "Raiz",
      ),

      contentReferenceId:
        "pillar_02_familia:threshold",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_manifesto",
      kind: "manifesto",

      title: bookExact(
        "p02_section_manifesto_title",
        "O primeiro lugar onde aprendemos a nos calar",
      ),

      contentReferenceId:
        "pillar_02_familia:manifesto",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_narrative",
      kind: "narrative",

      title: bookExact(
        "p02_section_narrative_title",
        "O pacto silencioso e a dívida emocional que não termina",
      ),

      contentReferenceId:
        "pillar_02_familia:narrative",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_consciousness",
      kind: "consciousness",

      title: bookExact(
        "p02_section_consciousness_title",
        "Ver o contrato que nunca foi assinado",
      ),

      contentReferenceId:
        "pillar_02_familia:consciousness",

      automaticInvite: "after_section",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_judgment",
      kind: "judgment",

      title: bookExact(
        "p02_section_judgment_title",
        "Quando a moral familiar vira prisão interna",
      ),

      contentReferenceId:
        "pillar_02_familia:judgment",

      automaticInvite: "after_section",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_presence",
      kind: "presence",

      title: bookExact(
        "p02_section_presence_title",
        "Ficar onde antes você se retraía",
      ),

      contentReferenceId:
        "pillar_02_familia:presence",

      automaticInvite: "after_section",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_support_letter",
      kind: "support_letter",

      title: bookExact(
        "p02_section_support_letter_title",
        "Ficar onde antes você se retraía",
      ),

      contentReferenceId:
        "pillar_02_familia:support-letter",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_anchor",
      kind: "anchor",

      title: bookExact(
        "p02_section_anchor_title",
        "O exercício da devolução silenciosa",
      ),

      contentReferenceId:
        "pillar_02_familia:canonical-anchor",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },

    {
      id: "p02_section_closing",
      kind: "closing",

      title: bookExact(
        "p02_section_closing_title",
        "O que te formou não precisa te governar",
      ),

      contentReferenceId:
        "pillar_02_familia:closing",

      automaticInvite: "none",

      editorialOrigin: "book_exact",
      generationMode: "fixed",
    },
  ];

export const PILLAR_02_EDITORIAL_DOSSIER:
  Pillar02EditorialDossier = {
    identity: PILLAR_02_IDENTITY,

    internalBookHeading:
      PILLAR_02_INTERNAL_BOOK_HEADING,

    canonicalSections:
      PILLAR_02_CANONICAL_SECTIONS,

    editorialThesis:
      "O Pilar II ajuda o leitor a reconhecer papéis, silêncios e lealdades aprendidas dentro da família sem reduzir sua história a culpa, acusação ou rompimento. O movimento central é separar pertencimento de autoabandono.",

    coreMovement: {
      consciousness:
        "Perceber os contratos invisíveis, os papéis assumidos e as reações que continuam funcionando como se o ambiente familiar original ainda estivesse presente.",

      judgment:
        "Reconhecer culpa, dívida, obrigação e medo de deslealdade como mecanismos internalizados, não como veredictos morais sobre o leitor.",

      presence:
        "Criar espaço interno para pertencer sem se anular, sustentar limites sem agressão e reconhecer ambiguidades sem transformar a família em inimiga.",
    },

    boundaries: [
      {
        id: "p02_boundary_no_villains",

        rule:
          "Não transformar pais, mães, familiares ou o sistema familiar em vilões.",

        reason:
          "O pilar trabalha efeitos internalizados e adaptações do leitor, não julgamento sumário de terceiros.",
      },

      {
        id: "p02_boundary_no_forced_break",

        rule:
          "Não recomendar rompimento, confronto, exposição ou afastamento como resposta automática.",

        reason:
          "Presença é inicialmente um movimento interno e não exige ação externa imediata.",
      },

      {
        id: "p02_boundary_no_moral_debt",

        rule:
          "Não reforçar que gratidão, respeito ou parentesco exigem autoanulação.",

        reason:
          "O pilar separa vínculo de submissão e amor de dívida emocional.",
      },

      {
        id: "p02_boundary_no_diagnosis",

        rule:
          "Não diagnosticar a família, o leitor ou qualquer familiar.",

        reason:
          "O iGentMIND é uma camada reflexiva, não clínica.",
      },

      {
        id: "p02_boundary_no_memory_assertion",

        rule:
          "Não afirmar que determinada reação necessariamente nasceu na infância.",

        reason:
          "O sistema pode oferecer hipótese reflexiva, mas não declarar origem sem confirmação do leitor.",
      },

      {
        id: "p02_boundary_ambivalence",

        rule:
          "Permitir que amor, falta, gratidão, raiva, cuidado e frustração coexistam.",

        reason:
          "A trialidade precisa sustentar complexidade sem forçar absolvição ou condenação.",
      },
    ],

    phases: {
      consciousness: {
        phase: "consciousness",

        canonicalSectionId:
          "p02_section_consciousness",

        canonicalSectionTitle:
          "Ver o contrato que nunca foi assinado",

        purpose:
          "Ajudar o leitor a perceber papéis, vigilância, silêncios e ajustes automáticos usados para preservar pertencimento.",

        centralDistinction:
          "Aquilo que hoje parece personalidade pode ter começado como adaptação.",

        coreTensions: [
          "papel aprendido versus escolha atual",
          "pertencimento versus redução",
          "cuidado versus vigilância",
          "harmonia versus responsabilidade excessiva",
          "silêncio espontâneo versus silêncio treinado",
        ],

        expectedMovement:
          "Sair de uma explicação genérica sobre família e reconhecer um comportamento concreto que ainda opera no presente.",

        questionIds: [
          "p02_consciousness_q01",
          "p02_consciousness_q02",
          "p02_consciousness_q03",
        ],

        signalIds: [
          "p02_learned_role",
          "p02_environment_vigilance",
          "p02_inherited_silence",
        ],

        prohibitedDirections: [
          "buscar culpados",
          "reconstruir lembranças como fatos",
          "prescrever confronto",
          "afirmar trauma",
          "forçar interpretação da infância",
        ],
      },

      judgment: {
        phase: "judgment",

        canonicalSectionId:
          "p02_section_judgment",

        canonicalSectionTitle:
          "Quando a moral familiar vira prisão interna",

        purpose:
          "Tornar visível o tribunal interno que transforma escolha própria em culpa, dívida ou deslealdade.",

        centralDistinction:
          "Sentir culpa não prova que uma escolha é errada; pode indicar apenas que ela contraria um roteiro antigo.",

        coreTensions: [
          "respeito versus submissão",
          "gratidão versus anulação",
          "responsabilidade versus dívida infinita",
          "escolha própria versus medo de deslealdade",
          "limite versus acusação moral",
        ],

        expectedMovement:
          "Separar o desconforto moral automático da avaliação concreta sobre dano, responsabilidade e escolha.",

        questionIds: [
          "p02_judgment_q01",
          "p02_judgment_q02",
          "p02_judgment_q03",
        ],

        signalIds: [
          "p02_family_guilt",
          "p02_emotional_debt",
          "p02_disloyalty_fear",
        ],

        prohibitedDirections: [
          "invalidar gratidão",
          "acusar familiares",
          "normalizar crueldade",
          "transformar culpa em prova",
          "pressionar por decisão externa",
        ],
      },

      presence: {
        phase: "presence",

        canonicalSectionId:
          "p02_section_presence",

        canonicalSectionTitle:
          "Ficar onde antes você se retraía",

        purpose:
          "Ajudar o leitor a permanecer consigo enquanto surge culpa, medo de decepcionar ou impulso de voltar ao papel habitual.",

        centralDistinction:
          "Limite interno não é ataque, e pertencimento não exige desaparecimento.",

        coreTensions: [
          "presença própria versus regulação de todos",
          "limite versus hostilidade",
          "amor versus obrigação",
          "ambivalência versus condenação",
          "pertencimento versus autoabandono",
        ],

        expectedMovement:
          "Criar um pequeno intervalo entre o reflexo de se ajustar e a escolha seguinte.",

        questionIds: [
          "p02_presence_q01",
          "p02_presence_q02",
          "p02_presence_q03",
        ],

        signalIds: [
          "p02_boundary_presence",
          "p02_non_erasing_belonging",
          "p02_ambivalence_capacity",
        ],

        prohibitedDirections: [
          "exigir posicionamento imediato",
          "prescrever afastamento",
          "confundir limite com punição",
          "transformar presença em confronto",
          "exigir perdão ou reconciliação",
        ],
      },
    },

    continuation: {
      immediateExperienceId:
        PILLAR_02_EXPERIENCE_IDS.interlude,

      nextPillarId:
        PILLAR_02_EXPERIENCE_IDS.nextPillar,

      bypassInterludeAllowed: false,
    },
  };

export const PILLAR_02_COMPANION_IDENTITY_NOTE =
  companionFixed(
    "p02_companion_identity_note",
    "O iGentMIND acompanha o que o tema da família desperta sem decidir por você quem está certo, quem está errado ou o que deve ser feito.",
  );
