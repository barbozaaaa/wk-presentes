import { useMemo, useState } from 'react'
import { BarChart2, Timer, TrendingUp, Trophy, Star, Clock, ShoppingBag, Percent } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import styles from './Analise.module.css'

type Periodo = 'tudo' | '90d' | '30d'

interface ProdutoStat {
  nome: string
  totalPedidos: number
  pedidosConcluidos: number
  avgDias: number | null
  receita: number
  custo: number
  margem: number
  avgReceita: number
  score: number
}

const PERIODO_LABEL: Record<Periodo, string> = {
  tudo: 'Todo o período',
  '90d': 'Últimos 90 dias',
  '30d': 'Últimos 30 dias',
}

export default function Analise() {
  const { orders, loading } = useOrders()
  const [periodo, setPeriodo] = useState<Periodo>('tudo')
  const [ordenar, setOrdenar] = useState<'score' | 'margem' | 'tempo' | 'receita'>('score')

  // Filtra pedidos pelo período selecionado
  const filtered = useMemo(() => {
    const base = orders.filter(o => o.status !== 'cancelado')
    if (periodo === 'tudo') return base
    const dias = periodo === '30d' ? 30 : 90
    const corte = new Date()
    corte.setDate(corte.getDate() - dias)
    return base.filter(o => new Date(o.created_at) >= corte)
  }, [orders, periodo])

  // Agrupa por produto e calcula métricas
  const produtos = useMemo((): ProdutoStat[] => {
    type Acc = {
      totalPedidos: number
      pedidosConcluidos: number
      totalDias: number
      receita: number
      custo: number
    }
    const map: Record<string, Acc> = {}

    for (const o of filtered) {
      const itens = o.items as any[] | undefined
      if (!itens?.length) continue

      // Agrega por cada produto do pedido
      const produtosNoPedido = new Set<string>()
      for (const item of itens) {
        const nome = item?.produto as string | undefined
        if (!nome) continue
        produtosNoPedido.add(nome)

        if (!map[nome]) map[nome] = { totalPedidos: 0, pedidosConcluidos: 0, totalDias: 0, receita: 0, custo: 0 }
        const m = map[nome]

        // Atribui receita/custo proporcionalmente (dividido pelo nº de itens distintos)
        const fator = 1 / produtosNoPedido.size
        m.receita += (o.total_value ?? 0) * fator
        m.custo   += (o.cost ?? 0) * fator
      }

      // Conta pedidos e tempo apenas para o produto principal (1º item)
      const principal = itens[0]?.produto as string | undefined
      if (!principal || !map[principal]) continue
      map[principal].totalPedidos++

      if (o.status === 'entregue' && o.created_at && o.updated_at) {
        const dias = (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 86400000
        if (dias >= 0) {
          map[principal].pedidosConcluidos++
          map[principal].totalDias += dias
        }
      }
    }

    const resultado = Object.entries(map).map(([nome, d]) => {
      const avgDias  = d.pedidosConcluidos > 0 ? d.totalDias / d.pedidosConcluidos : null
      const margem   = d.receita > 0 ? ((d.receita - d.custo) / d.receita) * 100 : 0
      const avgReceita = d.totalPedidos > 0 ? d.receita / d.totalPedidos : 0
      const penalty  = avgDias !== null ? Math.max(avgDias, 0.5) : 10
      const score    = (margem / penalty) * Math.log(d.totalPedidos + 1)
      return { nome, ...d, avgDias, margem, avgReceita, score }
    })

    return resultado.sort((a, b) => {
      if (ordenar === 'score')   return b.score   - a.score
      if (ordenar === 'margem')  return b.margem  - a.margem
      if (ordenar === 'receita') return b.receita - a.receita
      if (ordenar === 'tempo') {
        const ta = a.avgDias ?? 9999
        const tb = b.avgDias ?? 9999
        return ta - tb
      }
      return 0
    })
  }, [filtered, ordenar])

  // KPIs do topo
  const melhor    = produtos[0]
  const totalRec  = filtered.reduce((s, o) => s + (o.total_value ?? 0), 0)
  const totalCusto= filtered.reduce((s, o) => s + (o.cost ?? 0), 0)
  const margemGeral = totalRec > 0 ? ((totalRec - totalCusto) / totalRec) * 100 : 0
  const concluidos = filtered.filter(o => o.status === 'entregue')
  const tempoMedio = concluidos.length
    ? concluidos.reduce((s, o) => {
        const d = o.created_at && o.updated_at
          ? (new Date(o.updated_at).getTime() - new Date(o.created_at).getTime()) / 86400000
          : 0
        return s + d
      }, 0) / concluidos.length
    : null

  if (loading) return <div style={{ padding: '3rem', color: '#9a8070' }}>Carregando...</div>

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Análise de Produtos</h1>
          <p className={styles.sub}>Veja qual produto vale mais a pena vender</p>
        </div>

        {/* Filtro de período */}
        <div className={styles.periodoTabs}>
          {(Object.keys(PERIODO_LABEL) as Periodo[]).map(p => (
            <button
              key={p}
              className={`${styles.periodoTab} ${periodo === p ? styles.periodoActive : ''}`}
              onClick={() => setPeriodo(p)}
            >
              {PERIODO_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.kpis}>
        <KpiCard
          icon={<Trophy size={18} />}
          label="Melhor produto"
          value={melhor?.nome ?? '—'}
          sub={melhor ? `Margem ${melhor.margem.toFixed(0)}%` : 'Sem dados'}
          color="#c8900a"
        />
        <KpiCard
          icon={<Percent size={18} />}
          label="Margem geral"
          value={`${margemGeral.toFixed(1)}%`}
          sub={`R$${(totalRec - totalCusto).toFixed(2)} de lucro`}
          color={margemGeral >= 50 ? '#1a7a44' : margemGeral >= 30 ? '#d4961a' : '#c05040'}
        />
        <KpiCard
          icon={<Clock size={18} />}
          label="Tempo médio"
          value={tempoMedio !== null ? `${tempoMedio.toFixed(1)} dias` : '—'}
          sub={`${concluidos.length} pedido${concluidos.length !== 1 ? 's' : ''} entregue${concluidos.length !== 1 ? 's' : ''}`}
          color="#1a6ab0"
        />
        <KpiCard
          icon={<ShoppingBag size={18} />}
          label="Produtos diferentes"
          value={String(produtos.length)}
          sub={`${filtered.length} pedidos no período`}
          color="#7a3da0"
        />
      </div>

      {/* Melhor produto — destaque */}
      {melhor && (
        <div className={styles.destaque}>
          <div className={styles.destaqueLeft}>
            <span className={styles.destaqueBadge}>
              <Star size={12} fill="currentColor" /> Melhor custo-benefício
            </span>
            <h2 className={styles.destaqueProd}>{melhor.nome}</h2>
            <p className={styles.destaqueSub}>
              {melhor.margem.toFixed(0)}% de margem
              {melhor.avgDias !== null ? ` · ${melhor.avgDias.toFixed(1)} dias para concluir` : ''}
              {' '}· {melhor.totalPedidos} pedido{melhor.totalPedidos !== 1 ? 's' : ''}
            </p>
          </div>
          <div className={styles.destaqueMetrics}>
            <div className={styles.destaqueMet}>
              <span className={styles.destaqueMetVal} style={{ color: '#1a7a44' }}>
                {melhor.margem.toFixed(0)}%
              </span>
              <span className={styles.destaqueMetLabel}>Margem</span>
            </div>
            <div className={styles.destaqueDivider} />
            <div className={styles.destaqueMet}>
              <span className={styles.destaqueMetVal} style={{ color: '#1a6ab0' }}>
                {melhor.avgDias !== null ? `${melhor.avgDias.toFixed(1)}d` : '—'}
              </span>
              <span className={styles.destaqueMetLabel}>Tempo médio</span>
            </div>
            <div className={styles.destaqueDivider} />
            <div className={styles.destaqueMet}>
              <span className={styles.destaqueMetVal} style={{ color: '#c17f4a' }}>
                R${melhor.avgReceita.toFixed(0)}
              </span>
              <span className={styles.destaqueMetLabel}>Ticket médio</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabela detalhada */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.cardTitle}>
            <BarChart2 size={15} /> Ranking de produtos
          </div>
          {/* Ordenação */}
          <div className={styles.sortTabs}>
            <span className={styles.sortLabel}>Ordenar por:</span>
            {[
              { key: 'score',   label: 'Score' },
              { key: 'margem',  label: 'Margem' },
              { key: 'tempo',   label: 'Tempo' },
              { key: 'receita', label: 'Receita' },
            ].map(s => (
              <button
                key={s.key}
                className={`${styles.sortBtn} ${ordenar === s.key ? styles.sortActive : ''}`}
                onClick={() => setOrdenar(s.key as any)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {produtos.length === 0 ? (
          <div className={styles.empty}>
            <BarChart2 size={36} strokeWidth={1.2} color="#c8b8a8" />
            <p>Nenhum dado ainda</p>
            <span>Crie pedidos e marque como entregues para ver a análise</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thRank}>#</th>
                <th>Produto</th>
                <th className={styles.thNum}>Pedidos</th>
                <th className={styles.thNum}>
                  <Timer size={12} style={{ verticalAlign: 'middle' }} /> Tempo médio
                </th>
                <th className={styles.thNum}>Receita total</th>
                <th className={styles.thNum}>Custo total</th>
                <th className={styles.thNum}>Ticket médio</th>
                <th className={styles.thMargem}>Margem</th>
                <th className={styles.thNum}>
                  <TrendingUp size={12} style={{ verticalAlign: 'middle' }} /> Score
                </th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p, i) => {
                const marginColor = p.margem >= 50 ? '#1a7a44' : p.margem >= 30 ? '#d4961a' : '#c05040'
                const rankColors  = ['#c8900a', '#7a8a9a', '#a0644a']
                const rc = rankColors[i] ?? '#9a8070'
                return (
                  <tr key={p.nome} className={i === 0 ? styles.trTop : ''}>
                    <td className={styles.tdRank} style={{ color: rc }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                    </td>
                    <td className={styles.tdNome}>
                      <span className={styles.nomeProd}>{p.nome}</span>
                      {p.pedidosConcluidos === 0 && (
                        <span className={styles.noData}>sem entregues</span>
                      )}
                    </td>
                    <td className={styles.tdNum}>{p.totalPedidos}</td>
                    <td className={styles.tdNum}>
                      {p.avgDias !== null
                        ? p.avgDias < 1 ? '< 1d' : `${p.avgDias.toFixed(1)}d`
                        : <span className={styles.dash}>—</span>}
                    </td>
                    <td className={styles.tdNum} style={{ color: '#c17f4a', fontWeight: 700 }}>
                      R${p.receita.toFixed(2)}
                    </td>
                    <td className={styles.tdNum} style={{ color: '#c05040' }}>
                      R${p.custo.toFixed(2)}
                    </td>
                    <td className={styles.tdNum}>
                      R${p.avgReceita.toFixed(2)}
                    </td>
                    <td className={styles.tdMargem}>
                      <div className={styles.margemWrap}>
                        <span style={{ color: marginColor, fontWeight: 700, fontSize: '0.85rem' }}>
                          {p.margem.toFixed(1)}%
                        </span>
                        <div className={styles.barBg}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${Math.min(p.margem, 100)}%`, background: marginColor }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={styles.tdNum}>
                      <span className={styles.scorePill} style={{
                        background: i === 0 ? '#fff8e8' : i === 1 ? '#f5f5f5' : '#faf5f0',
                        color: i === 0 ? '#c8900a' : i === 1 ? '#6b7a8a' : '#9a8070',
                      }}>
                        {p.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legenda do score */}
      <div className={styles.legend}>
        <strong>Como o Score é calculado:</strong>
        {' '}Score = (Margem% ÷ Tempo médio) × log(nº pedidos + 1).
        {' '}Produtos com margem alta, tempo curto e mais pedidos ficam no topo.
        {' '}Produtos sem pedidos entregues usam 10 dias como estimativa de tempo.
      </div>

    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string
}) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiIcon} style={{ color, background: color + '18' }}>{icon}</div>
      <div className={styles.kpiVal} style={{ color }}>{value}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiSub}>{sub}</div>
    </div>
  )
}
