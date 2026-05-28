import { useMemo } from 'react'
import { ShoppingBag, Clock, Tag, Users, ArrowRight, Circle, CalendarClock, TrendingUp, BarChart2, Timer } from 'lucide-react'
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

const RANK_COLORS = ['#c8900a', '#7a8a9a', '#a0644a']
const RANK_LABEL  = ['1º', '2º', '3º', '4º', '5º', '6º']

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

  // Financial summary – current month
  const monthStr = new Date().toISOString().slice(0, 7)
  const monthOrders = orders.filter(o => o.created_at?.slice(0, 7) === monthStr && o.status !== 'cancelado')
  const monthRevenue = monthOrders.reduce((s, o) => s + (o.total_value ?? 0), 0)
  const monthCost    = monthOrders.reduce((s, o) => s + (o.cost ?? 0), 0)
  const monthProfit  = monthRevenue - monthCost

  // Upcoming deadlines – next 7 days, not finished
  const now7 = new Date(); now7.setDate(now7.getDate() + 7)
  const upcoming = orders
    .filter(o => o.deadline && !['entregue', 'cancelado'].includes(o.status))
    .filter(o => new Date(o.deadline! + 'T00:00:00') <= now7)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 6)

  // ── Análise por família de produto ──────────────────────
  const productStats = useMemo(() => {
    type Acc = {
      count: number
      completedCount: number
      totalDays: number
      totalRevenue: number
      totalCost: number
    }
    const map: Record<string, Acc> = {}

    for (const o of orders.filter(o => o.status !== 'cancelado')) {
      const key = (o.items?.[0] as any)?.produto as string | undefined
      if (!key) continue
      if (!map[key]) map[key] = { count: 0, completedCount: 0, totalDays: 0, totalRevenue: 0, totalCost: 0 }
      const m = map[key]
      m.count++
      m.totalRevenue += o.total_value ?? 0
      m.totalCost    += o.cost ?? 0

      if (o.status === 'entregue' && o.created_at && o.updated_at) {
        const days = (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 86400000
        if (days >= 0) { m.completedCount++; m.totalDays += days }
      }
    }

    return Object.entries(map)
      .map(([name, d]) => {
        const avgDays  = d.completedCount > 0 ? d.totalDays / d.completedCount : null
        const margin   = d.totalRevenue > 0 ? ((d.totalRevenue - d.totalCost) / d.totalRevenue) * 100 : 0
        const avgRev   = d.totalRevenue / d.count
        // Score: margem alta + tempo baixo = melhor
        const penalty  = avgDays !== null ? Math.max(avgDays, 0.5) : 10
        const score    = (margin / penalty) * Math.log(d.count + 1)
        return { name, count: d.count, avgDays, margin, avgRev, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [orders])

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
        <StatCard icon={<ShoppingBag size={18} />} label="Pedidos hoje"    value={todayOrders.length} accent="#c17f4a" onClick={() => onNavigate('pedidos')} />
        <StatCard icon={<Clock size={18} />}        label="Pendentes"       value={pendentes}           accent="#d4961a" onClick={() => onNavigate('pedidos')} />
        <StatCard icon={<Tag size={18} />}          label="Produtos ativos" value={activeProds}         accent="#1a6ab0" onClick={() => onNavigate('produtos')} />
        <StatCard icon={<Users size={18} />}        label="Clientes"        value={customers.length}    accent="#1a7a44" onClick={() => onNavigate('clientes')} />
      </div>

      {/* Two-column content */}
      <div className={styles.contentGrid}>

        {/* Left – Recent orders */}
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

        {/* Right sidebar */}
        <div className={styles.sidebar}>

          {/* Financial summary */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHead}>
              <TrendingUp size={15} />
              <span>Este mês</span>
            </div>
            <div className={styles.finRows}>
              <div className={styles.finRow}>
                <span className={styles.finLabel}>Receita</span>
                <span className={styles.finVal} style={{ color: '#c17f4a' }}>R${monthRevenue.toFixed(2)}</span>
              </div>
              <div className={styles.finDivider} />
              <div className={styles.finRow}>
                <span className={styles.finLabel}>Custos</span>
                <span className={styles.finVal} style={{ color: '#c05040' }}>R${monthCost.toFixed(2)}</span>
              </div>
              <div className={styles.finDivider} />
              <div className={styles.finRow}>
                <span className={styles.finLabel}>Lucro</span>
                <span className={styles.finVal} style={{ color: monthProfit >= 0 ? '#1a7a44' : '#c05040', fontWeight: 800 }}>
                  R${monthProfit.toFixed(2)}
                </span>
              </div>
              <div className={styles.finDivider} />
              <div className={styles.finRow}>
                <span className={styles.finLabel}>Pedidos</span>
                <span className={styles.finVal} style={{ color: '#2c1810' }}>{monthOrders.length}</span>
              </div>
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHead}>
              <CalendarClock size={15} />
              <span>Prazos esta semana</span>
            </div>
            {upcoming.length === 0 ? (
              <p className={styles.sideEmpty}>Nenhum prazo nos próximos 7 dias</p>
            ) : (
              <div className={styles.deadlineList}>
                {upcoming.map(o => {
                  const d = new Date(o.deadline! + 'T00:00:00')
                  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
                  const isToday = diff <= 0
                  const isUrgent = diff <= 1
                  return (
                    <div key={o.id} className={styles.deadlineRow}>
                      <div className={styles.deadlineInfo}>
                        <span className={styles.deadlineName}>{o.customer_name}</span>
                        <span className={styles.deadlineProd}>{o.items?.[0]?.produto ?? '—'}</span>
                      </div>
                      <span className={styles.deadlineBadge} style={{
                        background: isToday ? '#fdecea' : isUrgent ? '#fff8e8' : '#f0fdf4',
                        color:      isToday ? '#c05040' : isUrgent ? '#d4961a' : '#1a7a44',
                      }}>
                        {isToday ? 'Hoje!' : diff === 1 ? 'Amanhã' : `${diff}d`}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Análise por Produto ── */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHead}>
              <BarChart2 size={15} />
              <span>Análise por produto</span>
            </div>

            {productStats.length === 0 ? (
              <p className={styles.sideEmpty}>
                Dados disponíveis após pedidos entregues
              </p>
            ) : (
              <div className={styles.analysisList}>
                {/* Cabeçalho da tabela */}
                <div className={styles.analysisHeader}>
                  <span className={styles.ahRank}>#</span>
                  <span className={styles.ahName}>Produto</span>
                  <span className={styles.ahTime}>
                    <Timer size={11} /> Tempo
                  </span>
                  <span className={styles.ahMargin}>Margem</span>
                </div>

                {productStats.map((p, i) => {
                  const margin = p.margin
                  const marginColor = margin >= 50 ? '#1a7a44' : margin >= 30 ? '#d4961a' : '#c05040'
                  const rankColor = RANK_COLORS[i] ?? '#6b5040'
                  const timeStr = p.avgDays !== null
                    ? p.avgDays < 1
                      ? '< 1d'
                      : `${p.avgDays.toFixed(1)}d`
                    : '—'

                  return (
                    <div key={p.name} className={`${styles.analysisRow} ${i === 0 ? styles.analysisTop : ''}`}>
                      {/* Rank */}
                      <span className={styles.analysisRank} style={{ color: rankColor }}>
                        {RANK_LABEL[i]}
                      </span>

                      {/* Nome + qtd pedidos */}
                      <div className={styles.analysisName}>
                        <span className={styles.anProd}>{p.name}</span>
                        <span className={styles.anCount}>{p.count} pedido{p.count !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Tempo médio */}
                      <span className={styles.analysisTime}>{timeStr}</span>

                      {/* Margem com barra */}
                      <div className={styles.analysisMargin}>
                        <span style={{ color: marginColor, fontWeight: 700 }}>
                          {margin.toFixed(0)}%
                        </span>
                        <div className={styles.marginBar}>
                          <div
                            className={styles.marginFill}
                            style={{ width: `${Math.min(margin, 100)}%`, background: marginColor }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Legenda */}
                <div className={styles.analysisLegend}>
                  Ordenado por margem ÷ tempo × volume de pedidos
                </div>
              </div>
            )}
          </div>

        </div>
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
