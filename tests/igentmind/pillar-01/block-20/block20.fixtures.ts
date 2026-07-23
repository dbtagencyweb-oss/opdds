// tests/igentmind/pillar-01/block-20/block20.fixtures.ts

import {
  Block20Fixture,
  PILLAR_01_ID,
  ScenarioMatrixItem,
} from "./block20.types";

export const FIXED_NOW = "2026-07-12T13:00:00.000-03:00";

export const BOOK_CURSORS = {
  pillarStart: {
    contentId: PILLAR_01_ID,
    sectionId: "identity",
    anchorId: "start",
  },

  limiar: {
    contentId: PILLAR_01_ID,
    sectionId: "limiar",
    anchorId: "start",
  },

  manifesto: {
    contentId: PILLAR_01_ID,
    sectionId: "manifesto",
    anchorId: "start",
  },

  narrative: {
    contentId: PILLAR_01_ID,
    sectionId: "narrative",
    anchorId: "start",
  },

  consciousnessInvite: {
    contentId: PILLAR_01_ID,
    sectionId: "consciousness",
    anchorId: "section-end",
  },

  judgmentInvite: {
    contentId: PILLAR_01_ID,
    sectionId: "judgment",
    anchorId: "section-end",
  },

  presenceInvite: {
    contentId: PILLAR_01_ID,
    sectionId: "presence",
    anchorId: "section-end",
  },

  supportLetter: {
    contentId: PILLAR_01_ID,
    sectionId: "support-letter",
    anchorId: "start",
  },

  ritual: {
    contentId: PILLAR_01_ID,
    sectionId: "canonical-ritual",
    anchorId: "start",
  },

  pillarEnd: {
    contentId: PILLAR_01_ID,
    sectionId: "closing",
    anchorId: "section-end",
  },

  pillar02Start: {
    contentId: "pillar_02_familia",
    sectionId: "identity",
    anchorId: "start",
  },
} as const;

export const QUESTION_IDS = {
  consciousness: [
    "p01_consciousness_q01",
    "p01_consciousness_q02",
    "p01_consciousness_q03",
  ],

  judgment: [
    "p01_judgment_q01",
    "p01_judgment_q02",
    "p01_judgment_q03",
  ],

  presence: [
    "p01_presence_q01",
    "p01_presence_q02",
    "p01_presence_q03",
  ],
} as const;

export const OPTION_IDS = {
  consciousness: [
    "p01_consciousness_q01_o01",
    "p01_consciousness_q02_o01",
    "p01_consciousness_q03_o01",
  ],

  judgment: [
    "p01_judgment_q01_o01",
    "p01_judgment_q02_o01",
    "p01_judgment_q03_o01",
  ],

  presence: [
    "p01_presence_q01_o01",
    "p01_presence_q02_o01",
    "p01_presence_q03_o01",
  ],
} as const;

export const PRIVATE_JOURNAL_TEXT =
  "Percebo uma tensão que estava tentando explicar antes de sentir.";

export const PRIVATE_LETTER_TEXT =
  "Escrevo apenas para registrar que consigo voltar sem transformar isso em promessa.";

export const OPEN_CORRECTION_TEXT =
  "A opção anterior não representa bem o que sinto. Não é desprezo; é medo de parar e perder o controle.";

export const ORIGINAL_MEMORY_SUGGESTION =
  "O leitor precisa continuar em movimento para não se sentir exposto.";

export const EDITED_MEMORY_TEXT =
  "Quando sinto exposição, tendo a acelerar; quero apenas reconhecer isso sem transformar em identidade.";

export const BASE_FIXTURE: Block20Fixture = {
  sessionId: "block20-session-001",
  readerId: "block20-reader-001",
  pillarId: PILLAR_01_ID,
  readerState: "observing",
  phase: null,

  scales: {
    awareness: 1,
    judgment: 1,
    presence: 1,
    readiness: 1,
    load: 1,
    avoidance: 1,
    agency: 1,
  },

  bookCursor: BOOK_CURSORS.pillarStart,

  consent: {
    memory: false,
    privateWriting: true,
    telemetryPrivateContent: false,
  },

  featureFlags: {
    iGentMindEnabled: true,
    automaticInvitesEnabled: true,
    testMode: true,
  },

  clock: {
    now: FIXED_NOW,
  },
};

