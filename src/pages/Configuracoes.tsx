import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import styles from './Configuracoes.module.css'

interface Props { onToast: (msg: string) => void }

interface BusinessConfig {
  name: string
  whatsapp: string
  instagram: string
  auto_message_new_order: string
  auto_message_ready: string
  email_notifications: boolean
}

const DEFAULT: BusinessConfig = {
  name: '',
  whatsapp: '',
  instagram: '',
  auto_message_new_order: 'Olá {nome}! Recebemos seu pedido de {produto}. Assim que a arte estiver pronta, entraremos em contato para aprovação. 😊',
  auto_message_ready: 'Olá {nome}! Seu pedido de {produto} está pronto para retirada/envio! 🎉',
  email_notifications: true,
}

export default function Configuracoes({ onToast }: Props) {
  const { session } = useAuth()
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'empresa' | 'mensagens' | 'sistema'>('empresa')

  useEffect(() => {
    async function load() {
      if (!session?.user) return
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()
      if (data) {
        const d = data as any
        setBusinessId(d.id)
        setConfig({
          name:                    d.name                    ?? '',
          whatsapp:                d.whatsapp                ?? '',
          instagram:               d.instagram               ?? '',
          auto_message_new_order:  d.auto_message_new_order  ?? DEFAULT.auto_message_new_order,
          auto_message_ready:      d.auto_message_ready      ?? DEFAULT.auto_message_ready,
          email_notifications:     d.email_notifications     ?? true,
        })
      }
      setLoading(false)
    }
    load()
  }, [session])

  function set(k: keyof BusinessConfig, v: string | boolean) {
    setConfig(p => ({ ...p, [k]: v }))
  }

  async function save() {
    if (!businessId) return
    setSaving(true)
    await supabase.from('businesses').update({
      name:                   config.name,
      whatsapp:               config.whatsapp,
      instagram:              config.instagram,
      auto_message_new_order: config.auto_message_new_order,
      auto_message_ready:     config.auto_message_ready,
      email_notifications:    config.email_notifications,
    } as any).eq('id', businessId)
    setSaving(false)
    onToast('✅ Configurações salvas!')
  }

  if (loading) return <div style={{ padding: '3rem', color: '#9a8070' }}>Carregando...</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Configurações</h1>
        <p className={styles.sub}>Gerencie as informações e preferências da sua empresa</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'empresa'   ? styles.tabActive : ''}`} onClick={() => setTab('empresa')}>🏢 Empresa</button>
        <button className={`${styles.tab} ${tab === 'mensagens' ? styles.tabActive : ''}`} onClick={() => setTab('mensagens')}>💬 Mensagens automáticas</button>
        <button className={`${styles.tab} ${tab === 'sistema'   ? styles.tabActive : ''}`} onClick={() => setTab('sistema')}>⚙️ Sistema</button>
      </div>

      <div className={styles.card}>
        {/* ── EMPRESA ── */}
        {tab === 'empresa' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Informações da empresa</div>
            <div className={styles.sectionDesc}>Esses dados aparecem no painel e serão usados nas automações.</div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Nome da empresa</label>
                <input
                  placeholder="Ex: Minha Loja"
                  value={config.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>WhatsApp</label>
                  <div className={styles.inputIcon}>
                    <span>💬</span>
                    <input
                      placeholder="(11) 99999-9999"
                      value={config.whatsapp}
                      onChange={e => set('whatsapp', e.target.value)}
                    />
                  </div>
                  <span className={styles.hint}>Número que recebe pedidos pelo WhatsApp</span>
                </div>
                <div className={styles.field}>
                  <label>Instagram</label>
                  <div className={styles.inputIcon}>
                    <span>📸</span>
                    <input
                      placeholder="@wkcanecas"
                      value={config.instagram}
                      onChange={e => set('instagram', e.target.value)}
                    />
                  </div>
                  <span className={styles.hint}>Arroba do perfil da empresa</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MENSAGENS ── */}
        {tab === 'mensagens' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Mensagens automáticas</div>
            <div className={styles.sectionDesc}>
              Textos enviados automaticamente ao cliente em cada etapa do pedido.<br />
              Use <code>{'{nome}'}</code> para o nome do cliente e <code>{'{produto}'}</code> para o produto.
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <label>📦 Novo pedido recebido</label>
                <textarea
                  rows={3}
                  value={config.auto_message_new_order}
                  onChange={e => set('auto_message_new_order', e.target.value)}
                />
                <span className={styles.hint}>Enviada quando um pedido é cadastrado no sistema</span>
              </div>

              <div className={styles.field}>
                <label>✅ Pedido pronto para entrega</label>
                <textarea
                  rows={3}
                  value={config.auto_message_ready}
                  onChange={e => set('auto_message_ready', e.target.value)}
                />
                <span className={styles.hint}>Enviada quando o pedido é marcado como "Pronto"</span>
              </div>

              <div className={styles.infoBox}>
                🤖 As mensagens serão enviadas automaticamente pelo bot de WhatsApp quando a integração estiver ativa.
              </div>
            </div>
          </div>
        )}

        {/* ── SISTEMA ── */}
        {tab === 'sistema' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Preferências do sistema</div>
            <div className={styles.sectionDesc}>Controle como o Flow Evolution se comporta para você.</div>

            <div className={styles.fields}>
              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>Notificações por e-mail</div>
                  <div className={styles.toggleDesc}>Receber resumo diário de pedidos no e-mail</div>
                </div>
                <button
                  className={`${styles.toggle} ${config.email_notifications ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => set('email_notifications', !config.email_notifications)}
                >
                  {config.email_notifications ? 'Ativo' : 'Inativo'}
                </button>
              </div>

              <div className={styles.divider} />

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Plano atual</span>
                <span className={styles.infoBadge}>Trial</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>E-mail da conta</span>
                <span className={styles.infoValue}>{session?.user?.email}</span>
              </div>

              <div className={styles.infoBox}>
                💡 Mais opções de configuração serão adicionadas em breve: fuso horário, idioma, temas e integrações.
              </div>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.btnSave} onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : '💾 Salvar configurações'}
          </button>
        </div>
      </div>
    </div>
  )
}
