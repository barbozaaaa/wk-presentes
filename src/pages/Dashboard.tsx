import { ShoppingBag, Clock, Tag, Users, ArrowRight, Circle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useOrders, useProducts, useCustomers } from '../hooks/useOrders'
import styles from './Dashboard.module.css'

interface Props { onToast: (msg: string) => void; onNavigate: (p: string) => void }

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_producao: 'Em produção',
  pronto: 'Pronto', entregue: 'Entregue', cancelado: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  pendente: '#d4961a', em_producao: '#7a3da0',
  pronto: '#1a7a44', entregue: '#6b5040', cancelado: '#c05040',
}

export default function Dashboard({ onToast, onNavigate }: Props) {
  const { session } = useAuth()
  const { orders, loading: loadOrders, updateStatus } = useOrders()
  const { products } = useProducts()
  const { customers } = useCustomers()

  const todayStr = new Date().toISOString().slice(0, 10)
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const todayOrders  = orders.filter(o => o.created_at?.slice(0, 10) === todayStr)
  const pendentes    = orders.filter(o => o.status === 'pendente').length
  const activeProds  = products.filter(p => p.status === 'ativo').length
  const recentOrders = orders.slice(0, 7)

  const name    = (session?.user?.user_metadata?.business_name as string) ?? 'você'
  const hour    = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{greeting}, {name} 👋</h1>
          <p className={styles.date}>
            <span className={styles.dot} />
            {today}
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => onNavigate('pedidos')}>
          Novo pedido
        </button>
      </div>

      {/* 4 stat cards */}
      <div className={styles.stats}>
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Pedidos hoje"
          value={todayOrders.length}
          accent="#c17f4a"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Pendentes"
          value={pendentes}
          accent="#d4961a"
          onClick={() => onNavigate('pedidos')}
        />
        <StatCard
          icon={<Tag size={18} />}
          label="Produtos ativos"
          value={activeProds}
          accent="#1a6ab0"
          onClick={() => onNavigate('produtos')}
        />
        <StatCard
          icon={<Users size={18} />}
          label="Clientes"
          value={customers.length}
          accent="#1a7a44"
          onClick={() => onNavigate('clientes')}
        />
      </div>

      {/* Recent orders */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>Pedidos recentes</span>
          <button className={styles.cardLink} onClick={() => onNavigate('pedidos')}>
            Ver todos <ArrowRight size={13} />
          </button>
        </div>

        {loadOrders ? (
          <div className={styles.empty}>Carregando...</div>
        ) : recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={32} strokeWidth={1.5} color="#c8b8a8" />
            <p>Nenhum pedido ainda</p>
            <button className={styles.btnSecondary} onClick={() => onNavigate('pedidos')}>
              Criar primeiro pedido
            </button>
          </div>
        ) : (
          <div className={styles.orderList}>
            {recentOrders.map(o => {
              const canAdvance = o.status === 'pendente' || o.status === 'em_producao' || o.status === 'pronto'
              const nextStatus: Record<string, string> = {
                pendente: 'em_producao', em_producao: 'pronto', pronto: 'entregue'
              }
              const nextLabel: Record<string, string> = {
                pendente: 'Iniciar produção', em_producao: 'Marcar pronto', pronto: 'Entregar'
              }
              return (
                <div key={o.id} className={styles.orderRow}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderName}>{o.customer_name}</span>
                    <span className={styles.orderProduct}>{o.items?.[0]?.produto ?? '—'}</span>
                  </div>
                  <span className={styles.orderValue}>R${o.total_value?.toFixed(2)}</span>
                  <span className={styles.orderStatus} style={{ color: STATUS_COLOR[o.status] }}>
                    <Circle size={7} fill="currentColor" strokeWidth={0} />
                    {STATUS_LABEL[o.status]}
                  </span>
                  {canAdvance && (
                    <button className={styles.btnAdvance} onClick={async () => {
                      await updateStatus(o.id, nextStatus[o.status] as any)
                      onToast(`✓ ${nextLabel[o.status]}!`)
                    }}>
                      {nextLabel[o.status]}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent, onClick }: {
  icon: React.ReactNode; label: string; value: number; accent: string; onClick: () => void
}) {
  return (
    <button className={styles.stat} onClick={onClick}>
      <div className={styles.statIcon} style={{ color: accent, background: accent + '18' }}>{icon}</div>
      <div className={styles.statVal} style={{ color: accent }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </button>
  )
}