export const SCENARIO_MATRIX: readonly ScenarioMatrixItem[] = [
  {
    id: "B20-J01",
    title: "Leitura integral sem usar o iGentMIND",
    area: "navigation",
    expected: [
      "A leitura chega ao final do pilar.",
      "Nenhum convite bloqueia a leitura.",
      "Nenhuma resposta, memória ou escrita é criada.",
    ],
  },
  {
    id: "B20-J02",
    title: "Leitor aceita apenas uma pergunta",
    area: "journey",
    expected: [
      "Apenas uma pergunta é respondida.",
      "Nenhuma progressão forçada acontece.",
      "O retorno ocorre no ponto exato do livro.",
    ],
  },
  {
    id: "B20-J03",
    title: "Leitor responde todas as perguntas",
    area: "integration",
    expected: [
      "Nove perguntas são respondidas.",
      "As três fases ficam completas.",
      "Nenhuma escala sai do intervalo de zero a quatro.",
    ],
  },
  {
    id: "B20-J04",
    title: "Leitor em estado defensivo",
    area: "journey",
    expected: [
      "A resposta não usa profundidade deep.",
      "Não há pressão por escrita.",
      "A intervenção respeita defesa e escolha explícita.",
    ],
  },
  {
    id: "B20-J05",
    title: "Leitor com carga alta",
    area: "safety",
    expected: [
      "Intervenções profundas são suprimidas.",
      "Pausa ou retorno à leitura são priorizados.",
      "A leitura permanece disponível.",
    ],
  },
  {
    id: "B20-J06",
    title: "Leitor pula perguntas",
    area: "journey",
    expected: [
      "Perguntas puladas não contam como respondidas.",
      "O fluxo continua.",
      "A reflexão não bloqueia o livro.",
    ],
  },
  {
    id: "B20-J07",
    title: "Leitor recusa escrita",
    area: "privacy",
    expected: [
      "A recusa é respeitada.",
      "Nenhum diário ou carta é aberto.",
      "A oferta não é repetida no mesmo movimento.",
    ],
  },
  {
    id: "B20-J08",
    title: "Diário totalmente privado",
    area: "privacy",
    expected: [
      "O diário fica marcado como privado.",
      "Seu conteúdo não entra em telemetria.",
      "Ele não vira memória automaticamente.",
    ],
  },
  {
    id: "B20-J09",
    title: "Carta privada sem envio",
    area: "privacy",
    expected: [
      "A carta é salva apenas localmente.",
      "Nenhum destinatário é criado.",
      "Nenhuma mensagem externa é enviada.",
    ],
  },
  {
    id: "B20-J10",
    title: "Âncora interrompida antes do fim",
    area: "journey",
    expected: [
      "A âncora fica interrompida, não concluída.",
      "A leitura não fica bloqueada.",
      "A retomada permanece opcional.",
    ],
  },
  {
    id: "B20-J11",
    title: "Resposta aberta corrige opção fechada",
    area: "integration",
    expected: [
      "A resposta aberta se torna a fonte principal.",
      "A evidência fechada perde autoridade.",
      "Nenhum padrão definitivo é criado.",
    ],
  },
  {
    id: "B20-J12",
    title: "Memória recusada",
    area: "privacy",
    expected: [
      "Nenhuma memória confirmada é armazenada.",
      "A recusa fica registrada sem conteúdo privado.",
      "A sugestão não reaparece como memória ativa.",
    ],
  },
  {
    id: "B20-J13",
    title: "Memória editada e confirmada",
    area: "privacy",
    expected: [
      "Somente o texto editado é armazenado.",
      "A confirmação explícita é preservada.",
      "A memória original sugerida não é salva.",
    ],
  },
  {
    id: "B20-J14",
    title: "Fechamento sem síntese",
    area: "journey",
    expected: [
      "O leitor consegue encerrar sem síntese.",
      "O fechamento é válido.",
      "Nenhum texto personalizado é forçado.",
    ],
  },
  {
    id: "B20-J15",
    title: "Fechamento parcial",
    area: "journey",
    expected: [
      "O estado permanece parcial.",
      "Complete é falso.",
      "O leitor pode continuar a leitura.",
    ],
  },
  {
    id: "B20-J16",
    title: "Fechamento após reflexão completa",
    area: "integration",
    expected: [
      "Complete é verdadeiro.",
      "A síntese pode ser gerada.",
      "Rotas canônicas e complementares permanecem separadas.",
    ],
  },
  {
    id: "B20-J17",
    title: "Retorno exato ao ponto do livro",
    area: "navigation",
    expected: [
      "O cursor anterior é preservado.",
      "O retorno não avança nem retrocede o texto.",
      "A reflexão não altera o ponto de leitura.",
    ],
  },
  {
    id: "B20-J18",
    title: "Continuação para Pilar II — Família",
    area: "navigation",
    expected: [
      "O destino é pillar_02_familia.",
      "O ID legado não aparece.",
      "O Pilar I não é reaberto por engano.",
    ],
  },
  {
    id: "B20-J19",
    title: "Falha de referência de conteúdo",
    area: "safety",
    expected: [
      "O sistema falha fechado.",
      "Nenhum conteúdo canônico é inventado.",
      "A leitura pode continuar sem a referência.",
    ],
  },
  {
    id: "B20-J20",
    title: "Falha de segurança ou carga acima do limite",
    area: "safety",
    expected: [
      "Safety vence todas as outras prioridades.",
      "A reflexão é suspensa.",
      "Nenhuma resposta deep é produzida.",
    ],
  },
  {
    id: "B20-J21",
    title: "Bloqueio de telemetria de conteúdo privado",
    area: "privacy",
    expected: [
      "Diário, carta e resposta aberta não aparecem em telemetria.",
      "Snippets e corpos também são bloqueados.",
      "Somente metadados mínimos podem permanecer.",
    ],
  },
  {
    id: "B20-J22",
    title: "Reabertura posterior do Pilar I",
    area: "regression",
    expected: [
      "O progresso anterior é recuperado.",
      "Memórias não são duplicadas.",
      "O leitor recebe opção de retomar, não obrigação.",
    ],
  },
] as const;
