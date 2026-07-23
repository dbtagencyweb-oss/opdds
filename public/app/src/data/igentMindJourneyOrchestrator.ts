import type { DecisionEngineResult } from './igentMindDecision';
import type { MindPhaseId, SemanticPosition } from './igentMindProtocol';
import type { PrimarySignal } from './igentMindSignals';
import type { ReaderMindState } from './igentMindState';

export const MIND_GUIDED_MAX_TURNS = 3;

export type MindJourneyAnswer = {
  questionId?: string;
  phase?: MindPhaseId;
  question: string;
  option: string;
  semantic_position?: SemanticPosition;
  primary_signal?: PrimarySignal;
  load?: number;
  open_answer?: string;
};

export type MindJourneyQuestion = {
  id: string;
  phase?: MindPhaseId;
};

export type MindJourneyStage = 'clarify' | 'reflect' | 'synthesize';

export type MindJourneyTurnPlan = {
  stage: MindJourneyStage;
  complete: boolean;
  progress: number;
  nextQuestionIndex: number | null;
  acknowledgement: string;
  synthesis?: string;
  replies?: string[];
};

const acknowledgementByPosition: Record<SemanticPosition, string> = {
  recognition: 'Isso já é um ponto de partida. Não precisamos transformar o reconhecimento em cobrança.',
  minimization: 'Talvez uma parte sua não queira ampliar isso agora. Podemos olhar sem forçar importância nem conclusão.',
  defense: 'Essa proteção não precisa ser combatida. Primeiro basta perceber o que ela tenta manter de pé.',
  ambivalence: 'As duas direções podem existir ao mesmo tempo. Você não precisa escolher uma delas depressa.',
  desire: 'Esse desejo mostra uma direção, não uma obrigação de mudança imediata.',
  uncertainty: 'Não saber ainda é uma resposta válida. A próxima pergunta pode ser mais simples.',
};

export const mindJourneyClosingReplies = [
  'Conversar com minhas palavras',
  'Levar para o Diário',
  'Voltar ao trecho',
  'Encerrar por agora',
];

const desiredNextPhase = (
  answerCount: number,
  lastAnswer: MindJourneyAnswer,
  decision?: DecisionEngineResult | null,
): MindPhaseId => {
  if (answerCount >= 2) return 'presence';
  if (decision?.action === 'advance' && decision.next_phase) return decision.next_phase;
  if (lastAnswer.semantic_position === 'recognition' ||
      lastAnswer.semantic_position === 'ambivalence' ||
      lastAnswer.semantic_position === 'desire') return 'judgment';
  return 'consciousness';
};

const findNextQuestionIndex = (
  questions: MindJourneyQuestion[],
  answers: MindJourneyAnswer[],
  decision?: DecisionEngineResult | null,
) => {
  const usedIds = new Set(answers.map((answer) => answer.questionId).filter(Boolean));
  const desiredPhase = desiredNextPhase(answers.length, answers.at(-1)!, decision);
  const selectedByEngine = decision?.selected_content_id
    ? questions.findIndex((question) =>
        question.id === decision.selected_content_id &&
        question.phase === desiredPhase &&
        !usedIds.has(question.id),
      )
    : -1;
  if (selectedByEngine >= 0) return selectedByEngine;

  const phaseMatch = questions.findIndex((question) => question.phase === desiredPhase && !usedIds.has(question.id));
  if (phaseMatch >= 0) return phaseMatch;
  return questions.findIndex((question) => !usedIds.has(question.id));
};

export const buildMindJourneyAcknowledgement = (answer: MindJourneyAnswer) => {
  if (answer.open_answer) {
    return 'Eu li suas palavras sem encaixá-las numa categoria. Vou usá-las apenas para escolher o próximo movimento da conversa.';
  }
  if (answer.semantic_position) return acknowledgementByPosition[answer.semantic_position];
  return 'Entendi. Isso basta para escolher o próximo movimento, sem concluir nada sobre você.';
};

const quote = (value: string) => `“${value.trim().replace(/\s+/g, ' ')}”`;

export const buildMindJourneySynthesis = (input: {
  pillarTitle: string;
  chapterTitle?: string;
  answers: MindJourneyAnswer[];
  paused?: boolean;
}) => {
  if (!input.answers.length) {
    return `Vamos parar aqui em ${input.pillarTitle}. Você não precisa responder para continuar pertencendo à leitura. O livro permanece disponível quando quiser voltar.`;
  }

  const selected = input.answers.slice(-2).map((answer) => quote(answer.open_answer || answer.option));
  const appeared = selected.length === 1
    ? `Você deixou uma frase como ponto de apoio: ${selected[0]}.`
    : `Duas frases ajudam a organizar o que apareceu: ${selected[0]} e ${selected[1]}.`;
  const pause = input.paused
    ? 'O peso da conversa pede menos uma pergunta agora, não mais profundidade.'
    : 'Isso não fecha uma interpretação sobre você; apenas registra o fio que você reconheceu nesta conversa.';
  const bookBridge = input.chapterTitle
    ? `No livro, esse fio continua no capítulo “${input.chapterTitle}”. O iGent não substitui o texto: ele apenas ajuda você a decidir como voltar a ele.`
    : 'O livro continua sendo a referência. O iGent apenas organiza suas respostas e devolve um caminho de retorno.';

  return `O que apareceu até aqui em ${input.pillarTitle}\n\n${appeared}\n\n${pause}\n\n${bookBridge}\n\nEscolha o destino que deixa sua mente mais clara agora.`;
};

export const planMindJourneyTurn = (input: {
  questions: MindJourneyQuestion[];
  answers: MindJourneyAnswer[];
  pillarTitle: string;
  chapterTitle?: string;
  readerState?: ReaderMindState | null;
  decision?: DecisionEngineResult | null;
  forceComplete?: boolean;
}): MindJourneyTurnPlan => {
  const lastAnswer = input.answers.at(-1);
  const acknowledgement = lastAnswer ? buildMindJourneyAcknowledgement(lastAnswer) : '';
  const paused = Boolean(
    input.readerState?.global_state === 'overloaded' ||
    input.readerState?.global_state === 'paused' ||
    (input.readerState?.load_level ?? 0) >= 3 ||
    input.decision?.action === 'pause' ||
    input.decision?.action === 'close',
  );
  const complete = Boolean(
    input.forceComplete ||
    paused ||
    input.answers.length >= MIND_GUIDED_MAX_TURNS ||
    !input.questions.length,
  );

  if (complete) {
    return {
      stage: 'synthesize',
      complete: true,
      progress: 100,
      nextQuestionIndex: null,
      acknowledgement,
      synthesis: buildMindJourneySynthesis({
        pillarTitle: input.pillarTitle,
        chapterTitle: input.chapterTitle,
        answers: input.answers,
        paused,
      }),
      replies: mindJourneyClosingReplies,
    };
  }

  const nextQuestionIndex = findNextQuestionIndex(input.questions, input.answers, input.decision);
  if (nextQuestionIndex < 0) {
    return {
      stage: 'synthesize',
      complete: true,
      progress: 100,
      nextQuestionIndex: null,
      acknowledgement,
      synthesis: buildMindJourneySynthesis({
        pillarTitle: input.pillarTitle,
        chapterTitle: input.chapterTitle,
        answers: input.answers,
      }),
      replies: mindJourneyClosingReplies,
    };
  }

  return {
    stage: input.answers.length >= 2 ? 'reflect' : 'clarify',
    complete: false,
    progress: Math.round((input.answers.length / MIND_GUIDED_MAX_TURNS) * 100),
    nextQuestionIndex,
    acknowledgement,
  };
};
