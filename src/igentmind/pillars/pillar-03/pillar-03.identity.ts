import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_ID,
  PILLAR_04_ID,
  type Pillar03Identity,
} from "./pillar-03.block28.contracts";

export const PILLAR_03_IDENTITY = Object.freeze({
  id: PILLAR_03_ID,
  order: 3,
  title: "Luto",
  subtitle: "Quando a ausência permanece.",
  internalTitle:
    "Pilar III — Luto, Ausência & Quebra de Laços",
  openingStatement:
    "Nem toda perda termina quando alguém parte. Algumas continuam vivendo dentro de nós.",
  actId: "act_01_survival",
  actTitle: "Sobrevivência",
  previousPillarId: PILLAR_02_ID,
  entryExperienceId: INTERLUDE_FENDA_ID,
  nextPillarId: PILLAR_04_ID,
  blocksReading: false,
} satisfies Pillar03Identity);
