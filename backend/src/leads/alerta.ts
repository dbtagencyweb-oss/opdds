import { createHmac, timingSafeEqual } from 'crypto';
import { getApiPublicUrl, getJwtSecret } from '../config/env';
import { PILARES } from './pilares';
import { linkCarta, primeiroNome } from './cartas';

// Link de um toque "Enviar carta no WhatsApp" dos avisos de lead novo.
// Assinado (HMAC) e com validade, para funcionar sem login no celular.
const VALIDADE_DIAS = 30;

function segredo() {
  return `${getJwtSecret()}:alerta-whatsapp`;
}

function assinatura(leadId: string, expira: number) {
  return createHmac('sha256', segredo()).update(`${leadId}.${expira}`).digest('base64url');
}

export function linkEnviarCarta(leadId: string): string {
  const expira = Math.floor(Date.now() / 1000) + VALIDADE_DIAS * 86_400;
  return `${getApiPublicUrl()}/api/leads/${encodeURIComponent(leadId)}/whatsapp?e=${expira}&s=${assinatura(leadId, expira)}`;
}

export function assinaturaValida(leadId: string, expira: string | undefined, sig: string | undefined): boolean {
  const exp = Number(expira);
  if (!Number.isInteger(exp) || exp < Math.floor(Date.now() / 1000) || !sig) return false;
  const esperado = Buffer.from(assinatura(leadId, exp));
  const recebido = Buffer.from(String(sig));
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

/** Mesma mensagem do botão "Enviar carta" do admin. */
export function mensagemCarta(lead: { nome: string; pilarResultado: string; cartaToken: string }) {
  return [
    `Oi, ${primeiroNome(lead.nome)}. Aqui é o Diego, autor de O Poder dos Desacreditados.`,
    '',
    `Seu dilema é o do ${PILARES[lead.pilarResultado] ?? lead.pilarResultado}. Como prometido, aqui está a Carta de Sustentação dele, escrita pra você: ${linkCarta(lead)}`,
    '',
    'Uma sugestão: leia num momento em que você possa parar depois. Ela funciona melhor assim.',
    '',
    'Se quiser, me responde aqui com uma palavra sobre o que sentiu. Eu leio.',
  ].join('\n');
}

export function linkWhatsapp(lead: { whatsapp: string; nome: string; pilarResultado: string; cartaToken: string }) {
  return `https://wa.me/55${lead.whatsapp}?text=${encodeURIComponent(mensagemCarta(lead))}`;
}
