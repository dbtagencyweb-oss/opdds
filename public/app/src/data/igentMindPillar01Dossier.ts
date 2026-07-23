import type {
  CompanionAnchor,
  CompanionPhaseDefinition,
  CompanionGuidedLetter,
  CompanionJournalPrompt,
  MicroReturnFunction,
  PillarCompanionEditorialIdentity,
  PillarId,
  PillarPredictiveRule,
  PillarTransitionRule,
} from './igentMindCanonicalContent';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import {
  BLOCK_10_FINAL_RULES,
  PILLAR_01_CONSCIOUSNESS_QUESTIONS,
  PILLAR_01_CONSCIOUSNESS_REFERENCES,
} from './igentMindPillar01Consciousness';
import {
  BLOCK_11_FINAL_RULES,
  PILLAR_01_JUDGMENT_PROGRESSION,
  PILLAR_01_JUDGMENT_QUESTIONS,
  PILLAR_01_JUDGMENT_REFERENCES,
} from './igentMindPillar01Judgment';
import {
  BLOCK_12_FINAL_RULES,
  PILLAR_01_ALL_QUESTIONS,
  PILLAR_01_PRESENCE_PROGRESSION,
  PILLAR_01_PRESENCE_QUESTIONS,
  PILLAR_01_PRESENCE_REFERENCES,
} from './igentMindPillar01Presence';
import {
  BLOCK_13_FINAL_RULES,
  MICRO_RETURN_REUSE_RULES,
  PILLAR_01_MICRO_RETURN_PACKAGE,
  PILLAR_01_MICRO_RETURN_REFERENCES,
  PILLAR_01_MICRO_RETURNS,
} from './igentMindPillar01MicroReturns';
import {
  BLOCK_14_FINAL_RULES,
  JOURNAL_DISPLAY_RULES,
  PILLAR_01_JOURNAL_PACKAGE,
  PILLAR_01_JOURNAL_PROMPTS,
} from './igentMindPillar01Journals';
import {
  BLOCK_15_FINAL_RULES,
  GUIDED_LETTER_DISPLAY_RULES,
  PILLAR_01_GUIDED_LETTER_PACKAGE,
  PILLAR_01_GUIDED_LETTERS,
} from './igentMindPillar01GuidedLetters';
import {
  ANCHOR_DISPLAY_RULES,
  ANCHOR_REUSE_RULES,
  BLOCK_16_FINAL_RULES,
  PILLAR_01_ANCHOR_PACKAGE,
  PILLAR_01_ANCHORS,
} from './igentMindPillar01Anchors';
import {
  BLOCK_17_FINAL_RULES,
  PILLAR_01_CLOSURE_ACTIONS,
  PILLAR_01_CLOSURE_PACKAGE,
  PILLAR_01_CLOSURE_ROUTES,
  PILLAR_01_CLOSURE_TRANSITION,
  PILLAR_01_NEXT_CANONICAL_UNIT,
} from './igentMindPillar01Closure';

export const PILLAR_01_COMPANION_IDENTITY: PillarCompanionEditorialIdentity = {
  what_it_explains:
    'Reconhecimento é interromper a fuga do próprio estado por tempo suficiente para perceber o que está presente, antes de explicar, corrigir ou transformar.',
  central_dilemma:
    'Continuar funcionando enquanto evita a si mesmo ou permanecer diante do próprio estado sem transformá-lo imediatamente em problema.',
  common_protection:
    'Usar funcionamento, distração, explicação, produtividade, controle e performance para evitar contato com o estado interno.',
  presence_movement:
    'Permanecer consigo mesmo quando aquilo que sente não é conveniente, claro ou fácil de sustentar.',
  interpretation_risks: [
    'Transformar reconhecimento em autoestima.',
    'Transformar reconhecimento em pensamento positivo.',
    'Exigir que o leitor explique a origem do que sente.',
    'Tratar incômodo como sinal obrigatório de evolução.',
    'Romantizar sofrimento.',
    'Confundir permanência com exposição ilimitada.',
    'Transformar percepção corporal em diagnóstico.',
    'Pressionar mudança antes de haver reconhecimento.',
    'Tratar fuga como defeito moral.',
  ],
  canonical_section_ids: [
    'p01_section_identity',
    'p01_section_threshold',
    'p01_section_manifesto',
    'p01_section_narrative',
    'p01_section_consciousness',
    'p01_section_judgment',
    'p01_section_presence',
    'p01_section_support_letter',
    'p01_section_anchor',
    'p01_section_closure',
  ],
};

