import { useAuth } from '../context/AuthContext'
import { useOrders, useProducts } from '../hooks/useOrders'
import Badge from '../components/Badge'
import styles from './Dashboard.module.css'

interface Props { onToast: (msg: string) => void; onNavigate: (p: string) => void }

export default function Dashboard({ onToast, onNavigate }: Props) {
  const { session } = useAuth()
  const { orders, loading: loadingOrders, updateStatus } = useOrders()
  const { products, loading: loadingProducts } = useProducts()

  const todayStr   = new Date().toISOString().slice(0, 10)
  const monthStr   = new Date().toISOString().slice(0, 7)
  const today      = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayOrders   = orders.filter(o => o.created_at?.slice(0, 10) === todayStr)
  const pendentes     = orders.filter(o => ['novo','criando_arte','aguardando_aprovacao'].includes(o.status)).length
  const concluidos    = orders.filter(o => o.status === 'entregue').length
  const emProducao    = orders.filter(o => o.status === 'em_producao').length
  const monthRevenue  = orders
    .filter(o => o.created_at?.slice(0,7) === monthStr && o.status !== 'cancelado')
    .reduce((s, o) => s + (o.total_value ?? 0), 0)

  const activeProducts = products.filter(p => p.status === 'ativo').length

  const businessName = (session?.user?.user_metadata?.business_name as string) ?? 'WK Presentes'
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  const recentOrders = orders.slice(0, 6)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{greeting}, {businessName} 🎁</h1>
          <p className={styles.sub}>
            <span className={styles.live}><span className={styles.liveDot}/>online</span>
            · {today}
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => onNavigate('pedidos')}>
          ＋ Novo pedido
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatCard
          icon="📦" label="Pedidos hoje"
          value={String(todayOrders.length)}
          sub={`${orders.length} no total`}
          color="#c17f4a"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          icon="⏳" label="Pendentes"
          value={String(pendentes)}
          sub="aguardando ação"
          color="#d4961a"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          icon="✅" label="Concluídos"
          value={String(concluidos)}
          sub="pedidos entregues"
          color="#1a7a44"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          icon="🏷️" label="Produtos"
          value={loadingProducts ? '…' : String(activeProducts)}
          sub="ativos no catálogo"
          color="#1a6ab0"
          onClick={() => onNavigate('produtos')}
        />
        <StatCard
          icon="🔧" label="Em produção"
          value={String(emProducao)}
          sub="sendo confeccionados"
          color="#7a3da0"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          icon="💰" label="Faturamento"
          value={`R$${monthRevenue.toFixed(0)}`}
          sub="este mês"
          color="#1a5a8a"
          onClick={() => onNavigate('financeiro')}
        />
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Pedidos recentes */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>📋 Pedidos recentes</span>
            <button className={styles.cardLink} onClick={() => onNavigate('pedidos')}>Ver todos →</button>
          </div>
          {loadingOrders ? (
            <div className={styles.empty}>Carregando...</div>
          ) : recentOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <span>📦</span>
              <p>Nenhum pedido ainda.</p>
              <button className={styles.btnPrimary} onClick={() => onNavigate('pedidos')}>Criar primeiro pedido</button>
            </div>
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
                      <div className={styles.clientSub}>{o.customer_phone}</div>
                    </td>
                    <td className={styles.product}>{o.items?.[0]?.produto ?? '—'}</td>
                    <td className={styles.value}>R${o.total_value?.toFixed(2)}</td>
                    <td>
                      {o.status === 'novo'                 && <Badge variant="blue">Novo</Badge>}
                      {o.status === 'criando_arte'         && <Badge variant="purple">Arte</Badge>}
                      {o.status === 'aguardando_aprovacao' && <Badge variant="amber">Aprovação</Badge>}
                      {o.status === 'aprovado'             && <Badge variant="green">Aprovado</Badge>}
                      {o.status === 'em_producao'          && <Badge variant="brown">Produção</Badge>}
                      {o.status === 'pronto'               && <Badge variant="green">Pronto</Badge>}
                      {o.status === 'entregue'             && <Badge variant="gray">Entregue</Badge>}
                      {o.status === 'cancelado'            && <Badge variant="red">Cancelado</Badge>}
                    </td>
                    <td>
                      {o.status === 'novo' && (
                        <button className={styles.btnSm} onClick={async () => {
                          await updateStatus(o.id, 'criando_arte')
                          onToast('🎨 Arte iniciada!')
                        }}>Iniciar</button>
                      )}
                      {o.status === 'pronto' && (
                        <button className={styles.btnSm} onClick={async () => {
                          await updateStatus(o.id, 'entregue')
                          onToast('✅ Entregue!')
                        }}>Entregar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pipeline + Produtos */}
        <div className={styles.side}>
          {/* Pipeline */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>🔄 Pipeline</span>
            </div>
            <div className={styles.pipeline}>
              {[
                { status: 'novo',                  icon: '📩', label: 'Novos'         },
                { status: 'criando_arte',           icon: '🎨', label: 'Criando Arte'  },
                { status: 'aguardando_aprovacao',   icon: '👁️', label: 'Aprovação'     },
                { status: 'em_producao',            icon: '🔧', label: 'Produção'      },
                { status: 'pronto',                 icon: '✅', label: 'Prontos'       },
              ].map(({ status, icon, label }) => {
                const count = orders.filter(o => o.status === status).length
                return (
                  <div key={status} className={styles.pipeItem}>
                    <span className={styles.pipeIcon}>{icon}</span>
                    <span className={styles.pipeName}>{label}</span>
                    <span className={`${styles.pipeCount} ${count > 0 ? styles.pipeCountActive : ''}`}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Produtos destaque */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>🏷️ Catálogo</span>
              <button className={styles.cardLink} onClick={() => onNavigate('produtos')}>Gerenciar →</button>
            </div>
            {loadingProducts ? (
              <div className={styles.empty}>Carregando...</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <span>🏷️</span>
                <p>Nenhum produto ainda.</p>
                <button className={styles.btnSecondary} onClick={() => onNavigate('produtos')}>Cadastrar produto</button>
              </div>
            ) : (
              <div className={styles.prodList}>
                {products.slice(0, 4).map(p => (
                  <div key={p.id} className={styles.prodRow}>
                    <div className={styles.prodImg}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} />
                        : <span>🎁</span>
                      }
                    </div>
                    <div className={styles.prodInfo}>
                      <div className={styles.prodName}>{p.name}</div>
                      <div className={styles.prodCat}>{p.category}</div>
                    </div>
                    <div className={styles.prodPrice}>R${p.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, onClick }: {
  icon: string; label: string; value: string; sub: string; color: string; onClick?: () => void
}) {
  return (
    <div className={styles.stat} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.statTop}>
        <span className={styles.statIcon}>{icon}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={styles.statVal} style={{ color }}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  )
}
