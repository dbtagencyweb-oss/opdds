<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_jgXM90GQQ_srWdj5ihdLT80b1H0S5V-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# Ambiente local

Inicie o frontend pela raiz do projeto:

```powershell
npm run dev:frontend
```

Use sempre:

```text
http://127.0.0.1:5173/
```

A porta é fixa. Se `5173` já estiver ocupada, o servidor exibirá um erro em vez de iniciar silenciosamente em `5174`.