export const PILLAR_01_CANONICAL_IDENTITY = {
  pillar_id: 'pillar_01_reconhecimento' as PillarId,
  title: 'Reconhecimento',
  subtitle: 'Eu não estou quebrado.',
  threshold: 'Onde a negação cessa.',
  manifesto_title: 'Onde o vínculo começa',
  deep_narrative_title: 'A vida antes do reconhecimento: sobrevivência disfarçada',
  consciousness_title: 'Reconhecer o estado de sobrevivência relacional',
  judgment_title: 'Quando a ruptura vira culpa',
  presence_title: 'Reatar o vínculo consigo mesmo',
  practical_anchor_title: 'O Ritual do Reconhecimento - 7 dias, sem pressa',
  closure_title: 'O primeiro passo não é andar. É parar de fugir.',
};

export const PILLAR_01_CENTRAL_PRINCIPLE =
  'Antes de tentar mudar o estado, o leitor precisa conseguir reconhecê-lo sem desaparecer dentro da fuga ou do julgamento.';

export const PILLAR_01_INTERNAL_QUESTION =
  'O que está presente em mim agora e o que faço para não permanecer diante disso?';

export const PILLAR_01_MINIMUM_MOVEMENT =
  'Reconhecer uma única sensação, frase interna ou movimento de fuga sem tentar resolvê-lo imediatamente.';

export const PILLAR_01_IS_NOT = [
  'Uma avaliação de autoestima.',
  'Um teste de personalidade.',
  'Uma busca obrigatória pela origem da dor.',
  'Uma promessa de mudança.',
  'Uma técnica de produtividade emocional.',
  'Uma exigência de confissão.',
  'Um exercício de positividade.',
  'Uma forma de corrigir pensamentos.',
  'Uma preparação para confronto externo.',
];

export const PILLAR_01_EDITORIAL_FIELDS = [
  {
    code: 'current_state',
    title: 'Estado atual',
    description: 'O que está presente antes de qualquer explicação.',
  },
  {
    code: 'body_signal',
    title: 'Registro corporal',
    description: 'Como tensão, peso, aperto, pressa, vazio ou inquietação aparecem no corpo.',
  },
  {
    code: 'internal_sentence',
    title: 'Frase interna',
    description: 'A sentença repetida quando ninguém está observando.',
  },
  {
    code: 'automatic_escape',
    title: 'Fuga automática',
    description: 'O movimento usado para interromper contato consigo.',
  },
  {
    code: 'functioning_mode',
    title: 'Funcionamento',
    description: 'A execução contínua que mantém a vida andando enquanto o leitor permanece ausente.',
  },
  {
    code: 'self_attack',
    title: 'Ataque interno',
    description: 'A forma como o leitor responde ao próprio desconforto com desprezo, culpa ou cobrança.',
  },
  {
    code: 'performance',
    title: 'Presença editada',
    description: 'A versão reduzida ou performada usada para caber e evitar exposição.',
  },
  {
    code: 'return',
    title: 'Retorno a si',
    description: 'A capacidade de permanecer por alguns instantes sem fugir nem se corrigir.',
  },
  {
    code: 'continuity',
    title: 'Permanência repetida',
    description: 'O retorno gradual ao próprio estado sem promessa de resolução imediata.',
  },
];

export const PILLAR_01_SPECIFIC_SIGNAL_CODES = [
  'self_avoidance',
  'denial_of_current_state',
  'functioning_without_feeling',
  'internalized_self_attack',
  'performance_to_belong',
  'self_invisibility',
  'body_held_tension',
  'automatic_escape',
  'return_to_self',
] as const;

export type Pillar01SpecificSignal = typeof PILLAR_01_SPECIFIC_SIGNAL_CODES[number];

export const PILLAR_01_PRIORITY_PRIMARY_SIGNALS: PrimarySignal[] = [
  'recognition',
  'uncertainty',
  'minimization',
  'self_judgment',
  'rigid_control',
  'avoidance',
  'ambivalence',
  'integration',
];

export const PILLAR_01_PRIORITY_SECONDARY_SIGNALS: SecondarySignal[] = [
  'control_through_performance',
  'worth_tied_to_productivity',
  'pain_normalization',
  'emptiness_avoidance',
  'need_for_approval',
  'silence_to_preserve_bond',
  'repetition_awareness',
  'coherent_positioning',
];

export const PILLAR_01_CONTRADICTIONS = [
  { visible_side: 'Eu estou funcionando.', hidden_tension: 'Mas não sei como estou.' },
  { visible_side: 'Eu sou assim.', hidden_tension: 'Talvez eu tenha precisado ficar assim.' },
  { visible_side: 'Não é nada demais.', hidden_tension: 'Meu corpo continua sustentando alguma coisa.' },
  { visible_side: 'Eu só preciso continuar.', hidden_tension: 'Continuar pode estar servindo para não sentir.' },
  { visible_side: 'Eu preciso resolver.', hidden_tension: 'Resolver rápido pode impedir o reconhecimento.' },
  { visible_side: 'Eu sou forte.', hidden_tension: 'Talvez eu não tenha encontrado espaço para parar.' },
  { visible_side: 'Eu não quero incomodar.', hidden_tension: 'Talvez eu tenha aprendido a desaparecer.' },
  { visible_side: 'Eu já superei.', hidden_tension: 'Talvez eu apenas tenha voltado a funcionar.' },
  { visible_side: 'Eu não sei o que sinto.', hidden_tension: 'Talvez eu ainda não tenha permanecido tempo suficiente.' },
];

