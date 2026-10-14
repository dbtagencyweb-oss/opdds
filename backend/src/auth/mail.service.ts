import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type ResetPasswordEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

type PurchaseInviteEmailInput = {
  to: string;
  name?: string | null;
  registerUrl: string;
  planLabel: string;
};

type MindTrialEmailInput = {
  type: 'trial_ativado' | 'trial_dia2' | 'trial_expirado';
  to: string;
  name?: string | null;
  trialEndsAt: Date | null;
  checkoutUrl: string;
  appUrl?: string;
};

type QuizLeadAlertInput = {
  to: string;
  primeiroNome: string;
  pilar: string;
  origem: string;
  criadoEm: Date;
  adminUrl: string;
};

type QuizCartaEmailInput = {
  to: string;
  primeiroNome: string;
  pilar: string;
  fraseProlog: string | null;
  cartaUrl: string;
  descadastroUrl: string;
};

/** Escapa texto digitado pelo lead antes de entrar no HTML do e-mail. */
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string);
}

/** Só o endereço do MAIL_FROM ("Nome <a@b>" → "a@b"), para trocar o nome do remetente. */
function mailFromAddress() {
  const from = process.env.MAIL_FROM || 'no-reply@opoderdosdesacreditados.online';
  return from.match(/<([^>]+)>/)?.[1] || from.trim();
}

