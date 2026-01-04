# Deploy Gratuito com Vercel + GitHub

Este guia passo a passo vai te ensinar a colocar seu projeto online de graça usando o GitHub e a Vercel.

---

## Passo 1: Preparar o GitHub (Seu Repositório)

1.  Acesse [github.com](https://github.com) e faça login (ou crie uma conta).
2.  No canto superior direito, clique no **"+"** e selecione **"New repository"**.
3.  **Repository name:** Digite `olindelivery` (ou o nome que quiser).
4.  **Visibility:** Escolha **Public** (Grátis) ou **Private** (Recomendado se tiver dados sensíveis no código, mas a Vercel suporta ambos).
5.  Clique em **Create repository**.
6.  O GitHub vai te mostrar uma tela com comandos. Copie o link HTTPS do repositório (ex: `https://github.com/SEU_USUARIO/olindelivery.git`).

---

## Passo 2: Enviar o Código (No seu computador)

Abra o terminal na pasta do projeto (`d:\Antigravity\olindelivery`) e rode os comandos abaixo, um por um:

1.  **Adicionar seus arquivos ao Git:**
    ```bash
    git add .
    ```

2.  **Salvar a versão inicial:**
    ```bash
    git commit -m "Primeiro deploy - OlinDelivery SaaS"
    ```

3.  **Conectar com o GitHub** (Substitua pelo SEU link do passo 1):
    ```bash
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/olindelivery.git
    ```
    *(Se der erro dizendo que "remote origin already exists", rode `git remote set-url origin SEU_LINK`)*

4.  **Enviar os arquivos:**
    ```bash
    git push -u origin main
    ```
    *(O terminal pode pedir seu login e senha do GitHub. Se usar autenticação de dois fatores, precisará de um Personal Access Token como senha).*

---

## Passo 3: Criar Conta na Vercel

1.  Acesse [vercel.com](https://vercel.com).
2.  Clique em **Sign Up**.
3.  Escolha **Continue with GitHub**. (Isso já conecta tudo automaticamente).

---

## Passo 4: Importar e Configurar na Vercel

1.  No painel da Vercel, clique em **"Add New..."** -> **"Project"**.
2.  Você verá seu repositório `olindelivery` na lista "Import Git Repository". Clique em **Import**.
3.  **Configure Project:**
    *   **Project Name:** Pode deixar como está.
    *   **Framework Preset:** Deve detectar "Next.js" automaticamente.
    *   **Root Directory:** Deixe `./`.

4.  **Environment Variables (MUITO IMPORTANTE):**
    Aqui você precisa colocar as chaves do Google Sheets.
    Abra a seção **"Environment Variables"** e adicione:

    | Key (Nome) | Value (Valor) |
    | :--- | :--- |
    | `GOOGLE_SHEET_ID` | (Copie do seu arquivo .env.local) |
    | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | (Copie do seu arquivo .env.local) |
    | `GOOGLE_PRIVATE_KEY` | (Copie do .env.local. **Atenção:** Se a chave tiver quebras de linha `\n`, certifique-se de copiar tudo corretamente). |

5.  Clique em **Deploy**.

---

## Passo 5: Sucesso! 🎉

A Vercel vai construir seu site. Em cerca de 1 a 2 minutos, você verá uma tela de confetes dizendo "Congratulations!".
Clique na imagem do site ou no botão **"Visit"** para ver seu SaaS rodando ao vivo na internet!

---

## Dica Extra: Atualizações
Sempre que você quiser atualizar o site:
1.  Faça as alterações no código.
2.  Rode `git add .`
3.  Rode `git commit -m "descrição da mudança"`
4.  Rode `git push`
A Vercel vai detectar a mudança e atualizar o site sozinha!