export const PILLAR_01_PHASE_CONSCIOUSNESS: CompanionPhaseDefinition = {
  phase: 'consciousness',
  title: 'Reconhecer',
  purpose: 'Ajudar o leitor a perceber o estado presente, os sinais corporais e o momento em que começa a fugir de si.',
  canonical_section_id: 'p01_section_consciousness',
  question_ids: ['p01_q_cons_01', 'p01_q_cons_02', 'p01_q_cons_03'],
  micro_return_ids: ['p01_mr_cons_01', 'p01_mr_cons_02', 'p01_mr_cons_03', 'p01_mr_cons_04', 'p01_mr_cons_05', 'p01_mr_cons_06'],
  journal_prompt_ids: ['p01_journal_cons_01', 'p01_journal_cons_02'],
  minimum_depth: 1,
  maximum_depth: 2,
};

export const PILLAR_01_CONSCIOUSNESS_GOALS = [
  'Nomear o estado atual.',
  'Localizar um sinal no corpo.',
  'Reconhecer uma frase interna recorrente.',
  'Perceber o início da fuga.',
  'Diferenciar funcionamento de presença.',
  'Aceitar incerteza sem inventar explicação.',
];

export const PILLAR_01_PHASE_JUDGMENT: CompanionPhaseDefinition = {
  phase: 'judgment',
  title: 'Perceber o ataque',
  purpose: 'Ajudar o leitor a perceber as vozes de desprezo, cobrança moral e medo social usadas para controlar o próprio estado.',
  canonical_section_id: 'p01_section_judgment',
  question_ids: ['p01_q_judg_01', 'p01_q_judg_02', 'p01_q_judg_03'],
  micro_return_ids: ['p01_mr_judg_01', 'p01_mr_judg_02', 'p01_mr_judg_03', 'p01_mr_judg_04', 'p01_mr_judg_05', 'p01_mr_judg_06'],
  journal_prompt_ids: ['p01_journal_judg_01', 'p01_journal_judg_02'],
  minimum_depth: 1,
  maximum_depth: 2,
};

export const PILLAR_01_JUDGMENT_VOICES = [
  { code: 'contempt', title: 'Voz do desprezo', examples: ['Isso é drama.', 'Pare com isso.', 'Você é fraco.'] },
  { code: 'moral_demand', title: 'Voz da cobrança moral', examples: ['Você já deveria ter superado.', 'Você deveria ser melhor.', 'Você deveria ser grato.'] },
  { code: 'social_fear', title: 'Voz do medo social', examples: ['Se perceberem, você perderá espaço.', 'Se parar, tudo desmorona.', 'Se souberem, podem se afastar.'] },
];

export const PILLAR_01_JUDGMENT_GOALS = [
  'Separar estado de identidade.',
  'Perceber desprezo interno.',
  'Perceber cobrança moral.',
  'Perceber medo de exposição.',
  'Reconhecer o julgamento como mecanismo.',
  'Reduzir obediência automática ao ataque interno.',
];

export const PILLAR_01_PHASE_PRESENCE: CompanionPhaseDefinition = {
  phase: 'presence',
  title: 'Permanecer',
  purpose: 'Ajudar o leitor a permanecer consigo quando o estado interno é desconfortável, sem fuga, explicação ou correção imediata.',
  canonical_section_id: 'p01_section_presence',
  question_ids: ['p01_q_pres_01', 'p01_q_pres_02', 'p01_q_pres_03'],
  micro_return_ids: ['p01_mr_pres_01', 'p01_mr_pres_02', 'p01_mr_pres_03', 'p01_mr_pres_04', 'p01_mr_pres_05', 'p01_mr_pres_06'],
  journal_prompt_ids: ['p01_journal_pres_01', 'p01_journal_pres_02'],
  minimum_depth: 2,
  maximum_depth: 3,
};

export const PILLAR_01_PRESENCE_GOALS = [
  'Permitir contato breve com o estado.',
  'Reconhecer a vontade de fugir.',
  'Permanecer sem buscar solução.',
  'Usar uma frase de retorno.',
  'Perceber o corpo como evidência de presença.',
  'Formular um compromisso mínimo de não abandono.',
];

export const PILLAR_01_PHASES = [
  PILLAR_01_PHASE_CONSCIOUSNESS,
  PILLAR_01_PHASE_JUDGMENT,
  PILLAR_01_PHASE_PRESENCE,
];

