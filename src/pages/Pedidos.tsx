import { useState } from 'react'
import { useOrders } from '../hooks/useOrders'
import type { OrderStatus, OrderSource } from '../lib/database.types'
import Badge from '../components/Badge'
import styles from './Pedidos.module.css'

interface Props { onToast: (msg: string) => void }

const STATUS_FLOW: OrderStatus[] = [
  'novo', 'criando_arte', 'aguardando_aprovacao', 'aprovado', 'em_producao', 'pronto', 'entregue'
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo', criando_arte: 'Criando Arte', aguardando_aprovacao: 'Ag. Aprovação',
  aprovado: 'Aprovado', em_producao: 'Em Produção', pronto: 'Pronto',
  entregue: 'Entregue', cancelado: 'Cancelado',
}

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus; toast: string }>> = {
  novo:                  { label: 'Criar arte',       next: 'criando_arte',         toast: '🎨 Arte iniciada!' },
  criando_arte:          { label: 'Enviar p/ aprovação', next: 'aguardando_aprovacao', toast: '👁️ Enviado para aprovação!' },
  aguardando_aprovacao:  { label: 'Aprovar',          next: 'aprovado',             toast: '✅ Arte aprovada!' },
  aprovado:              { label: 'Iniciar produção', next: 'em_producao',           toast: '🔧 Produção iniciada!' },
  em_producao:           { label: 'Marcar pronto',   next: 'pronto',                toast: '✅ Pronto para entrega!' },
  pronto:                { label: 'Entregar',         next: 'entregue',              toast: '🚀 Pedido entregue!' },
}

function statusVariant(s: OrderStatus) {
  const m: Record<OrderStatus, 'blue'|'purple'|'amber'|'green'|'brown'|'gray'|'red'> = {
    novo: 'blue', criando_arte: 'purple', aguardando_aprovacao: 'amber',
    aprovado: 'green', em_producao: 'brown', pronto: 'green', entregue: 'gray', cancelado: 'red'
  }
  return m[s]
}

const SOURCE_ICONS: Record<OrderSource, string> = {
  whatsapp: '💬', instagram: '📸', presencial: '🏪', outro: '📋'
}

export default function Pedidos({ onToast }: Props) {
  const { orders, loading, updateStatus, createOrder, deleteOrder } = useOrders()
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // form state
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', source: 'whatsapp' as OrderSource,
    produto: '', quantidade: '1', valor: '', custo: '', deadline: '', notes: '',
  })

  const filtered = filter === 'todos' ? orders : orders.filter(o => o.status === filter)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseInt(form.quantidade) || 1
    const val = parseFloat(form.valor) || 0
    const cost = parseFloat(form.custo) || 0
    await createOrder({
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      source: form.source,
      status: 'novo',
      items: [{ produto: form.produto, quantidade: qty, valor_unitario: val }],
      total_value: qty * val,
      cost,
      notes: form.notes || undefined,
      deadline: form.deadline || undefined,
    })
    setShowModal(false)
    setForm({ customer_name: '', customer_phone: '', source: 'whatsapp', produto: '', quantidade: '1', valor: '', custo: '', deadline: '', notes: '' })
    onToast('📦 Pedido criado com sucesso!')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Pedidos</h1>
          <p className={styles.sub}>{orders.length} pedidos no total</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>＋ Novo pedido</button>
      </div>

      {/* Status filter */}
      <div className={styles.filters}>
        <button className={`${styles.filter} ${filter === 'todos' ? styles.filterActive : ''}`}
          onClick={() => setFilter('todos')}>Todos ({orders.length})</button>
        {STATUS_FLOW.map(s => {
          const count = orders.filter(o => o.status === s).length
          return (
            <button key={s} className={`${styles.filter} ${filter === s ? styles.filterActive : ''}`}
              onClick={() => setFilter(s)}>
              {STATUS_LABELS[s]} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders table */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.empty}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Nenhum pedido{filter !== 'todos' ? ' nesse status' : ''} ainda.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Origem</th><th>Produto</th><th>Valor</th><th>Prazo</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const action = NEXT_ACTION[o.status]
                return (
                  <tr key={o.id}>
                    <td className={styles.num}>{orders.length - i}</td>
                    <td>
                      <div className={styles.clientName}>{o.customer_name}</div>
                      <div className={styles.clientPhone}>{o.customer_phone}</div>
                    </td>
                    <td className={styles.source}>{SOURCE_ICONS[o.source]} {o.source}</td>
                    <td>{o.items?.[0]?.produto ?? '—'}</td>
                    <td className={styles.value}>R${o.total_value?.toFixed(2)}</td>
                    <td className={styles.deadline}>{o.deadline ? new Date(o.deadline).toLocaleDateString('pt-BR') : '—'}</td>
                    <td><Badge variant={statusVariant(o.status)}>{STATUS_LABELS[o.status]}</Badge></td>
                    <td>
                      <div className={styles.actions}>
                        {action && (
                          <button className={styles.btnSm} onClick={async () => {
                            await updateStatus(o.id, action.next)
                            onToast(action.toast)
                          }}>{action.label}</button>
                        )}
                        <button className={styles.btnDanger} onClick={() => setConfirmDelete(o.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New order modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Novo pedido</h2>
              <button className={styles.close} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome do cliente</label>
                  <input required placeholder="Ex: Maria Silva"
                    value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>WhatsApp / Telefone</label>
                  <input placeholder="(11) 99999-9999"
                    value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Origem do pedido</label>
                  <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value as OrderSource }))}>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="instagram">📸 Instagram</option>
                    <option value="presencial">🏪 Presencial</option>
                    <option value="outro">📋 Outro</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Prazo de entrega</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Produto / Descrição</label>
                <input required placeholder="Ex: Caneca personalizada com foto + caixa"
                  value={form.produto} onChange={e => setForm(p => ({ ...p, produto: e.target.value }))} />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Quantidade</label>
                  <input type="number" min="1" value={form.quantidade}
                    onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Valor de venda (R$)</label>
                  <input type="number" step="0.01" placeholder="0.00"
                    value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Custo (R$)</label>
                  <input type="number" step="0.01" placeholder="0.00"
                    value={form.custo} onChange={e => setForm(p => ({ ...p, custo: e.target.value }))} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Observações</label>
                <textarea placeholder="Detalhes da personalização, referencias de arte, etc."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Criar pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p>Excluir este pedido permanentemente?</p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className={styles.btnDangerFull} onClick={async () => {
                await deleteOrder(confirmDelete)
                setConfirmDelete(null)
                onToast('🗑️ Pedido excluído.')
              }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
