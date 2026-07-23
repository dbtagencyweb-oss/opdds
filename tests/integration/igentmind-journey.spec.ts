import { describe, expect, it } from 'vitest';
import {
  MIND_GUIDED_MAX_TURNS,
  buildMindJourneySynthesis,
  planMindJourneyTurn,
  type MindJourneyAnswer,
} from '../../public/app/src/data/igentMindJourneyOrchestrator';
import { createInitialReaderMindState } from '../../public/app/src/data/igentMindState';

const questions = [
  { id: 'c1', phase: 'consciousness' as const },
  { id: 'c2', phase: 'consciousness' as const },
  { id: 'c3', phase: 'consciousness' as const },
  { id: 'j1', phase: 'judgment' as const },
  { id: 'j2', phase: 'judgment' as const },
  { id: 'j3', phase: 'judgment' as const },
  { id: 'p1', phase: 'presence' as const },
  { id: 'p2', phase: 'presence' as const },
  { id: 'p3', phase: 'presence' as const },
];

const answer = (overrides: Partial<MindJourneyAnswer> = {}): MindJourneyAnswer => ({
  questionId: 'c1',
  phase: 'consciousness',
  question: 'Onde preciso produzir para merecer estar aqui?',
  option: 'Eu reconheço que isso está acontecendo comigo.',
  semantic_position: 'recognition',
  primary_signal: 'recognition',
  load: 1,
  ...overrides,
});

describe('jornada operacional do iGentMIND', () => {
  it('limita a reflexão guiada a três movimentos', () => {
    expect(MIND_GUIDED_MAX_TURNS).toBe(3);
    const answers = [
      answer(),
      answer({ questionId: 'j1', phase: 'judgment', option: 'Eu vejo a cobrança que aparece.' }),
      answer({ questionId: 'p1', phase: 'presence', option: 'Eu consigo ficar com isso por alguns segundos.' }),
    ];
    const plan = planMindJourneyTurn({ questions, answers, pillarTitle: 'Trabalho', chapterTitle: 'Trabalho' });

    expect(plan.complete).toBe(true);
    expect(plan.stage).toBe('synthesize');
    expect(plan.nextQuestionIndex).toBeNull();
    expect(plan.progress).toBe(100);
    expect(plan.synthesis).toContain('O que apareceu até aqui em Trabalho');
    expect(plan.replies).toContain('Voltar ao trecho');
  });

  it('usa a resposta para escolher a fase seguinte em vez de avançar mecanicamente', () => {
    const recognitionPlan = planMindJourneyTurn({
      questions,
      answers: [answer()],
      pillarTitle: 'Trabalho',
    });
    const uncertaintyPlan = planMindJourneyTurn({
      questions,
      answers: [answer({ semantic_position: 'uncertainty', primary_signal: 'uncertainty' })],
      pillarTitle: 'Trabalho',
    });

    expect(recognitionPlan.nextQuestionIndex).toBe(3);
    expect(uncertaintyPlan.nextQuestionIndex).toBe(1);
  });

  it('leva o terceiro movimento para presença', () => {
    const plan = planMindJourneyTurn({
      questions,
      answers: [
        answer(),
        answer({ questionId: 'j1', phase: 'judgment', semantic_position: 'ambivalence' }),
      ],
      pillarTitle: 'Trabalho',
    });

    expect(plan.complete).toBe(false);
    expect(plan.stage).toBe('reflect');
    expect(plan.nextQuestionIndex).toBe(6);
  });

  it('aceita resposta aberta sem rotular o leitor', () => {
    const plan = planMindJourneyTurn({
      questions,
      answers: [answer({
        option: 'Não sei ainda do que estou tentando me defender.',
        open_answer: 'Não sei ainda do que estou tentando me defender.',
        semantic_position: undefined,
        primary_signal: 'recognition',
      })],
      pillarTitle: 'Trabalho',
    });

    expect(plan.acknowledgement).toContain('sem encaixá-las numa categoria');
    expect(plan.acknowledgement.toLowerCase()).not.toContain('diagnóstico');
  });

  it('interrompe perguntas quando a carga pede pausa', () => {
    const state = {
      ...createInitialReaderMindState({ readerId: 'reader', pillarId: 'trabalho' }),
      global_state: 'overloaded' as const,
      load_level: 4 as const,
    };
    const plan = planMindJourneyTurn({
      questions,
      answers: [answer({ semantic_position: 'defense', load: 3 })],
      pillarTitle: 'Trabalho',
      readerState: state,
    });

    expect(plan.complete).toBe(true);
    expect(plan.synthesis).toContain('menos uma pergunta agora');
  });

  it('permite parar sem responder e devolve o leitor ao livro sem dívida', () => {
    const plan = planMindJourneyTurn({
      questions,
      answers: [],
      pillarTitle: 'Trabalho',
      forceComplete: true,
    });

    expect(plan.complete).toBe(true);
    expect(plan.synthesis).toContain('não precisa responder');
  });

  it('deixa explícito que a síntese não substitui o livro', () => {
    const synthesis = buildMindJourneySynthesis({
      pillarTitle: 'Trabalho',
      chapterTitle: 'O trabalho como território de merecimento',
      answers: [answer()],
    });

    expect(synthesis).toContain('O iGent não substitui o texto');
    expect(synthesis).toContain('“Eu reconheço que isso está acontecendo comigo.”');
  });
});