export const PILLAR_01_QUESTION_MAP = [
  {
    id: 'p01_q_cons_01',
    phase: 'consciousness',
    canonical_section_id: 'p01_section_consciousness',
    function: 'identify_current_internal_state',
    semantic_goal: 'Reconhecer o que está pedindo para ser visto agora.',
    depth: 1,
  },
  {
    id: 'p01_q_cons_02',
    phase: 'consciousness',
    canonical_section_id: 'p01_section_consciousness',
    function: 'identify_body_signal',
    semantic_goal: 'Localizar no corpo o que ainda não encontrou linguagem.',
    depth: 1,
  },
  {
    id: 'p01_q_cons_03',
    phase: 'consciousness',
    canonical_section_id: 'p01_section_consciousness',
    function: 'identify_internal_sentence',
    semantic_goal: 'Reconhecer a frase interna que organiza o clima emocional.',
    depth: 2,
  },
  {
    id: 'p01_q_judg_01',
    phase: 'judgment',
    canonical_section_id: 'p01_section_judgment',
    function: 'identify_self_attack',
    semantic_goal: 'Reconhecer como o leitor reage contra si quando percebe desconforto.',
    depth: 1,
  },
  {
    id: 'p01_q_judg_02',
    phase: 'judgment',
    canonical_section_id: 'p01_section_judgment',
    function: 'identify_internalized_demand',
    semantic_goal: 'Identificar a cobrança usada para controlar o estado.',
    depth: 2,
  },
  {
    id: 'p01_q_judg_03',
    phase: 'judgment',
    canonical_section_id: 'p01_section_judgment',
    function: 'identify_social_exposure_fear',
    semantic_goal: 'Perceber o que o leitor teme que aconteça se o estado for visto.',
    depth: 2,
  },
  {
    id: 'p01_q_pres_01',
    phase: 'presence',
    canonical_section_id: 'p01_section_presence',
    function: 'identify_possible_presence_duration',
    semantic_goal: 'Definir quanto tempo de contato é possível sem sobrecarga.',
    depth: 2,
  },
  {
    id: 'p01_q_pres_02',
    phase: 'presence',
    canonical_section_id: 'p01_section_presence',
    function: 'select_return_phrase',
    semantic_goal: 'Encontrar uma frase concreta de retorno ao estado presente.',
    depth: 2,
  },
  {
    id: 'p01_q_pres_03',
    phase: 'presence',
    canonical_section_id: 'p01_section_presence',
    function: 'formulate_non_abandonment_position',
    semantic_goal: 'Formular um compromisso mínimo de permanência consigo.',
    depth: 3,
  },
] as const;

const microReturnFunctions: MicroReturnFunction[] = ['recognition', 'contradiction', 'protection', 'cost', 'permission', 'presence'];

export const PILLAR_01_MICRO_RETURN_MAP = {
  consciousness: microReturnFunctions.map((item, index) => ({
    id: `p01_mr_cons_${String(index + 1).padStart(2, '0')}`,
    function: item,
  })),
  judgment: microReturnFunctions.map((item, index) => ({
    id: `p01_mr_judg_${String(index + 1).padStart(2, '0')}`,
    function: item,
  })),
  presence: microReturnFunctions.map((item, index) => ({
    id: `p01_mr_pres_${String(index + 1).padStart(2, '0')}`,
    function: item,
  })),
} as const;

export const PILLAR_01_JOURNAL_MAP = [
  { id: 'p01_journal_cons_01', phase: 'consciousness', title: 'O que está aqui agora', semantic_goal: 'Nomear o estado sem explicar sua origem.' },
  { id: 'p01_journal_cons_02', phase: 'consciousness', title: 'O corpo antes da explicação', semantic_goal: 'Registrar sensações corporais sem interpretação.' },
  { id: 'p01_journal_judg_01', phase: 'judgment', title: 'A frase usada contra mim', semantic_goal: 'Identificar a sentença interna recorrente.' },
  { id: 'p01_journal_judg_02', phase: 'judgment', title: 'O que temo que percebam', semantic_goal: 'Reconhecer o medo social ligado à exposição.' },
  { id: 'p01_journal_pres_01', phase: 'presence', title: 'Um minuto sem fuga', semantic_goal: 'Registrar o que aparece durante uma permanência breve.' },
  { id: 'p01_journal_pres_02', phase: 'presence', title: 'O que não quero mais abandonar', semantic_goal: 'Formular um compromisso mínimo de retorno a si.' },
] as const;

