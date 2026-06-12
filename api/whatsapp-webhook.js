const EVOLUTION_URL = process.env.VITE_EVOLUTION_API_URL || 'https://evolution-api-production-c20c.up.railway.app'
const EVOLUTION_KEY = process.env.VITE_EVOLUTION_API_KEY || '5B37DF4F-63EF-4262-9E72-B6C539BA65F2'
const INSTANCE = 'biz88c90e06eb494c5d'

const menuText = (nome) =>
  `Olá, ${nome}! 👋\n\nBem-vindo à *WK Presentes* 🎁\n\nComo posso te ajudar hoje?\n\n1️⃣ Ver produtos\n2️⃣ Verificar meu pedido\n3️⃣ Falar com um atendente\n\n_Digite o número da opção desejada_ 😊`

const PRODUTOS_TEXT = `🛍️ *Nossos Produtos*\n\n📦 Canecas personalizadas\n📦 Camisetas personalizadas\n📦 Almofadas personalizadas\n📦 Quadros personalizados\n\nPara fazer um pedido, fale conosco! 😊\n\nDigite *0* para voltar ao menu.`

const PEDIDO_TEXT = `🔍 *Verificar Pedido*\n\nInforme o *número do seu pedido* ou seu *nome completo* e verificamos o status para você! 📋\n\nDigite *0* para voltar ao menu.`

const ATENDENTE_TEXT = `👤 *Atendimento Humano*\n\nUm de nossos atendentes irá te ajudar em breve! ⏰\n\nHorário: Segunda a Sexta, das 9h às 18h. 😊`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true })
  }

  try {
    const body = req.body || {}
    const data = body?.data || {}
    const key = data?.key || {}
    const remoteJid = key?.remoteJid || ''
    const fromMe = key?.fromMe === true
    const pushName = data?.pushName || 'Cliente'
    const msg = data?.message || {}
    const text = (msg?.conversation || msg?.extendedTextMessage?.text || msg?.imageMessage?.caption || '').trim().toLowerCase()
    const isGroup = remoteJid.includes('@g.us')

    if (fromMe || isGroup || !text || !remoteJid) {
      return res.status(200).json({ ok: true, skipped: true })
    }

    let replyText
    switch (text) {
      case '1': replyText = PRODUTOS_TEXT; break
      case '2': replyText = PEDIDO_TEXT; break
      case '3': replyText = ATENDENTE_TEXT; break
      default: replyText = menuText(pushName)
    }

    await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        apikey: EVOLUTION_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: remoteJid,
        options: { delay: 1200 },
        textMessage: { text: replyText },
      }),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('whatsapp-webhook error:', err)
    return res.status(200).json({ ok: false })
  }
}
