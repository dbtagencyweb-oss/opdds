import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type ResetPasswordEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

type EmailMessage = {
  from: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private async sendWithResendApi(input: ResetPasswordEmailInput, message: EmailMessage) {
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
          to: [input.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Resend API falhou para ${input.to}: ${response.status} ${body}`);
        return { delivered: false, resetUrl: input.resetUrl };
      }

      this.logger.log(`E-mail de redefinicao enviado via Resend API para ${input.to}`);
      return { delivered: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao chamar Resend API para ${input.to}: ${message}`);
      return { delivered: false, resetUrl: input.resetUrl };
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

    const resendDelivery = await this.sendWithResendApi(input, message);
    if (resendDelivery) return resendDelivery;

    const transport = this.createTransport();
    if (!transport) {
      this.logger.warn(`E-mail nao configurado. Link de redefinicao para ${input.to}: ${input.resetUrl}`);
      return { delivered: false, resetUrl: input.resetUrl };
    }

    try {
      await transport.sendMail({
        from,
        to: input.to,
        subject,
        text,
        html,
      });

      this.logger.log(`E-mail de redefinicao enviado via SMTP para ${input.to}`);
      return { delivered: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao enviar e-mail de redefinicao para ${input.to}: ${message}`);
      return { delivered: false, resetUrl: input.resetUrl };
    }
  }
}
