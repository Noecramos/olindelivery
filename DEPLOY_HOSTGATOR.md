# Guia de Deploy - HostGator (Node.js)

Este guia explica como colocar sua aplicação **OlinDelivery** no ar usando a hospedagem HostGator.

⚠️ **IMPORTANTE:** Para rodar esta aplicação (Next.js com API Routes), você **PRECISA** de uma hospedagem que suporte **Node.js**.
- **Planos Compartilhados (P/M/Turbo):** Geralmente têm suporte via cPanel ("Setup Node.js App"), mas pode ser limitado.
- **VPS/Dedicado:** É o ideal e oferece controle total.

---

## Opção A: Deploy via cPanel (Hospedagem Compartilhada)

Se o seu plano tem a opção **"Setup Node.js App"** no cPanel:

### 1. Preparar os Arquivos
Você não deve subir a pasta `node_modules`.
1.  No seu computador, rode:
    ```bash
    npm run build
    ```
2.  Isso vai criar uma pasta `.next`.
3.  Crie um arquivo chamado `server.js` na raiz do projeto (se não existir) para servir a aplicação (necessário para cPanel geralmente).
    *Conteúdo sugerido para server.js:*
    ```javascript
    const { createServer } = require('http');
    const { parse } = require('url');
    const next = require('next');

    const dev = process.env.NODE_ENV !== 'production';
    const app = next({ dev });
    const handle = app.getRequestHandler();
    const port = process.env.PORT || 3000;

    app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
    });
    ```
4.  Comprima os seguintes arquivos/pastas em um `.zip`:
    - `.next` (pasta)
    - `public` (pasta)
    - `package.json`
    - `next.config.ts` (ou .js)
    - `server.js`
    - `credentials.json` (Suas credenciais do Google Sheets - **NUNCA COMPARTILHE**)
    - `.env.local` (Seus segredos)

### 2. Configurar no cPanel
1.  Acesse o cPanel da HostGator.
2.  Clique em **"Setup Node.js App"**.
3.  **Create Application**:
    - **Node.js version:** Escolha a mais recente (v18 ou v20).
    - **Application mode:** Production.
    - **Application root:** `olindelivery` (Recomendado: deixe fora do public_html se possível).
    - **Application URL:** Selecione `olindelivery.noveimagem.com.br` no dropdown.
    - **Application startup file:** `server.js` (Obrigatório).
4.  Clique em **Create**.

### 3. Upload e Instalação
1.  Vá no **Gerenciador de Arquivos** do cPanel.
2.  Navegue até a pasta raiz criada (ex: `olindelivery`). **Atenção:** Não é a pasta dentro de public_html, é a pasta da aplicação raiz.
3.  Faça upload do seu `.zip` e extraia tudo lá.
4.  Volte para a tela "Setup Node.js App".
5.  Clique no botão **"Run NPM Install"**. (Isso vai instalar as dependências baseadas no package.json).
6.  Após instalar, clique em **Restart**.

### 4. Variáveis de Ambiente
No cPanel, pode ser difícil configurar `.env.local`. Você pode adicionar as variáveis manualmente na tela de configuração do Node.js App ou garantir que o arquivo `.env.local` subiu corretamente.

---

## Opção B: VPS (Cenário Ideal)

Se você tem um VPS Linux (Ubuntu/CentOS):

1.  **Instale o Node.js 18+** no servidor.
2.  Clone seu repositório ou suba os arquivos (exceto node_modules).
3.  Rode `npm install`.
4.  Rode `npm run build`.
5.  Use o **PM2** para manter o site online:
    ```bash
    npm install -g pm2
    pm2 start npm --name "olindelivery" -- start
    ```
6.  Configure o **Nginx** como Proxy Reverso para apontar o domínio (porta 80/443) para a porta 3000 do seu app.

---

## Dicas Importantes
- **Google Sheets:** Certifique-se de que o arquivo `credentials.json` está no servidor e o caminho no `.env.local` está correto (use caminhos relativos ou absolutos do servidor).
- **Imagens:** O upload de imagens está salvando na pasta `public/uploads`. No deploy, se a pasta for sobrescrita a cada deploy, você perde as imagens. Em produção, recomenda-se usar um serviço como **AWS S3** ou **Cloudinary** para uploads.
