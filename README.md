# ⚡ Flow Evolution — Painel de Gestão SaaS

Sistema de gestão para pequenos negócios (SaaS multi-tenant) com bot de WhatsApp integrado.

**Deploy:** https://wk-presentes.vercel.app  
**Repositório:** https://github.com/barbozaaaa/wk-presentes

---

## 🗂️ Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite |
| Banco de dados | Supabase (PostgreSQL) |
| Deploy | Vercel (auto-deploy via GitHub) |
| Bot WhatsApp | Evolution API + n8n |
| Hosting Bot | Railway |

---

## ✅ O que já está pronto

- [x] Sistema completo: Dashboard, Pedidos, Produtos, Clientes, Atendimento, Financeiro
- [x] Página de Análise de Rentabilidade por produto
- [x] Login com layout split-screen (apresentação do produto + formulário)
- [x] Marca: **Flow Evolution** (SaaS genérico, desvinculado da WK Presentes)
- [x] Multi-tenant: cada empresa cadastrada fica isolada no banco
- [x] Evolution API hospedada no Railway (online)
- [x] PostgreSQL conectado na Evolution API (Railway)
- [x] Workflow do n8n importado (WhatsApp Bot)

---

## 🚧 ONDE PARAMOS — Continuar em casa

### Situação atual
A Evolution API está rodando em:
```
https://evolution-api-production-c20c.up.railway.app
```
**API Key:** `flowevolution2025secretkey`

O n8n Cloud está em:
```
https://barboza15.app.n8n.cloud
```
**Webhook URL (test):** `https://barboza15.app.n8n.cloud/webhook-test/whatsapp-bot`

---

### PRÓXIMOS PASSOS (em ordem)

#### PASSO 1 — Verificar se a Evolution API está online
Abra no navegador:
```
https://evolution-api-production-c20c.up.railway.app
```
Deve aparecer: `{"status":200,"message":"Welcome to the Evolution API"}`

Se não aparecer: acesse railway.app → projeto → evolution-api → verificar logs.

---

#### PASSO 2 — Criar instância do WhatsApp
Use o Postman, Insomnia ou Thunder Client (extensão do VS Code):

```
POST https://evolution-api-production-c20c.up.railway.app/instance/create
Headers:
  apikey: flowevolution2025secretkey
  Content-Type: application/json

Body:
{
  "instanceName": "flow-evolution",
  "integration": "WHATSAPP-BAILEYS",
  "qrcode": true,
  "webhookUrl": "https://barboza15.app.n8n.cloud/webhook/whatsapp-bot",
  "webhookByEvents": false,
  "webhookBase64": false,
  "events": ["MESSAGES_UPSERT"]
}
```

---

#### PASSO 3 — Pegar o QR Code e conectar o WhatsApp
```
GET https://evolution-api-production-c20c.up.railway.app/instance/connect/flow-evolution
Headers:
  apikey: flowevolution2025secretkey
```
A resposta tem um campo `base64` com a imagem do QR Code.
Converta em imagem em: https://base64.guru/converter/decode/image
Escaneie com o WhatsApp do número da loja.

---

#### PASSO 4 — Ativar o workflow no n8n
1. Acesse app.n8n.cloud
2. Abra o workflow **"WK Presentes - Bot WhatsApp"**
3. Clique no toggle **Inactive → Active**
4. A URL de produção (sem -test) será:
   ```
   https://barboza15.app.n8n.cloud/webhook/whatsapp-bot
   ```

---

#### PASSO 5 — Atualizar credenciais nos nós do n8n

| Placeholder | Valor real |
|---|---|
| `SEU_SERVIDOR` | `evolution-api-production-c20c.up.railway.app` |
| `SUA_EVOLUTION_API_KEY` | `flowevolution2025secretkey` |
| `SEU_NOME_INSTANCIA` | `flow-evolution` |
| `SUA_OPENAI_API_KEY` | Criar em platform.openai.com/api-keys |
| `SEU_SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role |
| `SEU_BUSINESS_ID_AQUI` | Supabase SQL Editor → `SELECT id FROM businesses LIMIT 1` |

---

#### PASSO 6 — Testar o bot
1. Mande "oi" para o número conectado
2. Teste: "status do meu pedido", "quanto custa", "quero fazer um pedido"
3. Qualquer outra mensagem → GPT-4o-mini responde automaticamente

---

## 🔑 Acessos importantes

| Serviço | URL |
|---|---|
| Site (produção) | https://wk-presentes.vercel.app |
| Evolution API | https://evolution-api-production-c20c.up.railway.app |
| n8n Cloud | https://barboza15.app.n8n.cloud |
| Supabase | https://supabase.com/dashboard |
| Railway | https://railway.app → projeto `handsome-gratitude` |

---

## 📁 Estrutura do projeto

```
src/
├── pages/
│   ├── Login.tsx          # Tela de login split-screen
│   ├── Dashboard.tsx      # Painel principal
│   ├── Pedidos.tsx        # Gestão de pedidos
│   ├── Produtos.tsx       # Cadastro de produtos
│   ├── Clientes.tsx       # Gestão de clientes
│   ├── Atendimento.tsx    # Atendimentos
│   ├── Financeiro.tsx     # Relatório financeiro
│   ├── Analise.tsx        # Análise de rentabilidade por produto
│   └── Configuracoes.tsx  # Configurações
├── components/
│   └── Sidebar.tsx
├── hooks/
│   └── useOrders.ts
├── context/
│   └── AuthContext.tsx
└── lib/
    └── supabase.ts

bot_wk/
├── n8n_whatsapp_bot.json  # Importar no n8n
├── n8n_instagram_bot.json # Importar no n8n
└── SETUP_BOT.md           # Guia completo de setup
```

---

## 🚀 Rodar localmente

```bash
npm install
npm run dev
# acesse http://localhost:5173
```

## 📦 Deploy

```bash
git add .
git commit -m "mensagem"
git push origin main
# Vercel faz deploy automático
```
