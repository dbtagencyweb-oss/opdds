import { getLpUrl } from '../config/env';

// Página simples (servida pela API) no mesmo visual da privacidade.html da LP.
// O descadastro é em dois passos (GET mostra o botão, POST confirma) porque
// filtros de e-mail costumam abrir os links sozinhos.

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string);
}

function layout(titulo: string, corpo: string) {
  const lp = getLpUrl();
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#14141C">
<meta name="robots" content="noindex, nofollow">
<title>${titulo} — O Poder dos Desacreditados</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;background:#F5F0E8;color:#1A1A24;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
a{color:#A77F66}a:hover{color:#C09880}
header{background:#14141C;padding:28px clamp(20px,5vw,56px);border-bottom:1px solid #C09880}
header img{display:block;height:48px;width:auto}
main{max-width:640px;margin:0 auto;padding:clamp(48px,8vw,96px) clamp(20px,5vw,56px)}
.label{display:flex;align-items:center;gap:12px;font-size:.66rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:#A77F66;margin:0 0 18px}
.label span{width:28px;height:1px;background:#A77F66;opacity:.6}
h1{margin:0;font-family:'Fraunces',serif;font-weight:400;font-size:clamp(1.9rem,5vw,2.6rem);line-height:1.1}
p{margin:18px 0 0;font-size:1rem;line-height:1.8;color:#3D3D4E}
button{margin-top:28px;min-height:48px;padding:14px 26px;border-radius:30px;border:1px solid rgba(167,127,102,.4);background:rgba(167,127,102,.12);color:#7a5236;font:inherit;font-size:.78rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
</style>
</head>
<body>
<header><a href="${lp}/"><img src="${lp}/uploads/logo_opdds_fd_claro.webp" alt="O Poder dos Desacreditados"></a></header>
<main>
<div class="label"><span></span>E-mails</div>
${corpo}
</main>
</body>
</html>`;
}

export function paginaConfirmarDescadastro(token: string) {
  return layout(
    'Sair da lista',
    `<h1>Quer parar de receber nossos e-mails?</h1>
<p>Confirme abaixo e não enviamos mais nada para você. Sua carta continua disponível no link que você recebeu.</p>
<form method="post" action="descadastrar">
<input type="hidden" name="t" value="${escapeHtml(token)}">
<button type="submit">Confirmar descadastro</button>
</form>`,
  );
}

export function paginaDescadastrado() {
  return layout(
    'Descadastrado',
    `<h1>Pronto. Você não vai mais receber nossos e-mails.</h1>
<p>Se mudar de ideia, é só refazer o quiz na página do livro. Para pedir a exclusão dos seus dados, veja a <a href="${getLpUrl()}/privacidade.html">página de privacidade</a>.</p>`,
  );
}

export function paginaLinkInvalido() {
  return layout(
    'Link inválido',
    `<h1>Este link não é mais válido.</h1>
<p>Talvez seus dados já tenham sido excluídos. Se ainda estiver recebendo e-mails, responda qualquer um deles pedindo para sair.</p>`,
  );
}

// "Enviar carta no WhatsApp" dos avisos: o formulário se envia sozinho (POST
// marca a carta como enviada e redireciona para o wa.me). Robôs de e-mail só
// fazem GET, então não marcam nada.
export const CSP_ENVIAR_CARTA =
  "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src https:; script-src 'unsafe-inline'; form-action 'self' https://wa.me https://api.whatsapp.com; base-uri 'none'";

export function paginaEnviarCarta(primeiroNome: string, pilar: string) {
  return layout(
    'Enviar carta',
    `<h1>Abrindo o WhatsApp…</h1>
<p>Carta de ${escapeHtml(primeiroNome)} · ${escapeHtml(pilar)}. A mensagem já vai pronta, é só tocar em enviar.</p>
<form method="post"><button type="submit">Abrir o WhatsApp</button></form>
<script>document.forms[0].submit()</script>`,
  ).replace('<span></span>E-mails', '<span></span>Leads do quiz');
}

export function paginaLinkExpirado() {
  return layout(
    'Link expirado',
    `<h1>Este link expirou ou não é válido.</h1>
<p>Abra o lead pelo admin (Leads do quiz) e use o botão "Enviar carta".</p>`,
  ).replace('<span></span>E-mails', '<span></span>Leads do quiz');
}
