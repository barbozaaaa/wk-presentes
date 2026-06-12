# ⚡ Flow Evolution — Painel de Gestão SaaS

Sistema de gestão para pequenos negócios (SaaS multi-tenant) com bot de atendimento automático via WhatsApp.

**Deploy (produção):** https://wk-presentes.vercel.app  
**Repositório:** https://github.com/barbozaaaa/wk-presentes

---

## 🗂️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Deploy | Vercel (auto-deploy via GitHub) |
| Bot WhatsApp | Evolution API v1 + Vercel Serverless Function |
| Hosting Evolution API | Railway |

---

## ✅ O que está funcionando hoje

- [x] Sistema completo: Dashboard, Pedidos, Produtos, Clientes, Atendimento, Financeiro
- [x] Análise de Rentabilidade por produto
- [x] Login com layout split-screen
- [x] Multi-tenant: cada empresa isolada no banco (RLS no Supabase)
- [x] **Aba WhatsApp** nas Configurações: exibe status de conexão ao vivo
- [x] **Evolution API v1.8.2** hospedada no Railway (`handsome-gratitude`) — WhatsApp **conectado**
- [x] **Bot de atendimento** rodando como **Vercel Function** (`/api/whatsapp-webhook`) — sem limite de execuções
- [x] Webhook da Evolution API apontando para a Vercel (evento `MESSAGES_UPSERT`)
- [x] Bot responde com saudação pelo nome + menu de opções
- [x] Vercel redeployado com variáveis corretas da v1

---

## 🔑 Acessos

| Serviço | URL / Info |
|---|---|
| Site (produção) | https://wk-presentes.vercel.app |
| Webhook do bot | `https://wk-presentes.vercel.app/api/whatsapp-webhook` |
| Evolution API v1 | `https://evolution-api-production-c20c.up.railway.app` |
| API Key v1 | `5B37DF4F-63EF-4262-9E72-B6C539BA65F2` |
| Supabase | https://supabase.com/dashboard → projeto `ecimoomzvdvzahmiyudg` |
| Railway (v1) | https://railway.app → projeto `handsome-gratitude` |
| Railway (v2) | https://railway.app → projeto `carefree-mercy` (**bloqueado pelo WhatsApp**) |
| n8n Cloud | https://barboza11.app.n8n.cloud — workflow `Bot WK Presentes` (ID `JnC9Obd9PPPMojQ3`) **DESATIVADO**, mantido apenas como referência |

---

## 🤖 Como o bot funciona

```
Cliente manda mensagem no WhatsApp
        ↓
Evolution API (v1, Railway) dispara webhook MESSAGES_UPSERT
        ↓
Vercel Function /api/whatsapp-webhook recebe o POST
        ↓
Extrai: remoteJid, pushName, text, isGroup, fromMe
        ↓
Filtra: ignora grupos, mensagens próprias e vazias
        ↓
Roteador por texto:
  1 → Produtos
  2 → Verificar Pedido
  3 → Falar Atendente
  (qualquer outra) → Menu/Saudação (com nome)
        ↓
HTTP POST para Evolution API v1 → mensagem enviada ao cliente
```

Código-fonte do bot: [`api/whatsapp-webhook.js`](api/whatsapp-webhook.js)

**Mensagens do bot:**
- **Saudação/Menu:** `Olá, {nome}! 👋 Bem-vindo à WK Presentes 🎁 [menu 1/2/3]`
- **Opção 1 – Produtos:** lista de produtos personalizados
- **Opção 2 – Pedido:** pede número/nome do pedido para verificar status
- **Opção 3 – Atendente:** informa que atendente responderá em breve

---

## 🚧 Histórico de problemas e soluções

### Problema 1 — QR Code nunca aparecia no painel

**Causa:** O frontend estava apontando para a **Evolution API v2** (`carefree-mercy` no Railway), cujo IP foi **bloqueado pelo WhatsApp**. A v2 chamada de `/instance/connect` retornava `count: 0` e nunca gerava QR Code.

