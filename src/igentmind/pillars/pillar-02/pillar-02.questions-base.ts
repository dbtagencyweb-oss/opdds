// src/igentmind/pillars/pillar-02/pillar-02.questions-base.ts

import type {
  EditorialContent,
} from "../template";

import type {
  Pillar02QuestionBlueprint,
} from "./pillar-02.contracts";

function bookExactQuestion(
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

function companionQuestion(
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

export const PILLAR_02_QUESTION_BLUEPRINTS:
  readonly Pillar02QuestionBlueprint[] = [
    /*
     * CONSCIÊNCIA
     */

    {
      id: "p02_consciousness_q01",
      phase: "consciousness",
      order: 1,

      prompt: bookExactQuestion(
        "p02_consciousness_q01_prompt",
        "Em que momentos da minha vida adulta eu me sinto pequeno de novo?",
      ),

      detectsSignalIds: [
        "p02_learned_role",
        "p02_environment_vigilance",
      ],

      primaryScale: "awareness",
      secondaryScale: "avoidance",

      intention:
        "Localizar situações atuais em que o leitor sente redução de autonomia, voz ou espaço interno.",

      responseDirection: {
        minimal:
          "Reconhecer o estado sem atribuir origem nem buscar culpados.",

        standard:
          "Espelhar a mudança de posição interna e diferenciar o presente da reação aprendida.",

        deep:
          "Explorar o papel que reaparece, seu custo atual e a forma como ele preserva pertencimento.",
      },

      guardrails: [
        "não afirmar regressão psicológica",
        "não declarar origem infantil",
        "não interpretar familiares",
        "não sugerir confronto",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    {
      id: "p02_consciousness_q02",
      phase: "consciousness",
      order: 2,

      prompt: bookExactQuestion(
        "p02_consciousness_q02_prompt",
        "Onde eu me contenho mesmo estando seguro?",
      ),

      detectsSignalIds: [
        "p02_inherited_silence",
        "p02_environment_vigilance",
      ],

      primaryScale: "awareness",
      secondaryScale: "readiness",

      intention:
        "Perceber contenções que continuam automáticas mesmo quando não existe ameaça objetiva no presente.",

      responseDirection: {
        minimal:
          "Nomear a contenção sem pressionar por expressão.",

        standard:
          "Diferenciar silêncio escolhido de silêncio usado como proteção.",

        deep:
          "Investigar o custo relacional e interno de continuar se editando em ambientes seguros.",
      },

      guardrails: [
        "não exigir que o leitor fale",
        "não afirmar que o ambiente é seguro contra a percepção do leitor",
        "não tratar silêncio como defeito",
        "não propor exposição",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    {
      id: "p02_consciousness_q03",
      phase: "consciousness",
      order: 3,

      prompt: bookExactQuestion(
        "p02_consciousness_q03_prompt",
        "Onde eu continuo tentando manter um equilíbrio que não é meu dever sustentar?",
      ),

      detectsSignalIds: [
        "p02_learned_role",
        "p02_environment_vigilance",
        "p02_emotional_debt",
      ],

      primaryScale: "awareness",
      secondaryScale: "agency",

      intention:
        "Identificar responsabilidades emocionais assumidas automaticamente e separar cuidado de regulação excessiva.",

      responseDirection: {
        minimal:
          "Reconhecer o peso sem pedir mudança imediata.",

        standard:
          "Espelhar o esforço usado para manter o ambiente estável.",

        deep:
          "Diferenciar responsabilidade legítima, cuidado voluntário e obrigação emocional internalizada.",
      },

      guardrails: [
        "não chamar cuidado de codependência",
        "não invalidar responsabilidades reais",
        "não recomendar abandono de compromissos",
        "não decidir de quem é a responsabilidade",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    /*
     * JULGAMENTO
     */

    {
      id: "p02_judgment_q01",
      phase: "judgment",
      order: 1,

      prompt: companionQuestion(
        "p02_judgment_q01_prompt",
        "Que culpa aparece quando eu imagino decepcionar minha família?",
      ),

      detectsSignalIds: [
        "p02_family_guilt",
        "p02_disloyalty_fear",
      ],

      primaryScale: "judgment",
      secondaryScale: "load",

      intention:
        "Tornar visível a culpa antecipada que surge antes de existir uma decisão ou consequência concreta.",

      responseDirection: {
        minimal:
          "Reconhecer que existe culpa sem concluir que ela está certa ou errada.",

        standard:
          "Separar o medo de decepcionar da avaliação concreta da escolha.",

        deep:
          "Observar a regra moral interna que transforma diferenciação em ameaça de perda do vínculo.",
      },

      guardrails: [
        "não invalidar responsabilidade",
        "não afirmar manipulação familiar",
        "não incentivar desobediência",
        "não tratar culpa como prova de abuso",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    {
      id: "p02_judgment_q02",
      phase: "judgment",
      order: 2,

      prompt: companionQuestion(
        "p02_judgment_q02_prompt",
        "Que dívida eu sinto que preciso pagar para continuar pertencendo?",
      ),

      detectsSignalIds: [
        "p02_emotional_debt",
        "p02_learned_role",
      ],

      primaryScale: "judgment",
      secondaryScale: "agency",

      intention:
        "Perceber onde gratidão, cuidado ou parentesco foram transformados internamente em obrigação sem fim.",

      responseDirection: {
        minimal:
          "Nomear a sensação de dívida sem negar o que foi recebido.",

        standard:
          "Diferenciar gratidão possível de obrigação que exige autoabandono.",

        deep:
          "Explorar como a dívida organiza disponibilidade, escolhas, descanso e autonomia.",
      },

      guardrails: [
        "não negar ajuda recebida",
        "não acusar familiares de cobrança",
        "não transformar reciprocidade em problema",
        "não prescrever interrupção de apoio",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    {
      id: "p02_judgment_q03",
      phase: "judgment",
      order: 3,

      prompt: companionQuestion(
        "p02_judgment_q03_prompt",
        "Que parte de mim eu condeno quando desejo escolher diferente do roteiro familiar?",
      ),

      detectsSignalIds: [
        "p02_disloyalty_fear",
        "p02_family_guilt",
        "p02_inherited_silence",
      ],

      primaryScale: "judgment",
      secondaryScale: "readiness",

      intention:
        "Identificar a autocrítica ativada por desejos, opiniões ou escolhas que não repetem o caminho esperado.",

      responseDirection: {
        minimal:
          "Reconhecer a condenação interna sem pedir decisão.",

        standard:
          "Separar diferença de deslealdade.",

        deep:
          "Observar qual identidade moral o leitor teme perder quando escolhe um caminho próprio.",
      },

      guardrails: [
        "não afirmar que existe um roteiro explícito",
        "não pressionar por ruptura",
        "não reduzir tradição a opressão",
        "não transformar autonomia em superioridade",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    /*
     * PRESENÇA
     */

    {
      id: "p02_presence_q01",
      phase: "presence",
      order: 1,

      prompt: companionQuestion(
        "p02_presence_q01_prompt",
        "O que eu consigo sustentar em mim sem me explicar imediatamente?",
      ),

      detectsSignalIds: [
        "p02_boundary_presence",
        "p02_inherited_silence",
      ],

      primaryScale: "presence",
      secondaryScale: "agency",

      intention:
        "Criar um intervalo entre a percepção interna e o impulso automático de justificar, agradar ou corrigir.",

      responseDirection: {
        minimal:
          "Autorizar uma pausa curta antes da explicação.",

        standard:
          "Reconhecer o conteúdo interno que pode existir sem defesa imediata.",

        deep:
          "Explorar como a necessidade de explicação regula pertencimento e evita desaprovação.",
      },

      guardrails: [
        "não incentivar silêncio punitivo",
        "não confundir presença com omissão",
        "não impedir comunicação necessária",
        "não propor retenção prolongada",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    {
      id: "p02_presence_q02",
      phase: "presence",
      order: 2,

      prompt: companionQuestion(
        "p02_presence_q02_prompt",
        "Onde posso reconhecer um limite sem transformar minha família em inimiga?",
      ),

      detectsSignalIds: [
        "p02_boundary_presence",
        "p02_ambivalence_capacity",
      ],

      primaryScale: "presence",
      secondaryScale: "judgment",

      intention:
        "Ajudar o leitor a reconhecer limites internos sem precisar construir uma narrativa total de condenação.",

      responseDirection: {
        minimal:
          "Reconhecer que limite e hostilidade não são a mesma coisa.",

        standard:
          "Sustentar a possibilidade de cuidado e limite coexistirem.",

        deep:
          "Diferenciar proteção, punição, distância, disponibilidade e responsabilidade.",
      },

      guardrails: [
        "não relativizar violência",
        "não exigir proximidade",
        "não exigir perdão",
        "não impedir busca de apoio quando houver risco",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },

    {
      id: "p02_presence_q03",
      phase: "presence",
      order: 3,

      prompt: companionQuestion(
        "p02_presence_q03_prompt",
        "Como seria pertencer sem assumir sozinho o equilíbrio de todos?",
      ),

      detectsSignalIds: [
        "p02_non_erasing_belonging",
        "p02_boundary_presence",
        "p02_environment_vigilance",
      ],

      primaryScale: "presence",
      secondaryScale: "agency",

      intention:
        "Abrir uma representação interna de pertencimento que não dependa de vigilância, utilidade ou regulação permanente.",

      responseDirection: {
        minimal:
          "Permitir imaginar um pequeno alívio de responsabilidade.",

        standard:
          "Diferenciar presença compartilhada de sustentação unilateral.",

        deep:
          "Observar o que o leitor teme que aconteça quando deixa de organizar emocionalmente o ambiente.",
      },

      guardrails: [
        "não prometer mudança familiar",
        "não concluir que o leitor sustenta tudo sozinho",
        "não prescrever abandono de cuidado",
        "não transformar autonomia em isolamento",
      ],

      allowOpenAnswer: true,
      closedOptionConfidence: "low",
      createsPatternAlone: false,
    },
  ] as const;
