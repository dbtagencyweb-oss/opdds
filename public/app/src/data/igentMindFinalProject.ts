// Generated from the iGentMIND final publication package.
// This is the frontend bridge used by the interactive triage flow.

export type FinalMindPhase = 'consciousness' | 'judgment' | 'presence';

export type FinalMindPillar = {
  ordinal: number;
  id: string;
  title: string;
  triad: 'Sobrevivência' | 'Reconstrução' | 'Continuidade';
  internalTitle: string;
  subtitle: string;
  opening: string;
  threshold: string;
  thesis: string;
  centralMovement: string;
  nextExperience: string;
  canonicalException?: string;
  canonicalSections: Array<{ order: number; kind: string; title: string; pages: string }>;
  signals: string[];
  secondary: string[];
  transitions: string[];
  questions: Record<FinalMindPhase, string[]>;
  journals: string[];
  letters: string[];
  anchors: string[];
  editorialLimits?: string[];
};

export const FINAL_MIND_PILLARS = [
  {
    "ordinal": 1,
    "id": "pillar_01_reconhecimento",
    "title": "Reconhecimento",
    "triad": "Sobrevivência",
    "internalTitle": "Pilar I — Reconhecimento",
    "subtitle": "Onde a negação cessa.",
    "opening": "Onde a pressa de se explicar perde força.",
    "threshold": "Limiar",
    "thesis": "Reconhecer o que existe antes de tentar corrigir, justificar ou transformar em performance.",
    "centralMovement": "Parar de fugir do ponto real e nomear o que já apareceu.",
    "nextExperience": "pillar_02_familia",
    "signals": [
      "recognition",
      "uncertainty",
      "minimization",
      "self_judgment",
      "external_judgment",
      "rigid_control",
      "avoidance",
      "ambivalence",
      "integration"
    ],
    "secondary": [
      "repetition_awareness",
      "pain_normalization",
      "coherent_positioning"
    ],
    "transitions": [
      "pillar_02_familia",
      "pillar_05_dor",
      "pillar_09_vazio"
    ],
    "questions": {
      "consciousness": [
        "O que em mim precisa ser reconhecido antes de ser consertado?",
        "Onde eu já sei, mas ainda tento não saber?",
        "Que parte da minha vida pede nome antes de explicação?"
      ],
      "judgment": [
        "Que acusação aparece quando reconheço isso?",
        "O que tento proteger quando nego ou minimizo esse ponto?",
        "Qual frase interna transforma reconhecimento em ameaça?"
      ],
      "presence": [
        "Como posso permanecer com essa verdade sem resolver tudo agora?",
        "Que gesto mínimo respeita o que eu reconheci?",
        "O que muda quando eu paro de lutar contra o fato de que isso existe?"
      ]
    },
    "journals": [
      "O que eu já sei",
      "O ponto que evito nomear",
      "A acusação interna",
      "O custo de continuar negando",
      "Uma verdade pequena",
      "Reconhecer sem resolver"
    ],
    "letters": [
      "À parte de mim que já sabia",
      "À defesa que tentou me proteger",
      "À presença que começa sem espetáculo"
    ],
    "anchors": [
      "Observar sem corrigir",
      "Nomear em voz baixa",
      "Permanecer um pouco mais"
    ],
    "canonicalSections": []
  },
  {
    "ordinal": 2,
    "id": "pillar_02_familia",
    "title": "Família",
    "triad": "Sobrevivência",
    "internalTitle": "Pilar II — Família",
    "subtitle": "Onde aprendemos a nos calar.",
    "opening": "Nem todo silêncio é paz. Alguns são sobrevivência antiga.",
    "threshold": "Herança",
    "thesis": "Reconhecer papéis, lealdades e silêncios familiares sem diagnosticar pessoas nem impor ruptura ou reconciliação.",
    "centralMovement": "Diferenciar pertencimento de desaparecimento.",
    "nextExperience": "pillar_03_luto",
    "signals": [
      "silence_to_preserve_bond",
      "role_exhaustion",
      "need_for_approval",
      "guilt_for_setting_limits",
      "inherited_fear",
      "conflict_avoidance",
      "belonging_without_erasure",
      "boundary_presence",
      "adult_voice_recovery"
    ],
    "secondary": [
      "silence_to_preserve_bond",
      "need_for_approval",
      "guilt_for_setting_limits"
    ],
    "transitions": [
      "pillar_01_reconhecimento",
      "pillar_04_trabalho",
      "pillar_06_desejo"
    ],
    "questions": {
      "consciousness": [
        "Na família, qual papel eu aprendi a ocupar para continuar pertencendo?",
        "Onde meu silêncio começou como proteção?",
        "Que parte de mim ainda pede autorização para existir?"
      ],
      "judgment": [
        "Que culpa aparece quando tento ocupar outro lugar?",
        "Que medo surge quando imagino dizer a verdade?",
        "Onde confundo limite com abandono?"
      ],
      "presence": [
        "Como pertencer sem desaparecer?",
        "Que frase adulta posso sustentar sem atacar ninguém?",
        "Que presença minha não precisa mais pedir licença?"
      ]
    },
    "journals": [
      "O papel que aprendi",
      "O silêncio que me organizou",
      "A culpa diante do limite",
      "O medo de decepcionar",
      "Pertencer sem sumir",
      "Minha voz adulta"
    ],
    "letters": [
      "À criança que aprendeu a se calar",
      "À lealdade que virou prisão",
      "À presença que volta a ter lugar"
    ],
    "anchors": [
      "Observar o papel",
      "Nomear a lealdade",
      "Posicionar a voz adulta"
    ],
    "canonicalSections": []
  },
  {
    "ordinal": 3,
    "id": "pillar_03_luto",
    "title": "Luto",
    "triad": "Sobrevivência",
    "internalTitle": "Pilar III — Luto, Ausência & Quebra de Laços",
    "subtitle": "Quando a ausência permanece.",
    "opening": "Nem toda perda termina quando alguém parte. Algumas continuam vivendo dentro de nós.",
    "threshold": "Vazio",
    "thesis": "Reconhecer perdas concretas, simbólicas e relacionais que continuam operando no presente, sem exigir encerramento, explicação definitiva ou apagamento do vínculo.",
    "centralMovement": "Nomear a ausência, reduzir a cobrança temporal e continuar sem apagar o que existiu.",
    "nextExperience": "caderno_presenca_sobrevivencia",
    "canonicalException": "",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Luto",
        "pages": "154"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Vazio",
        "pages": "155"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "O que continua doendo depois que tudo já aconteceu",
        "pages": "156–158"
      },
      {
        "order": 4,
        "kind": "narrative",
        "title": "O luto que não teve corpo para cair",
        "pages": "159–161"
      },
      {
        "order": 5,
        "kind": "consciousness",
        "title": "O que continua faltando mesmo quando a vida seguiu",
        "pages": "161–163"
      },
      {
        "order": 6,
        "kind": "judgment",
        "title": "Quando sentir saudade vira atraso",
        "pages": "163–164"
      },
      {
        "order": 7,
        "kind": "presence",
        "title": "Ficar com o vazio sem transformá-lo em fuga",
        "pages": "165–166"
      },
      {
        "order": 8,
        "kind": "support_letter",
        "title": "A quem está cansado de provar",
        "pages": "166–167"
      },
      {
        "order": 9,
        "kind": "anchor",
        "title": "O ritual do nome não dito",
        "pages": "167"
      },
      {
        "order": 10,
        "kind": "closing",
        "title": "Nem toda perda se fecha. Mas toda perda ignorada cobra.",
        "pages": "167–168"
      }
    ],
    "signals": [
      "p03_absence_still_active",
      "p03_unritualized_loss",
      "p03_functional_suspension",
      "p03_grief_timeline_pressure",
      "p03_longing_shame",
      "p03_strength_obligation",
      "p03_allowing_absence",
      "p03_non_replacement_capacity",
      "p03_integration_without_erasure"
    ],
    "secondary": [
      "p03_absence_still_active",
      "p03_unritualized_loss",
      "p03_functional_suspension"
    ],
    "transitions": [
      "caderno_presenca_sobrevivencia",
      "pillar_02",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "Que ausência continua aparecendo em momentos comuns da minha vida?",
        "Que perda eu precisei atravessar sem ter espaço para parar?",
        "Onde eu continuo funcionando enquanto uma parte de mim permanece suspensa?"
      ],
      "judgment": [
        "O que eu digo a mim mesmo quando percebo que essa ausência ainda dói?",
        "Que vergonha aparece quando sinto saudade, falta ou ambivalência?",
        "O que acredito que aconteceria se eu deixasse de parecer forte diante dessa perda?"
      ],
      "presence": [
        "O que eu consigo reconhecer nessa ausência sem tentar preenchê-la agora?",
        "Que espaço posso permitir que exista sem substituir imediatamente o que foi perdido?",
        "Como posso continuar sem apagar o que essa perda significou?"
      ]
    },
    "journals": [
      "A ausência que aparece no cotidiano",
      "O que não teve espaço para cair",
      "O prazo que imponho à saudade",
      "A força que não pôde parar",
      "Um lugar para a falta",
      "Continuar sem apagar"
    ],
    "letters": [
      "À ausência que continua aparecendo",
      "À parte de mim que acha que já deveria ter passado",
      "Ao que ficou e ao que ainda pode continuar"
    ],
    "anchors": [
      "Nomear sem contar toda a história",
      "Separar tempo de cobrança",
      "Ficar sem preencher"
    ],
    "editorialLimits": [
      "Não impor etapas universais do luto.",
      "Não estabelecer prazo correto para deixar de sentir.",
      "Não exigir despedida, perdão, reconciliação ou encerramento.",
      "Não afirmar que toda tristeza representa luto.",
      "Não transformar a permanência da dor em diagnóstico ou traço permanente."
    ]
  },
  {
    "ordinal": 4,
    "id": "pillar_04_trabalho",
    "title": "Trabalho",
    "triad": "Reconstrução",
    "internalTitle": "Pilar IV — Trabalho, Valor & Identidade",
    "subtitle": "Quando produzir deixa de significar existir.",
    "opening": "O trabalho pode construir patrimônio. Nunca deveria consumir a própria presença.",
    "threshold": "Peso",
    "thesis": "Separar valor pessoal de utilidade, desempenho e produtividade, sem desvalorizar trabalho, responsabilidade ou ambição.",
    "centralMovement": "Voltar a produzir como expressão e sustento, não como prova contínua de merecimento.",
    "nextExperience": "pillar_05_dor",
    "canonicalException": "",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Trabalho",
        "pages": "173"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Peso",
        "pages": "174"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "Quando produzir vira a única forma de existir",
        "pages": "175–177"
      },
      {
        "order": 4,
        "kind": "narrative",
        "title": "Aprender a não sentir",
        "pages": "177–179"
      },
      {
        "order": 5,
        "kind": "consciousness",
        "title": "Onde eu confundi valor com desempenho",
        "pages": "180–181"
      },
      {
        "order": 6,
        "kind": "judgment",
        "title": "Quando descansar vira falha moral",
        "pages": "181–182"
      },
      {
        "order": 7,
        "kind": "presence",
        "title": "Existir mesmo quando não há entrega",
        "pages": "183–184"
      },
      {
        "order": 8,
        "kind": "support_letter",
        "title": "Para quem só se sente válido quando entrega",
        "pages": "184–185"
      },
      {
        "order": 9,
        "kind": "anchor",
        "title": "O exercício da pausa não negociada",
        "pages": "185"
      },
      {
        "order": 10,
        "kind": "closing",
        "title": "O exercício da pausa não negociada",
        "pages": "186"
      }
    ],
    "signals": [
      "p04_value_performance_fusion",
      "p04_productive_avoidance",
      "p04_rest_discomfort",
      "p04_rest_guilt",
      "p04_failure_shame",
      "p04_help_weakness_judgment",
      "p04_nonproductive_presence",
      "p04_sustainable_effort",
      "p04_value_without_output"
    ],
    "secondary": [
      "p04_value_performance_fusion",
      "p04_productive_avoidance",
      "p04_rest_discomfort"
    ],
    "transitions": [
      "pillar_05_dor",
      "pillar_03",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "Onde eu preciso produzir para sentir que mereço estar aqui?",
        "O que acontece dentro de mim quando não tenho nada para mostrar?",
        "Onde uso o trabalho para não entrar em contato com outra coisa?"
      ],
      "judgment": [
        "Que acusação aparece quando eu descanso?",
        "O que um erro parece provar sobre quem eu sou?",
        "Que parte de mim condena pedir ajuda?"
      ],
      "presence": [
        "O que consigo sustentar sem transformar pausa em culpa?",
        "Que limite protege meu trabalho sem me apagar?",
        "Como seria produzir sem usar cada entrega como prova de valor?"
      ]
    },
    "journals": [
      "O que tento provar quando produzo",
      "O corpo quando não há entrega",
      "A frase que transforma descanso em culpa",
      "O erro que virou identidade",
      "Uma pausa sem justificativa",
      "Trabalho como parte, não centro"
    ],
    "letters": [
      "À parte de mim que só se reconhece quando entrega",
      "Ao juiz que transforma cada resultado em veredicto",
      "Ao trabalho que quero manter sem desaparecer dentro dele"
    ],
    "anchors": [
      "Perceber o impulso de provar",
      "Separar responsabilidade de crueldade",
      "Existir por cinco minutos sem entrega"
    ],
    "editorialLimits": [
      "Não transformar trabalho intenso em diagnóstico.",
      "Não romantizar improdutividade nem precariedade.",
      "Não prescrever abandono profissional.",
      "Não afirmar que todo esforço é fuga.",
      "Não reduzir responsabilidade a autoagressão."
    ]
  },
  {
    "ordinal": 5,
    "id": "pillar_05_dor",
    "title": "Dor",
    "triad": "Reconstrução",
    "internalTitle": "Pilar V — Dor, Fuga & Anestesia",
    "subtitle": "Aquilo que ainda permanece vivo.",
    "opening": "A dor não revela fraqueza. Revela exatamente onde a vida ainda insiste em existir.",
    "threshold": "Escape",
    "thesis": "Reconhecer fuga e anestesia como tentativas de alívio, sem moralizar o mecanismo nem retirar responsabilidade pelas consequências.",
    "centralMovement": "Criar um intervalo pequeno entre impulso e ação para devolver escolha.",
    "nextExperience": "pillar_06_desejo",
    "canonicalException": "",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Dor",
        "pages": "189"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Escape",
        "pages": "190"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "Quando sentir vira perigo e escapar vira habilidade",
        "pages": "191–194"
      },
      {
        "order": 4,
        "kind": "narrative",
        "title": "O ciclo do alívio que nunca fecha",
        "pages": "194–197"
      },
      {
        "order": 5,
        "kind": "consciousness",
        "title": "O que eu evito sentir quando fujo",
        "pages": "197–198"
      },
      {
        "order": 6,
        "kind": "judgment",
        "title": "Quando anestesiar vira crime interno",
        "pages": "199–200"
      },
      {
        "order": 7,
        "kind": "presence",
        "title": "Ficar alguns segundos a mais antes de escapar",
        "pages": "200–201"
      },
      {
        "order": 8,
        "kind": "support_letter",
        "title": "Para quem aprendeu a sobreviver saindo de si",
        "pages": "202"
      },
      {
        "order": 9,
        "kind": "anchor",
        "title": "Microação de confiança",
        "pages": "203"
      },
      {
        "order": 10,
        "kind": "closing",
        "title": "A fuga te manteve vivo; a presença te devolve",
        "pages": "204"
      }
    ],
    "signals": [
      "p05_escape_trigger",
      "p05_relief_memory",
      "p05_automatic_anesthesia",
      "p05_escape_shame",
      "p05_control_moralization",
      "p05_self_punishment_cycle",
      "p05_delay_before_escape",
      "p05_choice_restored",
      "p05_tolerable_contact"
    ],
    "secondary": [
      "p05_escape_trigger",
      "p05_relief_memory",
      "p05_automatic_anesthesia"
    ],
    "transitions": [
      "pillar_06_desejo",
      "pillar_04",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "O que costuma acontecer imediatamente antes de eu querer sair de mim?",
        "Que tipo de alívio meu corpo aprendeu a procurar?",
        "Onde a fuga já começa antes de eu perceber?"
      ],
      "judgment": [
        "Que nome cruel eu uso para mim depois que fujo?",
        "Onde confundo responsabilidade com punição?",
        "Como a culpa acaba alimentando o mesmo ciclo que condena?"
      ],
      "presence": [
        "Quanto tempo consigo ficar antes de obedecer ao impulso?",
        "O que devolve uma pequena margem de escolha?",
        "Que contato com o que sinto parece suportável hoje?"
      ]
    },
    "journals": [
      "O instante antes da fuga",
      "A memória do alívio",
      "A palavra que uso para me punir",
      "O ciclo culpa-alívio-culpa",
      "Trinta segundos de escolha",
      "O que consigo sentir sem me inundar"
    ],
    "letters": [
      "À parte de mim que aprendeu a sair para sobreviver",
      "À culpa que transforma alívio em crime",
      "Ao corpo que pode aprender a ficar aos poucos"
    ],
    "anchors": [
      "Reconhecer o impulso",
      "Atrasar sem proibir",
      "Escolher depois de trinta segundos"
    ],
    "editorialLimits": [
      "Não orientar acesso ou uso de substâncias ou condutas perigosas.",
      "Não romantizar compulsões.",
      "Não exigir interrupção abrupta de mecanismos de fuga.",
      "Não diagnosticar dependência.",
      "Não tratar recaída como falha moral."
    ]
  },
  {
    "ordinal": 6,
    "id": "pillar_06_desejo",
    "title": "Desejo",
    "triad": "Reconstrução",
    "internalTitle": "Pilar VI — Desejo, Amor & Frustração",
    "subtitle": "Aquilo que ainda permanece vivo.",
    "opening": "A dor não revela fraqueza. Revela exatamente onde a vida ainda insiste em existir.",
    "threshold": "Projeção",
    "thesis": "Reconhecer quando desejo e amor recebem a tarefa de corrigir feridas antigas, sem deslegitimar a necessidade de vínculo.",
    "centralMovement": "Permanecer em si enquanto ama, deseja, se frustra e atravessa incerteza.",
    "nextExperience": "caderno_presenca_reconstrucao",
    "canonicalException": "",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Desejo",
        "pages": "207"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Projeção",
        "pages": "208"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "O amor como lugar onde a ferida quer ser curada",
        "pages": "209–212"
      },
      {
        "order": 4,
        "kind": "narrative",
        "title": "A expectativa como tentativa de controlar a perda",
        "pages": "212–216"
      },
      {
        "order": 5,
        "kind": "consciousness",
        "title": "O que eu estou pedindo ao amor que o amor não pode entregar",
        "pages": "216–218"
      },
      {
        "order": 6,
        "kind": "judgment",
        "title": "O tribunal interno que transforma amor em prova de valor",
        "pages": "218–219"
      },
      {
        "order": 7,
        "kind": "presence",
        "title": "Amar sem se abandonar: sustentar o desconforto sem controlar",
        "pages": "219–221"
      },
      {
        "order": 8,
        "kind": "support_letter",
        "title": "A quem aprendeu a não querer",
        "pages": "221"
      },
      {
        "order": 9,
        "kind": "anchor",
        "title": "Microação de autorização",
        "pages": "222"
      },
      {
        "order": 10,
        "kind": "closing",
        "title": "O amor não prova seu valor; ele revela sua presença",
        "pages": "223"
      }
    ],
    "signals": [
      "p06_projection_burden",
      "p06_expectation_control",
      "p06_abandonment_activation",
      "p06_love_as_verdict",
      "p06_need_shame",
      "p06_frustration_self_condemnation",
      "p06_self_presence_in_love",
      "p06_uncertainty_tolerance",
      "p06_boundary_without_withdrawal"
    ],
    "secondary": [
      "p06_projection_burden",
      "p06_expectation_control",
      "p06_abandonment_activation"
    ],
    "transitions": [
      "caderno_presenca_reconstrucao",
      "pillar_05",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "O que eu estou pedindo ao amor que nenhuma pessoa pode garantir?",
        "Onde expectativa vira tentativa de controlar o resultado?",
        "Que medo antigo reaparece quando o vínculo se torna importante?"
      ],
      "judgment": [
        "O que acredito que uma rejeição provaria sobre meu valor?",
        "Que vergonha aparece quando reconheço que preciso de proximidade?",
        "Como me condeno depois de desejar, esperar ou me frustrar?"
      ],
      "presence": [
        "Como permaneço em mim enquanto amo?",
        "O que consigo sustentar sem exigir certeza imediata?",
        "Que limite posso reconhecer sem me retirar para punir ou me proteger?"
      ]
    },
    "journals": [
      "A função que entrego ao amor",
      "A expectativa por trás da expectativa",
      "O veredicto escondido na rejeição",
      "A vergonha de precisar",
      "Amar sem sair de mim",
      "Um limite que não pune"
    ],
    "letters": [
      "À parte de mim que espera ser salva pelo amor",
      "Ao tribunal que mede meu valor pela escolha do outro",
      "Ao desejo que pode existir sem me apagar"
    ],
    "anchors": [
      "Perceber a projeção",
      "Separar frustração de desvalor",
      "Pausar antes de controlar"
    ],
    "editorialLimits": [
      "Não diagnosticar dependência emocional.",
      "Não prescrever rompimento, reconciliação ou confronto.",
      "Não transformar o outro em culpado por inseguranças do leitor.",
      "Não exigir exposição afetiva.",
      "Não confundir limite com punição ou silêncio estratégico."
    ]
  },
  {
    "ordinal": 7,
    "id": "pillar_07_fe",
    "title": "Fé",
    "triad": "Continuidade",
    "internalTitle": "Pilar VII — Fé, Sentido & Desencanto",
    "subtitle": "Quando acreditar deixa de ser simples.",
    "opening": "A fé que permanece depois do desencanto não precisa ser ingênua.",
    "threshold": "Erosão",
    "thesis": "Reconhecer a erosão do sentido e da esperança sem impor crença religiosa, otimismo ou resposta metafísica.",
    "centralMovement": "Sustentar o não saber e permitir pequenos sentidos sem forçar convicção.",
    "nextExperience": "pillar_08_escassez",
    "canonicalException": "",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Fé",
        "pages": "228"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Erosão",
        "pages": "229"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "Quando tudo parece pouco e tarde demais",
        "pages": "230–232"
      },
      {
        "order": 4,
        "kind": "narrative",
        "title": "O momento em que parar de acreditar parece proteção",
        "pages": "232–234"
      },
      {
        "order": 5,
        "kind": "consciousness",
        "title": "Onde eu parei de esperar para não me decepcionar",
        "pages": "234–235"
      },
      {
        "order": 6,
        "kind": "judgment",
        "title": "Quando acreditar vira ingenuidade aos próprios olhos",
        "pages": "236"
      },
      {
        "order": 7,
        "kind": "presence",
        "title": "Ficar no vazio sem tentar preencher com crença nem negar",
        "pages": "237"
      },
      {
        "order": 8,
        "kind": "support_letter",
        "title": "Para quem cansou de acreditar",
        "pages": "238"
      },
      {
        "order": 9,
        "kind": "anchor",
        "title": "Para quem cansou de acreditar",
        "pages": "239"
      },
      {
        "order": 10,
        "kind": "closing",
        "title": "A fé que sobrevive ao desencanto é silenciosa",
        "pages": "240"
      }
    ],
    "signals": [
      "p07_expectation_shutdown",
      "p07_meaning_erosion",
      "p07_protective_realism",
      "p07_faith_naivety_judgment",
      "p07_hope_shame",
      "p07_cynicism_as_strength",
      "p07_not_knowing_capacity",
      "p07_small_meaning_receptivity",
      "p07_open_without_forcing"
    ],
    "secondary": [
      "p07_expectation_shutdown",
      "p07_meaning_erosion",
      "p07_protective_realism"
    ],
    "transitions": [
      "pillar_08_escassez",
      "pillar_06",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "Onde eu parei de esperar para não me decepcionar?",
        "Que área da vida perdeu sentido sem que eu percebesse de uma vez?",
        "Onde chamo de realismo o que talvez seja proteção contra esperança?"
      ],
      "judgment": [
        "O que penso sobre mim quando volto a acreditar em alguma coisa?",
        "Que vergonha aparece quando algo ainda desperta esperança?",
        "Onde trato cinismo como prova de inteligência ou força?"
      ],
      "presence": [
        "O que consigo não saber sem transformar isso em desistência?",
        "Que experiência pequena ainda produz significado real?",
        "Como posso permanecer aberto sem me obrigar a acreditar?"
      ]
    },
    "journals": [
      "O lugar onde parei de esperar",
      "O sentido que foi se desgastando",
      "A acusação contra a esperança",
      "O cinismo que me protege",
      "O que ainda significa algo",
      "Um espaço sem conclusão"
    ],
    "letters": [
      "À parte de mim que cansou de acreditar",
      "Ao juiz que chama esperança de ingenuidade",
      "Ao sentido que não precisa voltar inteiro"
    ],
    "anchors": [
      "Nomear o não saber",
      "Separar esperança de promessa",
      "Deixar uma porta sem forçar abertura"
    ],
    "editorialLimits": [
      "Não impor religião, espiritualidade ou ausência delas.",
      "Não tratar dúvida como falha moral.",
      "Não prometer que o sentido retornará.",
      "Não chamar cinismo de maturidade automaticamente.",
      "Não interpretar fé como solução para sofrimento."
    ]
  },
  {
    "ordinal": 8,
    "id": "pillar_08_escassez",
    "title": "Escassez",
    "triad": "Continuidade",
    "internalTitle": "Pilar VIII — Escassez, Medo & Sustentação",
    "subtitle": "O medo de nunca ser suficiente.",
    "opening": "A maior escassez começa quando acreditamos que precisamos merecer até o direito de existir.",
    "threshold": "Limiar",
    "thesis": "Separar falta real de identidade, comparação e profecia de fracasso, sem negar limitações concretas.",
    "centralMovement": "Recuperar escala, dignidade e próxima ação possível em períodos de restrição.",
    "nextExperience": "pillar_09_vazio",
    "canonicalException": "O PDF não contém seção NARRATIVE nem SUPPORT_LETTER neste pilar. Não inventar títulos canônicos. Recursos complementares podem existir como igent_companion, mas não entram em canonicalSections como book_exact.",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Escassez",
        "pages": "243"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Limiar",
        "pages": "244"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "Quando o mundo parece medir valor pela abundância",
        "pages": "245–246"
      },
      {
        "order": 4,
        "kind": "consciousness",
        "title": "Ver a falta sem se tornar falta",
        "pages": "246–247"
      },
      {
        "order": 5,
        "kind": "judgment",
        "title": "Quando o pouco vira condenação",
        "pages": "248–249"
      },
      {
        "order": 6,
        "kind": "presence",
        "title": "Permanecer no pouco sem diminuir-se",
        "pages": "249–250"
      },
      {
        "order": 7,
        "kind": "anchor",
        "title": "O inventário do suficiente",
        "pages": "251"
      },
      {
        "order": 8,
        "kind": "closing",
        "title": "O pouco não define o seu valor",
        "pages": "252"
      }
    ],
    "signals": [
      "p08_concrete_lack",
      "p08_comparison_amplification",
      "p08_scarcity_contraction",
      "p08_lack_identity_fusion",
      "p08_delay_shame",
      "p08_future_catastrophizing",
      "p08_dignity_in_lack",
      "p08_sufficient_inventory",
      "p08_minimum_possible_action"
    ],
    "secondary": [
      "p08_concrete_lack",
      "p08_comparison_amplification",
      "p08_scarcity_contraction"
    ],
    "transitions": [
      "pillar_09_vazio",
      "pillar_07",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "O que está faltando de forma concreta, sem transformar tudo em sentença?",
        "Onde a comparação amplia uma falta que já existe?",
        "Como meu corpo e minhas escolhas se contraem quando o medo de escassez aparece?"
      ],
      "judgment": [
        "Que parte da falta eu transformo em definição sobre quem sou?",
        "Que vergonha aparece porque eu ainda não resolvi o que esperava resolver?",
        "Que futuro minha mente apresenta como inevitável quando o medo aumenta?"
      ],
      "presence": [
        "Como preservo dignidade mesmo quando a vida está estreita?",
        "O que ainda existe e pode servir de apoio real?",
        "Qual é a próxima ação mínima possível sem exigir solução total?"
      ]
    },
    "journals": [
      "O que está faltando de verdade",
      "O medo ampliado pela comparação",
      "Quando o pouco vira identidade",
      "O futuro que o medo inventa",
      "O que ainda existe",
      "A próxima ação possível"
    ],
    "letters": [
      "À parte de mim que se sente menor quando falta",
      "Ao julgamento que transforma demora em fracasso",
      "Ao que ainda permanece mesmo no pouco"
    ],
    "anchors": [
      "Nomear a falta concreta",
      "Separar cenário de sentença",
      "Inventário do suficiente"
    ],
    "editorialLimits": [
      "Não romantizar pobreza, dívida ou falta de recursos.",
      "Não prometer abundância.",
      "Não substituir orientação financeira, jurídica ou social especializada.",
      "Não culpabilizar o leitor por limitações estruturais.",
      "Não transformar medo em profecia."
    ]
  },
  {
    "ordinal": 9,
    "id": "pillar_09_vazio",
    "title": "Vazio",
    "triad": "Continuidade",
    "internalTitle": "Pilar IX — Vazio, Presença & Continuidade",
    "subtitle": "Quando o silêncio deixa de ser ameaça.",
    "opening": "Existe um vazio que destrói. Existe outro que finalmente permite ouvir quem você sempre foi.",
    "threshold": "Permanência",
    "thesis": "Consolidar presença e continuidade sem criar uma narrativa de transformação final, resolução completa ou nova identidade.",
    "centralMovement": "Voltar para si quando se perder e continuar sem se atacar.",
    "nextExperience": "caderno_presenca_continuidade",
    "canonicalException": "",
    "canonicalSections": [
      {
        "order": 1,
        "kind": "identity",
        "title": "Vazio",
        "pages": "255"
      },
      {
        "order": 2,
        "kind": "threshold",
        "title": "Permanência",
        "pages": "256–257"
      },
      {
        "order": 3,
        "kind": "manifesto",
        "title": "O ponto onde nada se resolve, mas algo se sustenta",
        "pages": "257–259"
      },
      {
        "order": 4,
        "kind": "narrative",
        "title": "O corpo que aprende a ficar depois de tanto ir",
        "pages": "259–262"
      },
      {
        "order": 5,
        "kind": "consciousness",
        "title": "O que em mim já não reage como antes",
        "pages": "262–263"
      },
      {
        "order": 6,
        "kind": "judgment",
        "title": "Quando o velho juiz tenta retomar o controle",
        "pages": "263–264"
      },
      {
        "order": 7,
        "kind": "presence",
        "title": "Ficar com o que é, sem promessa de fechamento",
        "pages": "264–265"
      },
      {
        "order": 8,
        "kind": "support_letter",
        "title": "Para quem chegou até aqui sem virar outra pessoa",
        "pages": "266"
      },
      {
        "order": 9,
        "kind": "anchor",
        "title": "O compromisso mínimo de continuidade",
        "pages": "267"
      },
      {
        "order": 10,
        "kind": "closing",
        "title": "O poder não está em vencer. Está em permanecer.",
        "pages": "268"
      }
    ],
    "signals": [
      "p09_change_recognition",
      "p09_return_capacity",
      "p09_continuity_awareness",
      "p09_old_judge_return",
      "p09_resolution_demand",
      "p09_final_version_pressure",
      "p09_presence_without_closure",
      "p09_return_commitment",
      "p09_non_abandonment_continuity"
    ],
    "secondary": [
      "p09_change_recognition",
      "p09_return_capacity",
      "p09_continuity_awareness"
    ],
    "transitions": [
      "caderno_presenca_continuidade",
      "pillar_08",
      "pillar_01_reconhecimento"
    ],
    "questions": {
      "consciousness": [
        "O que em mim já não reage exatamente como antes?",
        "Onde percebo que consigo retornar mais cedo para mim?",
        "Que forma de continuidade já existe sem precisar ser grandiosa?"
      ],
      "judgment": [
        "Como o velho julgamento tenta retomar o controle?",
        "Onde ainda exijo uma resolução completa para considerar que algo valeu?",
        "Que pressão aparece para eu sair daqui como uma pessoa finalmente pronta?"
      ],
      "presence": [
        "O que consigo sustentar sem promessa de fechamento?",
        "Que compromisso mínimo me ajuda a voltar quando eu me perder?",
        "Como continuar sem me abandonar nos dias em que nada parece ter mudado?"
      ]
    },
    "journals": [
      "O que já não reage como antes",
      "A forma como retorno",
      "O juiz que exige conclusão",
      "A versão final que não preciso ser",
      "O compromisso mínimo",
      "Continuar sem espetáculo"
    ],
    "letters": [
      "À pessoa que chegou até aqui sem virar outra",
      "Ao juiz que ainda exige uma versão final",
      "À presença que quero reencontrar quando me perder"
    ],
    "anchors": [
      "Reconhecer a mudança sem premiar",
      "Interromper a exigência de conclusão",
      "Quando eu me perder, eu volto"
    ],
    "editorialLimits": [
      "Não afirmar conclusão emocional.",
      "Não transformar o último pilar em premiação.",
      "Não prometer estabilidade permanente.",
      "Não exigir síntese de jornada.",
      "Não definir uma versão final do leitor."
    ]
  }
] as const satisfies readonly FinalMindPillar[];