**Tentativas que não funcionaram:**
- Upgrade da v2 de 2.1.1 para 2.2.3
- Configuração de proxy Webshare.io (não é aplicado ao WebSocket do Baileys)

**Solução:** Usar a **Evolution API v1** (`handsome-gratitude` no Railway), que já estava conectada com `state: open`. O frontend foi atualizado para apontar para a v1.

---

### Problema 2 — Bot não respondia (sessão anterior)

**Causa:** O workflow do bot estava em uma **conta n8n diferente** (`barboza15.app.n8n.cloud`) que não tinha acesso nesta sessão. Além disso, o webhook da Evolution API apontava para `barboza15` em vez de `barboza11`.

**Solução:**
1. Identificar a conta correta em uso: `barboza11.app.n8n.cloud`
2. Atualizar webhook da Evolution API v1 para `https://barboza11.app.n8n.cloud/webhook/whatsapp-bot`
3. Criar novo workflow de bot na conta `barboza11`

---

### Problema 3 — Webhook do QR Code apontava para conta errada

**Causa:** O workflow "Capturar QR Code" estava ativo no `barboza11`, mas o webhook da Evolution API v2 apontava para `barboza15.app.n8n.cloud/webhook/qr-code`. Os eventos de QR nunca chegavam ao n8n.

**Solução:** Atualizado o webhook da v2 para `barboza11.app.n8n.cloud/webhook/qr-code` (para consistência futura).

---

### Problema 4 — Warnings no n8n Workflow SDK (campo `body` em modo raw)

**Causa:** O validador do SDK reportava conflito entre `body` (exige `specifyBody='string'`) e `specifyBody` (não aceita `'string'` com `contentType='raw'`).

**Solução:** Trocar para `contentType: 'json'` + `specifyBody: 'json'` + `jsonBody: expr(...)`. Zero warnings, workflow válido.

---

### Problema 5 — Bot parou de responder: limite de execuções do n8n

**Causa:** O plano gratuito do n8n Cloud (`barboza11.app.n8n.cloud`) estourou o limite de **1000 execuções/mês**. As últimas **356 execuções** do workflow do bot retornaram erro:
> "Execution limit reached. Consider upgrading your plan."

Ou seja, toda mensagem recebida no WhatsApp disparava o webhook, mas o n8n recusava executar o workflow — o bot ficou completamente mudo.

**Solução definitiva:** Migrar a lógica do bot do n8n para uma **Vercel Serverless Function** (`/api/whatsapp-webhook.js`), que roda no mesmo projeto/deploy do painel, é gratuita no plano Hobby e **não tem limite mensal de execuções** para esse volume.

- O webhook da Evolution API foi atualizado para `https://wk-presentes.vercel.app/api/whatsapp-webhook`
- O workflow `Bot WK Presentes` no n8n foi **desativado** (mantido apenas como referência/backup da lógica)

---

## 📦 Histórico de alterações

### Sessão 2 (atual) — Bot migrado para Vercel Function

- **Novo arquivo `api/whatsapp-webhook.js`**: reimplementa toda a lógica do bot (saudação + menu 1/2/3) como Vercel Serverless Function, sem depender do n8n
- **`vercel.json`**: rewrite do SPA ajustado para `/((?!api/).*)`, garantindo que `/api/*` não seja redirecionado para `index.html`
- **Webhook da Evolution API v1** atualizado de `barboza11.app.n8n.cloud/webhook/whatsapp-bot` → `https://wk-presentes.vercel.app/api/whatsapp-webhook`
- **Workflow `Bot WK Presentes` no n8n desativado** (estourou limite de 1000 execuções/mês do plano gratuito — ver Problema 5)
- Testado em produção: endpoint responde `{"ok":true}` e envia mensagens reais via Evolution API

### Sessão 1 — Conexão WhatsApp + bot inicial no n8n