export const PILLAR_01_GUIDED_LETTER_MAP = [
  {
    id: 'p01_letter_recognition',
    type: 'recognition',
    title: 'À parte de mim que ficou esperando',
    purpose: 'Reconhecer um estado, necessidade ou parte de si que permaneceu ignorada.',
    canonical_relation: 'Companheira da seção Carta de Sustentação, sem substituí-la.',
  },
  {
    id: 'p01_letter_confrontation',
    type: 'confrontation',
    title: 'À voz que me mantém em movimento',
    purpose: 'Diferenciar proteção, cobrança e custo do ataque interno.',
    canonical_relation: 'Relacionada à seção Julgamento.',
  },
  {
    id: 'p01_letter_presence',
    type: 'presence',
    title: 'Eu volto do jeito que consigo',
    purpose: 'Formular uma presença possível sem prometer mudança total.',
    canonical_relation: 'Relacionada às seções Presença e Carta de Sustentação.',
  },
] as const;

export const PILLAR_01_ANCHOR_MAP = [
  {
    id: 'p01_anchor_observe',
    type: 'observe',
    title: 'Perceber a fuga',
    instruction: 'Quando surgir vontade de mudar de assunto, abrir outra tela ou começar uma tarefa, apenas nomeie: vontade de fugir.',
    relation_to_canonical_anchor: 'Complementa a etapa Chegada.',
  },
  {
    id: 'p01_anchor_name',
    type: 'name',
    title: 'Nomear sem explicar',
    instruction: 'Complete apenas: agora existe em mim... e use uma palavra ou sensação.',
    relation_to_canonical_anchor: 'Complementa a etapa Nomeação.',
  },
  {
    id: 'p01_anchor_position',
    type: 'position',
    title: 'Ficar um pouco mais',
    instruction: 'Permaneça alguns segundos antes de buscar uma solução e use uma frase simples de retorno.',
    relation_to_canonical_anchor: 'Complementa a etapa Permanência.',
  },
] as const;

export const PILLAR_01_CANONICAL_RITUAL = {
  canonical_section_id: 'p01_section_anchor',
  title: 'O Ritual do Reconhecimento',
  duration_days: 7,
  steps: [
    { order: 1, code: 'arrival', title: 'Chegada', purpose: 'Interromper o movimento e chegar ao momento atual.' },
    { order: 2, code: 'naming', title: 'Nomeação', purpose: 'Nomear o estado e sua manifestação corporal.' },
    { order: 3, code: 'remaining', title: 'Permanência', purpose: 'Sustentar presença diante do estado e do julgamento.' },
    { order: 4, code: 'mirroring', title: 'Espelhamento', purpose: 'Reconhecer o que vem sendo evitado sem enfeitar ou defender.' },
  ],
  rule: 'O ritual canônico deve ser apresentado como conteúdo do livro. As âncoras do agente apenas facilitam sua realização.',
};

