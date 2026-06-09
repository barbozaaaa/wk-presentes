import { useState } from 'react'
import styles from './Automacoes.module.css'

interface Props { onToast: (msg: string) => void }

const flows = [
  {
    id: 'novo_pedido',
    icon: '📦',
    title: 'Novo pedido recebido',
    desc: 'Envia e-mail de confirmação para o cliente quando um novo pedido é cadastrado.',
    trigger: 'Pedido com status "Novo"',
    action: 'E-mail automático via N8N',
    active: true,
  },
  {
    id: 'arte_criada',
    icon: '🎨',
    title: 'Arte pronta para aprovação',
    desc: 'Notifica o cliente via e-mail com link para visualizar e aprovar a arte.',
    trigger: 'Pedido vai para "Aguardando aprovação"',
    action: 'E-mail com preview da arte',
    active: true,
  },
  {
    id: 'pronto',
    icon: '🎁',
    title: 'Pedido pronto para retirada',
    desc: 'Avisa o cliente que o produto está pronto e pode ser retirado ou enviado.',
    trigger: 'Pedido marcado como "Pronto"',
    action: 'E-mail + WhatsApp (opcional)',
    active: true,
  },
  {
    id: 'followup',
    icon: '⭐',
    title: 'Follow-up pós-entrega',
    desc: 'Solicita avaliação do cliente 2 dias após a entrega. Ótimo para fidelização.',
    trigger: '2 dias após "Entregue"',
    action: 'E-mail solicitando avaliação',
    active: false,
  },
]

export default function Automacoes({ onToast }: Props) {
  const [activeFlows, setActiveFlows] = useState<Set<string>>(
    new Set(flows.filter(f => f.active).map(f => f.id))
  )
  const [webhookUrl, setWebhookUrl] = useState('')
  const [savedWebhook, setSavedWebhook] = useState(false)

  function toggle(id: string) {
    setActiveFlows(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); onToast('⏸️ Automação pausada.') }
      else { next.add(id); onToast('▶️ Automação ativada!') }
      return next
    })
  }

  function saveWebhook() {
    if (!webhookUrl.trim()) return
    setSavedWebhook(true)
    onToast('🔗 Webhook N8N salvo com sucesso!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Automações</h1>
          <p className={styles.sub}>Fluxos automáticos para atendimento e notificações</p>
        </div>
        <div className={styles.n8nBadge}>
          <span>⚡</span> N8N Integration
        </div>
      </div>

      {/* N8N Webhook config */}
      <div className={styles.webhookCard}>
        <div className={styles.webhookHead}>
          <span className={styles.webhookIcon}>🔗</span>
          <div>
            <div className={styles.webhookTitle}>Configurar N8N Webhook</div>
            <div className={styles.webhookDesc}>Cole a URL do webhook do seu N8N para ativar as notificações por e-mail</div>
          </div>
          {savedWebhook && <span className={styles.savedBadge}>✅ Salvo</span>}
        </div>
        <div className={styles.webhookForm}>
          <input
            className={styles.webhookInput}
            placeholder="https://seu-n8n.app.n8n.cloud/webhook/..."
            value={webhookUrl}
            onChange={e => { setWebhookUrl(e.target.value); setSavedWebhook(false) }}
          />
          <button className={styles.webhookBtn} onClick={saveWebhook} disabled={!webhookUrl.trim()}>
            Salvar
          </button>
        </div>
        <div className={styles.webhookHelp}>
          💡 No N8N: crie um workflow com gatilho <strong>Webhook</strong> → ação <strong>Send Email</strong>.
          O Flow Evolution enviará os dados do pedido automaticamente.
        </div>
      </div>

      {/* Flows */}
      <div className={styles.flowGrid}>
        {flows.map(flow => {
          const isActive = activeFlows.has(flow.id)
          return (
            <div key={flow.id} className={`${styles.flowCard} ${isActive ? styles.flowActive : ''}`}>
              <div className={styles.flowHead}>
                <span className={styles.flowIcon}>{flow.icon}</span>
                <div className={styles.flowInfo}>
                  <div className={styles.flowTitle}>{flow.title}</div>
                  <div className={styles.flowDesc}>{flow.desc}</div>
                </div>
                <button
                  className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => toggle(flow.id)}
                >
                  {isActive ? '● ON' : '○ OFF'}
                </button>
              </div>
              <div className={styles.flowDetails}>
                <div className={styles.flowDetail}>
                  <span className={styles.detailLabel}>⚡ Gatilho</span>
                  <span className={styles.detailValue}>{flow.trigger}</span>
                </div>
                <div className={styles.flowDetail}>
                  <span className={styles.detailLabel}>📤 Ação</span>
                  <span className={styles.detailValue}>{flow.action}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI hint */}
      <div className={styles.aiCard}>
        <div className={styles.aiIcon}>🤖</div>
        <div>
          <div className={styles.aiTitle}>IA para atendimento (em breve)</div>
          <div className={styles.aiDesc}>
            Em breve: respostas automáticas para WhatsApp e Instagram com IA.
            O sistema vai identificar pedidos, tirar dúvidas sobre produtos e coletar informações da personalização — tudo sem precisar de atendimento manual.
          </div>
        </div>
      </div>
    </div>
  )
}
