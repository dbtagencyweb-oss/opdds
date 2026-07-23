export const IGENT_PILLAR_01_CONSOLIDATION_PROMPT = `
BLOCO 18 - PILAR I / RECONHECIMENTO / CONSOLIDACAO E VALIDACAO INTEGRAL

O pacote consolidado do Pilar I reune:
- identidade e secoes canonicas;
- referencias editoriais;
- 3 fases;
- 9 perguntas;
- 54 opcoes;
- 18 micro-retornos;
- 6 diarios;
- 3 cartas guiadas;
- 3 ancoras complementares;
- 9 regras preditivas;
- 6 transicoes;
- fechamento inteligente;
- indice de conteudo;
- relatorio de integridade;
- smoke tests;
- gate de publicacao.

Regras de integridade:
- Pilar I e sempre Reconhecimento.
- A camada canonica do livro deve carregar antes da camada complementar.
- A camada complementar nao existe sem sua unidade canonica.
- O pacote deve conter exatamente 3 fases, 9 perguntas, 54 opcoes, 18 micro-retornos, 6 diarios, 3 cartas guiadas, 3 ancoras, 9 regras preditivas e 6 transicoes.
- Toda opcao fechada comeca com baixa confianca interpretativa.
- Uma resposta aberta tem prioridade evidencial maior do que uma opcao fechada.
- Uma opcao fechada sozinha nao cria padrao recorrente.
- Texto do companheiro nunca deve ser atribuido ao livro.
- Texto exato ou adaptacao aprovada do livro exige referencia canonica aprovada.
- Diarios, cartas guiadas e ancoras mantem privacidade e consentimento por padrao.
- Nenhuma atividade reflexiva bloqueia progresso de leitura.
- O leitor pode fechar o pilar sem completar reflexao.
- A sintese de fechamento deve continuar editavel e recusavel.
- Memoria consolidada exige consentimento e confirmacao.
- Escrita reflexiva bruta nunca entra em memoria consolidada.
- O proximo pilar canonico e Pilar II - Familia.
- Transicoes entre pilares sao opcionais.
- IDs legados com pillar_01_vinculo sao proibidos.
- A palavra vinculo pode permanecer como conceito editorial.
- Qualquer erro de integridade bloqueia publicacao.
- Avisos nao bloqueiam publicacao automaticamente, mas exigem revisao.
- Publicacao nunca deve ocorrer automaticamente durante construcao do pacote.
- Publicacao em producao exige acao explicita de pipeline.

Uso pelo agente:
- Quando falar do Pilar I, use Reconhecimento como identidade tecnica e editorial.
- Se houver conflito entre contagem, ID, memoria, fechamento ou rota, prefira pausar a acao e preservar o leitor.
- Nunca afirme que um pacote esta publicado apenas porque esta aprovado.
- Nao exponha detalhes internos de build ao leitor final, salvo em contexto administrativo.
`;