export const PILLAR_01_PREDICTIVE_RULES: PillarPredictiveRule[] = [
  {
    id: 'p01_rule_deepening_01',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'deepening',
    title: 'Do funcionamento ao estado',
    description: 'Quando o leitor descreve apenas tarefas e desempenho, direcionar para o estado presente.',
    conditions: [
      { field: 'pillar_specific_signal', operator: 'contains', value: 'functioning_without_feeling' },
      { field: 'load_level', operator: 'less_or_equal', value: 2 },
    ],
    action: { action: 'select_question', content_id: 'p01_q_cons_01' },
    priority: 70,
    active: true,
  },
  {
    id: 'p01_rule_deepening_02',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'deepening',
    title: 'Do abstrato ao corpo',
    description: 'Quando a resposta permanece excessivamente racional, direcionar para uma sensação corporal concreta.',
    conditions: [
      { field: 'primary_signal', operator: 'equals', value: 'rigid_control' },
      { field: 'phase', operator: 'equals', value: 'consciousness' },
    ],
    action: { action: 'select_question', content_id: 'p01_q_cons_02' },
    priority: 75,
    active: true,
  },
  {
    id: 'p01_rule_deepening_03',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'deepening',
    title: 'Da frase à função',
    description: 'Quando o leitor identifica uma sentença interna, explorar como ela controla seu comportamento.',
    conditions: [
      { field: 'pillar_specific_signal', operator: 'contains', value: 'internalized_self_attack' },
      { field: 'readiness_level', operator: 'greater_or_equal', value: 2 },
    ],
    action: { action: 'advance_phase', target_phase: 'judgment' },
    priority: 65,
    active: true,
  },
  {
    id: 'p01_rule_protection_01',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'protection',
    title: 'Interromper sobrecarga',
    description: 'Quando o contato elevar a carga, bloquear aprofundamento e oferecer pausa.',
    conditions: [{ field: 'load_level', operator: 'greater_or_equal', value: 3 }],
    action: { action: 'pause' },
    priority: 100,
    active: true,
  },
  {
    id: 'p01_rule_protection_02',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'protection',
    title: 'Não forçar origem',
    description: 'Quando o leitor reconhece o estado, mas não sabe sua origem, permanecer no presente.',
    conditions: [
      { field: 'primary_signal', operator: 'equals', value: 'uncertainty' },
      { field: 'phase', operator: 'equals', value: 'consciousness' },
    ],
    action: { action: 'select_micro_return', content_id: 'p01_mr_cons_05' },
    priority: 80,
    active: true,
  },
  {
    id: 'p01_rule_protection_03',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'protection',
    title: 'Trocar pergunta por presença',
    description: 'Quando duas perguntas consecutivas aumentarem evitação, trocar para âncora ou encerramento.',
    conditions: [
      { field: 'primary_signal', operator: 'equals', value: 'avoidance' },
      { field: 'recent_intervention', operator: 'equals', value: 'question' },
    ],
    action: { action: 'select_anchor', content_id: 'p01_anchor_observe' },
    priority: 85,
    active: true,
  },
  {
    id: 'p01_rule_integration_01',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'integration',
    title: 'Reconhecimento sem ataque',
    description: 'Quando o leitor nomeia um estado sem autocondenação dominante, permitir avanço para presença.',
    conditions: [
      { field: 'primary_signal', operator: 'equals', value: 'recognition' },
      { field: 'presence_level', operator: 'greater_or_equal', value: 2 },
      { field: 'load_level', operator: 'less_or_equal', value: 2 },
    ],
    action: { action: 'advance_phase', target_phase: 'presence' },
    priority: 60,
    active: true,
  },
  {
    id: 'p01_rule_integration_02',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'integration',
    title: 'Registrar retorno a si',
    description: 'Quando o leitor formula uma frase ou gesto de permanência, atualizar a memória do pilar.',
    conditions: [
      { field: 'pillar_specific_signal', operator: 'contains', value: 'return_to_self' },
      { field: 'evidence_count', operator: 'greater_or_equal', value: 2 },
    ],
    action: { action: 'create_open_thread' },
    priority: 55,
    active: true,
  },
  {
    id: 'p01_rule_integration_03',
    pillar_id: 'pillar_01_reconhecimento',
    category: 'integration',
    title: 'Conectar reconhecimento e repetição',
    description: 'Quando o leitor identifica que uma forma de fuga reaparece em outro contexto, permitir conexão futura entre pilares.',
    conditions: [
      { field: 'secondary_signal', operator: 'contains', value: 'repetition_awareness' },
      { field: 'source_count', operator: 'greater_or_equal', value: 2 },
    ],
    action: { action: 'connect_pillar' },
    priority: 50,
    active: true,
  },
];