#### `supabase/schema.sql`
- Adicionada coluna `evolution_instance TEXT` na tabela `businesses` — armazena o nome da instância WhatsApp de cada empresa (ex: `biz88c90e06eb494c5d`)
- Adicionada coluna `qr_code TEXT` na tabela `businesses` — usada para guardar o base64 do QR Code temporariamente durante a conexão

#### `src/pages/Configuracoes.tsx`
- Implementada aba **"WhatsApp"** completa com 4 estados: `loading`, `disconnected`, `qrcode`, `connected`
- Polling do Supabase a cada 3s aguardando QR Code
- Botões de conectar, desconectar e gerar novo QR
- Usa variáveis de ambiente `VITE_EVOLUTION_API_URL` e `VITE_EVOLUTION_API_KEY`

#### `src/pages/Configuracoes.module.css`
- Estilos completos da aba WhatsApp: `.waBox`, `.waConnected`, `.waStatusDot`, `.waDisconnected`, `.waQr`, `.qrImage`, `.btnConnect`, `.btnDisconnect`, `.btnRefresh`

#### `.gitignore`
- Adicionado `.env` (contém segredos — nunca commitar)
- Adicionado `.env*.local` (tokens Vercel)
- Adicionado `.claude/` (arquivos de sessão do Claude Code)

#### Vercel — variáveis de ambiente atualizadas
- `VITE_EVOLUTION_API_URL` → de `evolution-api-production-eb9d` (v2 bloqueada) para `evolution-api-production-c20c` (v1 funcionando)
- `VITE_EVOLUTION_API_KEY` → chave correta da v1

#### n8n — workflow inicial criado (depois desativado na Sessão 2)
- **Nome:** Bot WK Presentes — **ID:** `JnC9Obd9PPPMojQ3` — conta `barboza11.app.n8n.cloud`
- **8 nós:** Webhook → Extrair Mensagem → Mensagem Válida? → Opção do Menu → [Enviar Menu / Enviar Produtos / Verificar Pedido / Falar Atendente]

---

## 🚀 Próximos passos

- [ ] Persistência de estado do bot (ex: aguardando número do pedido após opção 2) — hoje a function é stateless
- [ ] Integrar verificação real de pedidos no Supabase (opção 2 do menu)
- [ ] Suporte multi-tenant completo: cada empresa SaaS conecta sua própria instância WhatsApp e o `api/whatsapp-webhook.js` precisa identificar qual `instance`/empresa recebeu a mensagem (via `body.instance`) e buscar config no Supabase
- [ ] Frontend detectar `evolution_instance` existente e mostrar status conectado automaticamente
- [ ] Reconexão automática quando o WhatsApp desconectar

---

## 📁 Estrutura do projeto

```
api/
└── whatsapp-webhook.js     # Bot WhatsApp (Vercel Serverless Function)

src/
├── pages/
│   ├── Login.tsx           # Login split-screen
│   ├── Dashboard.tsx       # Painel principal
│   ├── Pedidos.tsx         # Gestão de pedidos
│   ├── Produtos.tsx        # Cadastro de produtos
│   ├── Clientes.tsx        # Gestão de clientes
│   ├── Atendimento.tsx     # Atendimentos
│   ├── Financeiro.tsx      # Relatório financeiro
│   ├── Analise.tsx         # Análise de rentabilidade
│   └── Configuracoes.tsx   # Configurações + aba WhatsApp
├── components/
│   └── Sidebar.tsx
├── context/
│   └── AuthContext.tsx
└── lib/
    └── supabase.ts

supabase/
└── schema.sql              # Schema do banco (businesses, customers, orders, products...)
```

---

## 🚀 Rodar localmente

```bash
npm install
npm run dev
# acesse http://localhost:5173
```

Crie o arquivo `.env` (não commitado) com:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_EVOLUTION_API_URL=https://evolution-api-production-c20c.up.railway.app
VITE_EVOLUTION_API_KEY=5B37DF4F-63EF-4262-9E72-B6C539BA65F2
```

## 📦 Deploy

```bash
git add .
git commit -m "mensagem"
git push origin main
# Vercel faz deploy automático via GitHub
```
