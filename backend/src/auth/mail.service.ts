import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type ResetPasswordEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private createTransport() {
    const resendApiKey = process.env.RESEND_API_KEY;
    const host = process.env.SMTP_HOST || (resendApiKey ? 'smtp.resend.com' : '');
    const port = Number(process.env.SMTP_PORT || (resendApiKey ? 465 : 587));
    const user = process.env.SMTP_USER || (resendApiKey ? 'resend' : '');
    const pass = process.env.SMTP_PASS || resendApiKey;

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user, pass },
    });
  }

  async sendPasswordResetEmail(input: ResetPasswordEmailInput) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@opoderdosdesacreditados.online';
    const appName = 'O Poder dos Desacreditados';
    const firstName = input.name?.trim()?.split(/\s+/)[0] || 'leitor';
    const subject = 'Redefinição de senha — O Poder dos Desacreditados';
    const text = [
      `Olá, ${firstName}.`,
      '',
      'Recebemos uma solicitação para redefinir sua senha.',
      'Use o link abaixo em até 30 minutos:',
      input.resetUrl,
      '',
      'Se você não solicitou essa alteração, ignore este e-mail.',
      '',
      appName,
    ].join('\n');
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#211f1b">
        <h2 style="margin:0 0 12px;color:#211f1b">Redefinição de senha</h2>
        <p>Olá, ${firstName}.</p>
        <p>Recebemos uma solicitação para redefinir sua senha no <strong>${appName}</strong>.</p>
        <p>Este link expira em <strong>30 minutos</strong>:</p>
        <p><a href="${input.resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#c8a45d;color:#111;text-decoration:none;font-weight:bold">Redefinir senha</a></p>
        <p style="font-size:13px;color:#666">Se o botão não funcionar, copie e cole este link no navegador:<br>${input.resetUrl}</p>
        <p style="font-size:13px;color:#666">Se você não solicitou essa alteração, ignore este e-mail.</p>
      </div>
    `;

    const transport = this.createTransport();
    if (!transport) {
      this.logger.warn(`SMTP/Resend não configurado. Link de redefinição para ${input.to}: ${input.resetUrl}`);
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

      return { delivered: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha ao enviar e-mail de redefinicao para ${input.to}: ${message}`);
      return { delivered: false, resetUrl: input.resetUrl };
    }
  }
}