export const PILLAR_01_TRANSITION_RULES: PillarTransitionRule[] = [
  {
    id: 'p01_transition_primary_p02',
    source_pillar_id: 'pillar_01_reconhecimento',
    target_pillar_id: 'pillar_02_familia',
    priority: 'primary',
    shared_primary_signals: ['self_judgment', 'external_judgment', 'avoidance'],
    shared_secondary_signals: ['silence_to_preserve_bond', 'need_for_approval'],
    shared_pillar_signals: ['performance_to_belong', 'self_invisibility'],
    transition_reason: 'A presença editada pode ter sido aprendida nos primeiros ambientes de pertencimento.',
    visible_transition_text: 'O que você começou a reconhecer em si pode reaparecer no modo como aprendeu a pertencer à própria família.',
    minimum_confidence: 'medium',
    minimum_depth: 2,
    reader_confirmation_required: false,
    optional: true,
    active: true,
  },
  {
    id: 'p01_transition_primary_p05',
    source_pillar_id: 'pillar_01_reconhecimento',
    target_pillar_id: 'pillar_05_dor',
    priority: 'primary',
    shared_primary_signals: ['avoidance', 'self_judgment', 'rigid_control'],
    shared_secondary_signals: ['pain_normalization', 'emptiness_avoidance'],
    shared_pillar_signals: ['automatic_escape', 'functioning_without_feeling'],
    transition_reason: 'A fuga reconhecida no Pilar I pode assumir formas mais específicas de anestesia no Pilar Dor.',
    visible_transition_text: 'Aquilo que aqui apareceu como fuga pode reaparecer mais adiante como tentativa de anestesiar o que ainda permanece vivo.',
    minimum_confidence: 'medium',
    minimum_depth: 2,
    reader_confirmation_required: false,
    optional: true,
    active: true,
  },
  {
    id: 'p01_transition_primary_p09',
    source_pillar_id: 'pillar_01_reconhecimento',
    target_pillar_id: 'pillar_09_vazio',
    priority: 'primary',
    shared_primary_signals: ['avoidance', 'integration', 'recognition'],
    shared_secondary_signals: ['emptiness_avoidance', 'coherent_positioning'],
    shared_pillar_signals: ['return_to_self'],
    transition_reason: 'O primeiro retorno a si se relaciona ao compromisso final de continuidade interna.',
    visible_transition_text: 'O retorno que começa aqui encontra seu movimento mais profundo no compromisso de não desaparecer de si.',
    minimum_confidence: 'medium',
    minimum_depth: 3,
    reader_confirmation_required: true,
    optional: true,
    active: true,
  },
  {
    id: 'p01_transition_secondary_p04',
    source_pillar_id: 'pillar_01_reconhecimento',
    target_pillar_id: 'pillar_04_trabalho',
    priority: 'secondary',
    shared_primary_signals: ['rigid_control', 'self_judgment'],
    shared_secondary_signals: ['control_through_performance', 'worth_tied_to_productivity'],
    shared_pillar_signals: ['functioning_without_feeling'],
    transition_reason: 'O funcionamento usado como fuga pode reaparecer no trabalho como desempenho compulsório.',
    visible_transition_text: 'O movimento de continuar funcionando pode reaparecer no trabalho como necessidade de provar valor.',
    minimum_confidence: 'medium',
    minimum_depth: 2,
    reader_confirmation_required: false,
    optional: true,
    active: true,
  },
  {
    id: 'p01_transition_secondary_p07',
    source_pillar_id: 'pillar_01_reconhecimento',
    target_pillar_id: 'pillar_07_fe',
    priority: 'secondary',
    shared_primary_signals: ['uncertainty', 'avoidance', 'minimization'],
    shared_secondary_signals: ['faith_conflict', 'emptiness_avoidance'],
    shared_pillar_signals: ['denial_of_current_state'],
    transition_reason: 'A dificuldade de permanecer diante do não saber pode reaparecer no campo da fé e do sentido.',
    visible_transition_text: 'A capacidade de sustentar o que ainda não tem resposta pode reaparecer quando a obra chegar ao campo da fé.',
    minimum_confidence: 'high',
    minimum_depth: 3,
    reader_confirmation_required: true,
    optional: true,
    active: true,
  },
  {
    id: 'p01_transition_secondary_p08',
    source_pillar_id: 'pillar_01_reconhecimento',
    target_pillar_id: 'pillar_08_escassez',
    priority: 'secondary',
    shared_primary_signals: ['self_judgment', 'rigid_control'],
    shared_secondary_signals: ['scarcity_vigilance', 'worth_tied_to_productivity'],
    shared_pillar_signals: ['internalized_self_attack', 'functioning_without_feeling'],
    transition_reason: 'A cobrança interna pode se intensificar quando a vida parece estreita ou insuficiente.',
    visible_transition_text: 'A frase interna reconhecida aqui pode reaparecer quando a falta começa a ser tratada como prova de fracasso.',
    minimum_confidence: 'high',
    minimum_depth: 3,
    reader_confirmation_required: true,
    optional: true,
    active: true,
  },
];

export const PILLAR_01_PHASE_PROGRESSION = {
  consciousness_to_judgment: {
    minimum_awareness: 2,
    minimum_readiness: 2,
    maximum_load: 2,
    require_any: ['current_state_named', 'body_signal_named', 'internal_sentence_recognized', 'escape_movement_recognized'],
  },
  judgment_to_presence: {
    minimum_awareness: 2,
    minimum_presence: 2,
    minimum_readiness: 2,
    maximum_load: 2,
    require_any: ['self_attack_recognized', 'moral_demand_recognized', 'social_fear_recognized', 'judgment_seen_as_mechanism'],
  },
  pillar_completion: {
    content_progress_minimum: 90,
    require_any: ['state_recognized', 'escape_recognized', 'internal_sentence_recognized', 'return_phrase_selected', 'minimum_presence_formulated', 'reader_chose_to_close'],
  },
};

export const PILLAR_01_MEMORY_PRIORITIES = [
  'Frases usadas pelo leitor contra si.',
  'Sensações corporais recorrentes.',
  'Modos automáticos de fuga.',
  'Situações em que continua funcionando sem contato.',
  'Medos ligados a ser visto parado ou vulnerável.',
  'Frases de retorno escolhidas pelo leitor.',
  'Compromissos mínimos de não abandono.',
  'Correções feitas pelo leitor às interpretações do agente.',
  'Reconhecimento de repetição em outros contextos.',
];

export const PILLAR_01_MEMORY_RESTRICTIONS = [
  'Não salvar sensações corporais como condição clínica.',
  'Não transformar uma frase interna em identidade.',
  'Não recuperar conteúdo de alta carga sem necessidade.',
  'Não presumir origem familiar.',
  'Não classificar distração isolada como fuga.',
  'Não transformar ausência de resposta em evitação.',
];

