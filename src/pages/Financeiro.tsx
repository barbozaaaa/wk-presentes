import { DollarSign, TrendingDown, TrendingUp, Target, BarChart2, Trophy, Printer } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import styles from './Financeiro.module.css'

export default function Financeiro() {
  const { orders, loading } = useOrders()

  const now = new Date()
  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return d.toISOString().slice(0, 7)
  })

  const stats = months.map(m => {
    const mo = orders.filter(o => o.created_at?.slice(0, 7) === m && o.status !== 'cancelado')
    const revenue = mo.reduce((s, o) => s + (o.total_value ?? 0), 0)
    const cost    = mo.reduce((s, o) => s + (o.cost ?? 0), 0)
    const profit  = revenue - cost
    const [year, monthNum] = m.split('-').map(Number)
    const label   = new Date(year, monthNum - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    return { month: m, label, revenue, cost, profit, count: mo.length }
  })

  const currentMonth = stats[0]
  const allDelivered = orders.filter(o => o.status === 'entregue')
  const totalRevenue = allDelivered.reduce((s, o) => s + (o.total_value ?? 0), 0)
  const totalCost    = allDelivered.reduce((s, o) => s + (o.cost ?? 0), 0)
  const avgTicket    = allDelivered.length ? totalRevenue / allDelivered.length : 0

  if (loading) return <div style={{ padding: '3rem', color: '#9a8070' }}>Carregando...</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Financeiro</h1>
          <p className={styles.sub}>Receitas, custos e lucro</p>
        </div>
        <button className={styles.btnPrint} onClick={() => window.print()}>
          <Printer size={15} /> Gerar PDF
        </button>
      </div>

      <div className={styles.stats}>
        <StatCard icon={<DollarSign size={18} />} label="Receita este mês" value={`R$${currentMonth.revenue.toFixed(2)}`} color="#c17f4a" />
        <StatCard icon={<TrendingDown size={18} />} label="Custos este mês"  value={`R$${currentMonth.cost.toFixed(2)}`}    color="#c05040" />
        <StatCard icon={<TrendingUp size={18} />}  label="Lucro este mês"   value={`R$${currentMonth.profit.toFixed(2)}`}  color="#1a7a44" />
        <StatCard icon={<Target size={18} />}      label="Ticket médio"     value={`R$${avgTicket.toFixed(2)}`}            color="#1a6ab0" />
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <BarChart2 size={16} /> Últimos 3 meses
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Mês</th><th>Pedidos</th><th>Receita</th><th>Custo</th><th>Lucro</th><th>Margem</th></tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.month}>
                  <td className={styles.monthLabel}>{s.label}</td>
                  <td>{s.count}</td>
                  <td className={styles.revenue}>R${s.revenue.toFixed(2)}</td>
                  <td className={styles.cost}>R${s.cost.toFixed(2)}</td>
                  <td className={s.profit >= 0 ? styles.profit : styles.loss}>R${s.profit.toFixed(2)}</td>
                  <td>{s.revenue > 0 ? Math.round(s.profit / s.revenue * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <Trophy size={16} /> Produtos mais vendidos
          </div>
          <div className={styles.productList}>
            {(() => {
              const map: Record<string, number> = {}
              orders.filter(o => o.status === 'entregue').forEach(o => {
                o.items?.forEach(item => {
                  map[item.produto] = (map[item.produto] ?? 0) + (item.quantidade ?? 1)
                })
              })
              return Object.entries(map)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([prod, qty]) => (
                  <div key={prod} className={styles.productRow}>
                    <span className={styles.productName}>{prod}</span>
                    <span className={styles.productQty}>{qty} un.</span>
                  </div>
                ))
            })()}
            {orders.filter(o => o.status === 'entregue').length === 0 && (
              <div className={styles.empty}>Nenhum pedido entregue ainda.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.totalCard}>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total faturado (geral)</span>
          <span className={styles.totalValue} style={{ color: '#c17f4a' }}>R${totalRevenue.toFixed(2)}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total de custos</span>
          <span className={styles.totalValue} style={{ color: '#c05040' }}>R${totalCost.toFixed(2)}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Lucro total</span>
          <span className={styles.totalValue} style={{ color: '#1a7a44' }}>R${(totalRevenue - totalCost).toFixed(2)}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Pedidos entregues</span>
          <span className={styles.totalValue} style={{ color: '#1a6ab0' }}>{allDelivered.length}</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statIcon} style={{ color, background: color + '18' }}>{icon}</div>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}
