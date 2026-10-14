import { randomBytes } from 'crypto';
import { getLpUrl } from '../config/env';

// pilar_N → pasta da página da carta na LP (/carta/<romano>/).
export const ROMANOS: Record<string, string> = {
  pilar_1: 'i',
  pilar_2: 'ii',
  pilar_3: 'iii',
  pilar_4: 'iv',
  pilar_5: 'v',
  pilar_6: 'vi',
  pilar_7: 'vii',
  pilar_8: 'viii',
  pilar_9: 'ix',
};

/** Token do link pessoal: 24 bytes aleatórios em base64url (32 caracteres). */
export function novoCartaToken(): string {
  return randomBytes(24).toString('base64url');
}

/** Link pessoal da Carta de Sustentação do lead. Único lugar que monta essa URL. */
export function linkCarta(lead: { pilarResultado: string; cartaToken: string }): string {
  const romano = ROMANOS[lead.pilarResultado] ?? 'i';
  return `${getLpUrl()}/carta/${romano}/?t=${encodeURIComponent(lead.cartaToken)}`;
}

// Resposta do prólogo do quiz → frase que entra no resultado e na carta.
// Casa pelo começo da resposta para sobreviver a pequenas edições no texto.
const FRASES_PROLOGO: Array<[string, string]> = [
  ['os outros', 'A descrença começou fora. O risco é ela ter virado a sua voz.'],
  ['eu mesmo', 'A descrença mais pesada é a que fala com a sua própria voz.'],
  ['os dois', 'Duvidaram de você, e com o tempo você assinou embaixo.'],
  ['nem sei', 'Quando você não sabe mais de onde veio a dúvida, é porque ela já virou paisagem.'],
];

export function fraseDoPrologo(prologo: string | null | undefined): string | null {
  const resposta = String(prologo || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
  if (!resposta) return null;
  return FRASES_PROLOGO.find(([inicio]) => resposta.startsWith(inicio))?.[1] ?? null;
}

export function primeiroNome(nome: string): string {
  return String(nome || '').trim().split(/\s+/)[0]?.slice(0, 40) || '';
}