type EmailMessage = {
  from: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private async sendWithResendApi(to: string, message: EmailMessage) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'opdds-api/1.0',
        },
        body: JSON.stringify({
          from: message.from,
          to: [to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Resend API falhou para ${to}: ${response.status} ${body}`);
        return { delivered: false };
      }

      this.logger.log(`E-mail "${message.subject}" enviado via Resend API para ${to}`);
      return { delivered: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao chamar Resend API para ${to}: ${errorMessage}`);
      return { delivered: false };
    }
  }

  private async deliver(to: string, message: EmailMessage): Promise<{ delivered: boolean }> {
    const resendDelivery = await this.sendWithResendApi(to, message);
    if (resendDelivery) return resendDelivery;

    const transport = this.createTransport();
    if (!transport) {
      this.logger.warn(`E-mail nao configurado. "${message.subject}" nao enviado para ${to}.`);
      return { delivered: false };
    }

    try {
      await transport.sendMail({ ...message, to });
      this.logger.log(`E-mail "${message.subject}" enviado via SMTP para ${to}`);
      return { delivered: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao enviar "${message.subject}" para ${to}: ${errorMessage}`);
      return { delivered: false };
    }
  }

  private createTransport() {
    const host = process.env.SMTP_HOST || '';
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }

  async sendPasswordResetEmail(input: ResetPasswordEmailInput) {
    const from = process.env.MAIL_FROM || 'no-reply@opoderdosdesacreditados.online';
    const appName = 'O Poder dos Desacreditados';
    const firstName = input.name?.trim()?.split(/\s+/)[0] || 'leitor';
    const subject = 'Redefinicao de senha - O Poder dos Desacreditados';
    const text = [
      `Ola, ${firstName}.`,
      '',
      'Recebemos uma solicitacao para redefinir sua senha.',
      'Use o link abaixo em ate 30 minutos:',
      input.resetUrl,
      '',
      'Se voce nao solicitou essa alteracao, ignore este e-mail.',
      '',
      appName,
    ].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#211f1b">
        <h2 style="margin:0 0 12px;color:#211f1b">Redefinicao de senha</h2>
        <p>Ola, ${firstName}.</p>
        <p>Recebemos uma solicitacao para redefinir sua senha no <strong>${appName}</strong>.</p>
        <p>Este link expira em <strong>30 minutos</strong>:</p>
        <p><a href="${input.resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#c8a45d;color:#111;text-decoration:none;font-weight:bold">Redefinir senha</a></p>
        <p style="font-size:13px;color:#666">Se o botao nao funcionar, copie e cole este link no navegador:<br>${input.resetUrl}</p>
        <p style="font-size:13px;color:#666">Se voce nao solicitou essa alteracao, ignore este e-mail.</p>
      </div>
    `;
    const message = { from, subject, text, html };
    const result = await this.deliver(input.to, message);
    if (!result.delivered) this.logger.warn(`Link de redefinicao para ${input.to}: ${input.resetUrl}`);
    return { ...result, resetUrl: input.resetUrl };
  }

  async sendPurchaseInviteEmail(input: PurchaseInviteEmailInput) {
    const from = process.env.MAIL_FROM || 'no-reply@opoderdosdesacreditados.online';
    const appName = 'O Poder dos Desacreditados';
    const firstName = input.name?.trim()?.split(/\s+/)[0] || 'leitor';
    const subject = `Seu acesso ao ${appName} esta liberado`;
    const text = [
      `Ola, ${firstName}.`,
      '',
      `Sua compra foi confirmada e seu acesso (${input.planLabel}) ja esta liberado.`,
      'Crie sua senha e entre no app pelo link abaixo:',
      input.registerUrl,
      '',
      'Se voce nao reconhece essa compra, responda este e-mail.',
      '',
      appName,
    ].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#211f1b">
        <h2 style="margin:0 0 12px;color:#211f1b">Seu acesso esta liberado</h2>
        <p>Ola, ${firstName}.</p>
        <p>Sua compra foi confirmada e seu acesso (<strong>${input.planLabel}</strong>) ja esta liberado no <strong>${appName}</strong>.</p>
        <p>Crie sua senha e entre no app:</p>
        <p><a href="${input.registerUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#c8a45d;color:#111;text-decoration:none;font-weight:bold">Criar minha senha e entrar</a></p>
        <p style="font-size:13px;color:#666">Se o botao nao funcionar, copie e cole este link no navegador:<br>${input.registerUrl}</p>
        <p style="font-size:13px;color:#666">Se voce nao reconhece essa compra, responda este e-mail.</p>
      </div>
    `;
    const result = await this.deliver(input.to, { from, subject, text, html });
    if (!result.delivered) this.logger.warn(`Link de cadastro para ${input.to}: ${input.registerUrl}`);
    return result;
  }

  async sendMindTrialEmail(input: MindTrialEmailInput) {
    const from = process.env.MAIL_FROM || 'no-reply@opoderdosdesacreditados.online';
    const firstName = input.name?.trim()?.split(/\s+/)[0] || 'leitor';
    const appUrl = input.appUrl || 'https://opoderdosdesacreditados.online';
    const endsAt = input.trialEndsAt
      ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(input.trialEndsAt)
      : null;

    const copy = {
      trial_ativado: {
        subject: 'Sua degustacao do iGentMIND comecou',
        title: 'Sua degustacao comecou',
        lines: [
          'Voce acabou de abrir sua primeira conversa com o iGentMIND.',
          `A partir de agora voce tem 72 horas${endsAt ? ` (ate ${endsAt})` : ''} e ate 15 mensagens por dia para conversar com o mentor.`,
        ],
        cta: { label: 'Continuar a conversa', url: appUrl },
      },
      trial_dia2: {
        subject: 'Segundo dia da sua degustacao do iGentMIND',
        title: 'Voce esta no segundo dia',
        lines: [
          'Sua degustacao do iGentMIND segue ativa.',
          `${endsAt ? `Ela termina em ${endsAt}. ` : ''}Se quiser manter o mentor depois disso, o Diario + iGentMIND 30 dias continua de onde voce parou.`,
        ],
        cta: { label: 'Voltar ao iGentMIND', url: appUrl },
      },
      trial_expirado: {
        subject: 'Sua degustacao do iGentMIND terminou',
        title: 'Sua degustacao terminou',
        lines: [
          'As 72 horas da sua degustacao do iGentMIND chegaram ao fim.',
          'Para continuar a conversa, o Diario + iGentMIND 30 dias custa R$ 37 e libera o mentor por 30 dias.',
        ],
        cta: { label: 'Continuar com 30 dias', url: input.checkoutUrl },
      },
    }[input.type];

    const text = [`Ola, ${firstName}.`, '', ...copy.lines, '', `${copy.cta.label}: ${copy.cta.url}`, '', 'O Poder dos Desacreditados'].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#211f1b">
        <h2 style="margin:0 0 12px;color:#211f1b">${copy.title}</h2>
        <p>Ola, ${firstName}.</p>
        ${copy.lines.map((line) => `<p>${line}</p>`).join('\n        ')}
        <p><a href="${copy.cta.url}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#c8a45d;color:#111;text-decoration:none;font-weight:bold">${copy.cta.label}</a></p>
      </div>
    `;
    return this.deliver(input.to, { from, subject: copy.subject, text, html });
  }

  // Aviso interno de lead novo do quiz. Sem WhatsApp nem e-mail do lead.
  async sendQuizLeadAlert(input: QuizLeadAlertInput) {
    const from = process.env.MAIL_FROM || 'no-reply@opoderdosdesacreditados.online';
    const quando = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(input.criadoEm);
    const subject = `Novo lead do quiz: ${input.primeiroNome} · ${input.pilar}`;
    const text = [
      `Novo lead do quiz em ${quando}.`,
      '',
      `Pilar: ${input.pilar}`,
      `Origem: ${input.origem}`,
      '',
      `Abrir no admin: ${input.adminUrl}`,
    ].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#211f1b">
        <h2 style="margin:0 0 12px;color:#211f1b">Novo lead do quiz</h2>
        <p><strong>${escapeHtml(input.primeiroNome)}</strong> · ${escapeHtml(input.pilar)}</p>
        <p>Horário: ${quando}<br>Origem: ${escapeHtml(input.origem)}</p>
        <p><a href="${input.adminUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#c8a45d;color:#111;text-decoration:none;font-weight:bold">Abrir no admin</a></p>
      </div>
    `;
    return this.deliver(input.to, { from, subject, text, html });
  }

  // Carta de Sustentação para quem deixou e-mail no quiz.
  async sendQuizCartaEmail(input: QuizCartaEmailInput) {
    const from = `Diego · O Poder dos Desacreditados <${mailFromAddress()}>`;
    const subject = `${input.primeiroNome}, a carta do seu dilema`;
    const intro = 'No livro, cada dilema termina com uma Carta de Sustentação: um texto escrito para quem está no meio da briga, não para quem já saiu dela. A sua está aqui:';
    const text = [
      `${input.primeiroNome}, seu resultado foi o dilema do ${input.pilar}.`,
      ...(input.fraseProlog ? ['', input.fraseProlog] : []),
      '',
      intro,
      '',
      input.cartaUrl,
      '',
      'Não precisa responder nada. Só leia quando puder parar.',
      '',
      'Diego',
      '',
      '—',
      `Não quer mais receber e-mails? ${input.descadastroUrl}`,
    ].join('\n');
    const p = 'margin:0 0 18px';
    const html = `
      <div style="background:#F5F0E8;padding:32px 16px">
        <div style="max-width:560px;margin:0 auto;font-family:Fraunces,Georgia,'Times New Roman',serif;font-size:17px;line-height:1.75;color:#1A1A24">
          <p style="${p}">${escapeHtml(input.primeiroNome)}, seu resultado foi o dilema do ${escapeHtml(input.pilar)}.</p>
          ${input.fraseProlog ? `<p style="${p};font-style:italic;color:#A77F66">${escapeHtml(input.fraseProlog)}</p>` : ''}
          <p style="${p}">${intro}</p>
          <p style="${p}"><a href="${input.cartaUrl}" style="color:#A77F66">Ler a minha Carta de Sustentação</a></p>
          <p style="${p}">Não precisa responder nada. Só leia quando puder parar.</p>
          <p style="${p}">Diego</p>
          <p style="margin:32px 0 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#7A7A8C">Você recebeu este e-mail porque fez o quiz de O Poder dos Desacreditados e aceitou receber o resultado. Para não receber mais, <span style="color:#7A7A8C">acesse ${input.descadastroUrl}</span></p>
        </div>
      </div>
    `;
    return this.deliver(input.to, { from, subject, text, html });
  }
}
