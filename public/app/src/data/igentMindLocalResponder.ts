export type LocalMindIntent = 'understand' | 'reflect' | 'act' | 'continue';

export type LocalMindResponse = {
  text: string;
  replies: string[];
};

type LocalMindInput = {
  intent: LocalMindIntent;
  pillarIndex: number;
  territory: string;
  message: string;
  thesis?: string;
  movement?: string;
  counterpoint?: string;
  practice?: string;
  turnCount?: number;
};

const examples = [
  'Uma pessoa percebe que está exausta, mas responde “não foi nada” e tenta produzir ainda mais. A lente do Reconhecimento começa quando ela nomeia o cansaço antes de tentar corrigi-lo ou justificá-lo.',
  'Alguém aceita uma tarefa familiar que não consegue sustentar porque aprendeu que pertencer significa não decepcionar. A lente da Família ajuda a distinguir vínculo de lealdade que apaga a própria presença.',
  'Uma pessoa continua funcionando depois de uma perda e conclui que já deveria estar bem. A lente do Luto permite reconhecer a ausência sem transformar o tempo da dor em falha pessoal.',
  'Depois de um resultado ruim, alguém passa de “meu projeto falhou” para “eu sou um fracasso”. A lente do Trabalho separa resultado, valor e identidade.',
  'Ao sentir algo difícil, alguém ocupa cada minuto, rola a tela ou busca anestesia. A lente da Dor não exige suportar tudo; primeiro identifica a fuga sem convertê-la em condenação.',
  'Uma pessoa deseja mudar de vida, mas trata o desejo como prova de ingratidão ou perigo. A lente do Desejo pergunta se esse movimento a afasta de si ou a devolve para si.',
  'Depois de uma decepção, alguém acredita que precisa fingir certeza para continuar. A lente da Fé admite o desencanto e procura uma presença possível mesmo sem resposta completa.',
  'Diante da falta, alguém tenta controlar tudo e começa a se definir pelo que não possui. A lente da Escassez reconhece o limite real sem deixar que a falta vire identidade.',
  'Quando nada parece fazer sentido, alguém interpreta o vazio como prova de que a história acabou. A lente do Vazio procura continuidade em um gesto mínimo, sem fabricar uma resposta grandiosa.',
] as const;

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const excerpt = (value: string, limit = 180) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > limit ? `${clean.slice(0, limit - 3)}...` : clean;
};

export const buildLocalMindResponse = (input: LocalMindInput): LocalMindResponse => {
  const message = normalize(input.message);
  const pillarIndex = Math.max(0, Math.min(8, input.pillarIndex));
  const territory = input.territory || `Pilar ${pillarIndex + 1}`;
  const thesis = input.thesis || `reconhecer o que acontece em ${territory} sem transformar a experiência em identidade`;
  const movement = input.movement || 'nomear o que existe antes de tentar resolver';

  if (input.intent === 'understand') {
    if (/exemplo|cotidiano|na pratica/.test(message)) {
      return {
        text: [
          `Um exemplo cotidiano da lente de ${territory}:`,
          examples[pillarIndex],
          'Esse exemplo é uma aplicação da lente do livro, não uma citação literal e nem uma interpretação sobre você.',
        ].join('\n\n'),
        replies: ['Comparar com julgamento', 'Isso aparece na minha vida', 'Voltar ao trecho'],
      };
    }

    if (/julgamento|comparar|diferenca/.test(message)) {
      return {
        text: [
          `Em ${territory}, reconhecer é descrever o que está acontecendo; julgar é transformar essa descrição em sentença sobre quem a pessoa é.`,
          '“Estou cansado” descreve uma experiência. “Sou fraco porque estou cansado” acrescenta uma condenação. Presença é conseguir notar as duas frases sem obedecer automaticamente à segunda.',
        ].join('\n\n'),
        replies: ['Ver outro exemplo', 'Isso aparece na minha vida', 'Voltar ao trecho'],
      };
    }

    return {
      text: [
        `${territory} trabalha esta ideia: ${thesis}.`,
        `O movimento do trecho é ${movement}. Isso funciona como lente de leitura, não como diagnóstico sobre o leitor.`,
      ].join('\n\n'),
      replies: ['Ver exemplo cotidiano', 'Comparar com julgamento', 'Isso aparece na minha vida', 'Voltar ao trecho'],
    };
  }

  if (input.intent === 'act') {
    return {
      text: [
        `Em ${territory}, o próximo movimento precisa ser pequeno e reversível.`,
        input.practice || 'Escreva uma frase que nomeie o que está acontecendo sem tentar concluir ou corrigir.',
      ].join('\n\n'),
      replies: ['Escrever por dois minutos', 'Fazer uma âncora breve', 'Guardar para retomar depois', 'Voltar ao trecho'],
    };
  }

  if (/isso aparece na minha vida|quero refletir/.test(message)) {
    return {
      text: 'Então saímos da explicação e entramos na reflexão. A partir daqui, o foco não é provar a ideia do livro, mas observar como ela aparece na sua experiência — uma pergunta por vez.',
      replies: ['Começar reflexão', 'Voltar ao trecho'],
    };
  }

  return {
    text: [
      `Eu ouvi este ponto concreto: “${excerpt(input.message)}”.`,
      input.counterpoint || `A lente de ${territory} ajuda a separar a experiência vivida da sentença que pode ter se colado a ela.`,
      'O que nessa frase descreve um fato vivido e o que já virou julgamento sobre você?',
    ].join('\n\n'),
    replies: ['Responder com minhas palavras', 'Guardar para retomar depois', 'Voltar ao trecho'],
  };
};