export type Pillar01CompletionSummary = {
  current_state_recognized?: string;
  body_signal_recognized?: string;
  internal_sentence_recognized?: string;
  escape_movement_recognized?: string;
  judgment_mechanism_recognized?: string;
  return_phrase_selected?: string;
  minimum_presence_defined?: string;
  dominant_primary_signals: PrimarySignal[];
  dominant_secondary_signals: SecondarySignal[];
  pillar_specific_signals: Pillar01SpecificSignal[];
  open_thread_ids: string[];
  reader_chose_to_close: boolean;
  ready_for_cross_pillar_connection: boolean;
};

export const PILLAR_01_COMPANION_BASE = {
  layer: 'igent_companion' as const,
  id: 'igent_package_pillar_01_reconhecimento',
  pillar_id: 'pillar_01_reconhecimento' as PillarId,
  canonical_unit_id: 'unit_pillar_01_reconhecimento',
  canonical_version: '2026-06-25',
  editorial_identity: PILLAR_01_COMPANION_IDENTITY,
  phases: PILLAR_01_PHASES,
  canonical_references: [
    ...PILLAR_01_CONSCIOUSNESS_REFERENCES,
    ...PILLAR_01_JUDGMENT_REFERENCES,
    ...PILLAR_01_PRESENCE_REFERENCES,
    ...PILLAR_01_MICRO_RETURN_REFERENCES,
  ],
  questions: PILLAR_01_ALL_QUESTIONS,
  phase_question_ids: {
    consciousness: PILLAR_01_CONSCIOUSNESS_QUESTIONS.map((question) => question.id),
    judgment: PILLAR_01_JUDGMENT_QUESTIONS.map((question) => question.id),
    presence: PILLAR_01_PRESENCE_QUESTIONS.map((question) => question.id),
  },
  question_map: PILLAR_01_QUESTION_MAP,
  micro_returns: PILLAR_01_MICRO_RETURNS,
  micro_return_package: PILLAR_01_MICRO_RETURN_PACKAGE,
  journal_map: PILLAR_01_JOURNAL_MAP,
  journal_prompts: PILLAR_01_JOURNAL_PROMPTS,
  journal_package: PILLAR_01_JOURNAL_PACKAGE,
  journal_display_rules: JOURNAL_DISPLAY_RULES,
  guided_letter_map: PILLAR_01_GUIDED_LETTER_MAP,
  guided_letters: PILLAR_01_GUIDED_LETTERS,
  guided_letter_package: PILLAR_01_GUIDED_LETTER_PACKAGE,
  guided_letter_display_rules: GUIDED_LETTER_DISPLAY_RULES,
  anchor_map: PILLAR_01_ANCHOR_MAP,
  anchors: PILLAR_01_ANCHORS,
  anchor_package: PILLAR_01_ANCHOR_PACKAGE,
  anchor_display_rules: ANCHOR_DISPLAY_RULES,
  anchor_reuse_rules: ANCHOR_REUSE_RULES,
  closure_package: PILLAR_01_CLOSURE_PACKAGE,
  closure_routes: PILLAR_01_CLOSURE_ROUTES,
  closure_actions: PILLAR_01_CLOSURE_ACTIONS,
  closure_transition: PILLAR_01_CLOSURE_TRANSITION,
  next_canonical_unit: PILLAR_01_NEXT_CANONICAL_UNIT,
  predictive_rules: PILLAR_01_PREDICTIVE_RULES,
  transition_rules: PILLAR_01_TRANSITION_RULES,
  judgment_progression: PILLAR_01_JUDGMENT_PROGRESSION,
  presence_progression: PILLAR_01_PRESENCE_PROGRESSION,
  micro_return_reuse_rules: MICRO_RETURN_REUSE_RULES,
  block_10_final_rules: BLOCK_10_FINAL_RULES,
  block_11_final_rules: BLOCK_11_FINAL_RULES,
  block_12_final_rules: BLOCK_12_FINAL_RULES,
  block_13_final_rules: BLOCK_13_FINAL_RULES,
  block_14_final_rules: BLOCK_14_FINAL_RULES,
  block_15_final_rules: BLOCK_15_FINAL_RULES,
  block_16_final_rules: BLOCK_16_FINAL_RULES,
  block_17_final_rules: BLOCK_17_FINAL_RULES,
  version: '2.0.0',
  status: 'approved' as const,
};

export const PILLAR_01_FINAL_RULES = [
  'Pillar I is Reconhecimento, not Vínculo.',
  'Vínculo is the theme of the opening manifesto and the return to oneself.',
  'The primary focus is self-recognition, not dependence on other people.',
  'The agent must start from the present state before searching for causes.',
  'Body signals are observations, not diagnoses.',
  'Automatic escape must be treated as protection before being treated as cost.',
  'Recognition does not require explanation.',
  'Recognition does not require immediate change.',
  'Presence means remaining without self-attack.',
  'The reader may skip every reflective interaction.',
  'The reader may complete the pillar without reaching integration.',
  'The agent must never present generated text as canonical book content.',
];
