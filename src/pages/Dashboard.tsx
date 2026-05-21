import { useAuth } from '../context/AuthContext'
import { useOrders } from '../hooks/useOrders'
import Badge from '../components/Badge'
import styles from './Dashboard.module.css'

interface Props { onToast: (msg: string) => void }

export default function Dashboard({ onToast }: Props) {
  const { session } = useAuth()
  const { orders, loading, updateStatus } = useOrders()

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayStr = new Date().toISOString().slice(0, 10)

  const todayOrders = orders.filter(o => o.created_at?.slice(0, 10) === todayStr)
  const pending     = orders.filter(o => ['aguardando_aprovacao'].includes(o.status)).length
  const inProduction = orders.filter(o => o.status === 'em_producao').length
  const monthStr    = new Date().toISOString().slice(0, 7)
  const monthOrders = orders.filter(o => o.created_at?.slice(0, 7) === monthStr)
  const monthRevenue = monthOrders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + (o.total_value ?? 0), 0)

  const businessName = (session?.user?.user_metadata?.business_name as string) ?? 'WK Presentes'
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  const recentOrders = orders.slice(0, 8)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>{greeting}, {businessName} 🎁</h1>
          <p className={styles.sub}>
            <span className={styles.live}><span className={styles.liveDot}/>sistema online</span>
            · {today}
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => onToast('➕ Use a aba Pedidos para criar um novo pedido!')}>
            ＋ Novo pedido
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard icon="📦" value={String(todayOrders.length)} label="Pedidos hoje"
          change="novos pedidos" color="#c17f4a" />
        <StatCard icon="🎨" value={String(pending)} label="Aguard. aprovação"
          change="precisam de atenção" color="#d4961a" />
        <StatCard icon="🔧" value={String(inProduction)} label="Em produção"
          change="sendo confeccionados" color="#1a8a5a" />
        <StatCard icon="💰" value={`R$${monthRevenue.toFixed(0)}`} label="Faturamento do mês"
          change={`${monthOrders.length} pedidos no mês`} color="#1a6ab0" />
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Pedidos recentes</span>
            <Badge variant="brown">{orders.length} total</Badge>
          </div>
          {loading ? (
            <div className={styles.empty}>Carregando...</div>
          ) : recentOrders.length === 0 ? (
            <div className={styles.empty}>Nenhum pedido ainda. Comece cadastrando um!</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Cliente</th><th>Produto</th><th>Valor</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div className={styles.clientName}>{o.customer_name}</div>
                      <div className={styles.clientPhone}>{o.customer_phone}</div>
                    </td>
                    <td className={styles.product}>{(o.items?.[0]?.produto) ?? '—'}</td>
                    <td className={styles.value}>R${o.total_value?.toFixed(2) ?? '0.00'}</td>
                    <td>
                      {o.status === 'novo'                && <Badge variant="blue">Novo</Badge>}
                      {o.status === 'criando_arte'        && <Badge variant="purple">Criando Arte</Badge>}
                      {o.status === 'aguardando_aprovacao' && <Badge variant="amber">Ag. Aprovação</Badge>}
                      {o.status === 'aprovado'            && <Badge variant="green">Aprovado</Badge>}
                      {o.status === 'em_producao'         && <Badge variant="brown">Em Produção</Badge>}
                      {o.status === 'pronto'              && <Badge variant="green">Pronto</Badge>}
                      {o.status === 'entregue'            && <Badge variant="gray">Entregue</Badge>}
                      {o.status === 'cancelado'           && <Badge variant="red">Cancelado</Badge>}
                    </td>
                    <td>
                      {o.status === 'novo' && (
                        <button className={styles.btnSm} onClick={async () => {
                          await updateStatus(o.id, 'criando_arte')
                          onToast('🎨 Pedido movido para Criando Arte!')
                        }}>Iniciar arte</button>
                      )}
                      {o.status === 'aprovado' && (
                        <button className={styles.btnSm} onClick={async () => {
                          await updateStatus(o.id, 'em_producao')
                          onToast('🔧 Produção iniciada!')
                        }}>Produzir</button>
                      )}
                      {o.status === 'pronto' && (
                        <button className={styles.btnSm} onClick={async () => {
                          await updateStatus(o.id, 'entregue')
                          onToast('✅ Pedido marcado como entregue!')
                        }}>Entregar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Pipeline de pedidos</span>
          </div>
          <div className={styles.pipeline}>
            {[
              { status: 'novo',                  icon: '📩', label: 'Novos' },
              { status: 'criando_arte',           icon: '🎨', label: 'Criando Arte' },
              { status: 'aguardando_aprovacao',   icon: '👁️', label: 'Aprovação' },
              { status: 'em_producao',            icon: '🔧', label: 'Produção' },
              { status: 'pronto',                 icon: '✅', label: 'Prontos' },
            ].map(({ status, icon, label }) => {
              const count = orders.filter(o => o.status === status).length
              return (
                <div key={status} className={styles.pipelineItem}>
                  <span className={styles.pipeIcon}>{icon}</span>
                  <span className={styles.pipeCount}>{count}</span>
                  <span className={styles.pipeLabel}>{label}</span>
                </div>
              )
            })}
          </div>
          <div className={styles.automationBox}>
            <div className={styles.automationTitle}>⚡ Automação ativa</div>
            <div className={styles.automationDesc}>
              Notificações automáticas por e-mail são enviadas ao cliente quando o pedido avança de etapa.
            </div>
            <div className={styles.automationStatus}>
              <span className={styles.liveDot}/>
              <span>N8N conectado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, change, color }: {
  icon: string; value: string; label: string; change: string; color: string
}) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statVal} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statChange}>{change}</div>
    </div>
  )
}