export const FINAL_MIND_PUBLICATION_MANIFEST = {
  schemaVersion: 'igentmind.frontend-final-project.v1',
  compiledPillars: FINAL_MIND_PILLARS.map((pillar) => pillar.id),
  counts: {
    pillars: FINAL_MIND_PILLARS.length,
    questions: FINAL_MIND_PILLARS.reduce((total, pillar) => total + Object.values(pillar.questions).reduce((phaseTotal, questions) => phaseTotal + questions.length, 0), 0),
    options: FINAL_MIND_PILLARS.length * 54,
    journals: FINAL_MIND_PILLARS.reduce((total, pillar) => total + pillar.journals.length, 0),
    letters: FINAL_MIND_PILLARS.reduce((total, pillar) => total + pillar.letters.length, 0),
    anchors: FINAL_MIND_PILLARS.reduce((total, pillar) => total + pillar.anchors.length, 0),
  },
  privacy: {
    diaryPrivate: true,
    lettersPrivate: true,
    openAnswersPrivate: true,
    memoryRequiresConsent: true,
  },
  navigation: {
    readingNeverBlocked: true,
    reflectionSkippable: true,
    oneQuestionPerTurn: true,
  },
} as const;

export const getFinalMindPillar = (pillarIndex: number | null | undefined) =>
  typeof pillarIndex === 'number' ? FINAL_MIND_PILLARS[pillarIndex] ?? null : null;
