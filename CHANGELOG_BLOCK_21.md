# BLOCO 21 — Changelog técnico

## Contratos

- Criado contrato central em `src/igentmind/core/contracts.ts`.
- Eliminadas declarações duplicadas de estados, fases, intervenções, escalas, memória, navegação e resposta.
- `block20.types.ts` passou a reexportar os contratos oficiais.
- Mantidos aliases temporários para `ContentOrigin`, `PrimarySignal` e `SecondarySignal`.

## Identidade técnica

- ID oficial do Pilar I consolidado como `pillar_01_reconhecimento`.
- ID `pillar_01_vinculo` marcado como legado e proibido no runtime.
- Continuação normalizada para `pillar_02_familia`.

## Origem editorial

- `EditorialOrigin` e `GenerationMode` separados definitivamente.
- Conteúdo `book_exact` aceita somente `generationMode: "fixed"`.
- Campo híbrido `contentOrigin` removido do contrato novo.

## Sinais

- Criado `SignalRegistry`.
- Sinais locais precisam ser registrados antes do uso.
- `PrimarySignal` e `SecondarySignal` foram convertidos em especializações de `SignalObservation`.
- Confiança limitada ao intervalo de zero a um.

## Escalas

- Implementado `clampScale`.
- Implementado `applyScaleDelta`.
- Deltas permitidos exclusivamente: -1, 0 e 1.
- Resultados limitados ao intervalo de zero a quatro.

## next_move

- Criado union type discriminado `NextMove`.
- Formatos antigos são aceitos apenas pela função de fronteira `normalizeNextMove`.
- Campos obrigatórios variam conforme o movimento.
- `continue_to_pillar` exige PillarId e BookCursor válidos.
- `return_to_book` exige BookCursor.
- `safety_stop` exige reasonCode.

## Memória

- Memória exige candidatura, edição opcional e confirmação explícita.
- Recusa elimina a candidatura.
- Apenas a versão confirmada é armazenada.
- Duplicação por conteúdo normalizado foi bloqueada.
- Uma resposta pode usar no máximo uma memória.

## Privacidade

- Diário e carta permanecem privados.
- Carta não produz saída externa.
- `sanitizeTelemetryPayload` remove texto, corpo, snippet, respostas e conteúdo de memória.
- Telemetria registra somente metadados mínimos.

## Fechamento

- `complete` passou a ser derivado do status.
- `partial` sempre produz `complete: false`.
- `completed` e `completed_without_synthesis` produzem `complete: true`.
- Síntese permanece opcional.
- Rotas canônicas e complementares permanecem identificáveis.

## Conteúdo editorial

- Criado `ContentRegistry`.
- Referências canônicas do Pilar I usam `book_exact` e `fixed`.
- Falhas de referência seguem fail-closed.
- Nenhum conteúdo substituto é inventado.

## Respostas

- Uma pergunta por turno.
- Até três movimentos visíveis.
- Até uma memória por resposta.
- Opção fechada limitada a confiança 0.35.
- Resposta aberta corrige e supera a interpretação fechada.

## Segurança

- Safety permanece no topo da prioridade global.
- Ativação de segurança suspende a reflexão.
- Nenhuma resposta deep é permitida em segurança ou sobrecarga máxima.

## Navegação

- Cursor de retorno preservado.
- Leitura nunca é bloqueada pela reflexão.
- Reabertura preserva progresso e evita duplicação de memória.
- Convites automáticos aparecem somente após Consciência, Julgamento e Presença.
Aplicação no Codex

Execute nesta ordem:

npm install -D typescript vitest tsx @types/node
npm run typecheck:igentmind
npm run test:block21
IGENTMIND_RUNTIME_MODULE=src/igentmind/runtime/index.ts \
npm run test:block20

No PowerShell:

$env:IGENTMIND_RUNTIME_MODULE="src/igentmind/runtime/index.ts"
npm run verify:igentmind
Gate final obrigatório

O Bloco 21 só pode ser considerado aprovado quando:

TypeScript: 0 erros
Bloco 21: 13 testes aprovados
Bloco 20: todos os cenários executados
ID legado: 0 ocorrências funcionais
Vazamento privado: 0 ocorrências
Referências inventadas: 0 ocorrências

Falhas editoriais ou técnicas restantes não devem ser silenciadas. Elas devem ser registradas antes da extração do Template Mestre.
