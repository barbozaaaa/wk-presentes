import { useState } from 'react'
import { Search, Plus, Trash2, Circle } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import type { OrderStatus, OrderSource } from '../lib/database.types'
import styles from './Pedidos.module.css'

interface Props { onToast: (msg: string) => void }

const STATUS_FLOW: (OrderStatus | 'todos')[] = [
  'todos', 'pendente', 'em_producao', 'pronto', 'entregue', 'cancelado'
]

const STATUS_LABELS: Record<string, string> = {
  todos: 'Todos',
  pendente: 'Pendente',
  em_producao: 'Em produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pendente: '#d4961a', em_producao: '#7a3da0',
  pronto: '#1a7a44', entregue: '#6b5040', cancelado: '#c05040',
}

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus; toast: string }>> = {
  pendente:    { label: 'Iniciar produção', next: 'em_producao', toast: '✓ Produção iniciada!' },
  em_producao: { label: 'Marcar pronto',   next: 'pronto',      toast: '✓ Pedido pronto!' },
  pronto:      { label: 'Entregar',         next: 'entregue',    toast: '✓ Pedido entregue!' },
}

const SOURCE_LABELS: Record<OrderSource, string> = {
  whatsapp: 'WhatsApp', instagram: 'Instagram', presencial: 'Presencial', outro: 'Outro'
}

export default function Pedidos({ onToast }: Props) {
  const { orders, loading, updateStatus, createOrder, deleteOrder } = useOrders()
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', source: 'whatsapp' as OrderSource,
    produto: '', quantidade: '1', valor: '', custo: '', deadline: '', notes: '',
  })

  const filtered = orders
    .filter(o => filter === 'todos' || o.status === filter)
    .filter(o => !search || o.customer_name.toLowerCase().includes(search.toLowerCase())
      || (o.items?.[0]?.produto ?? '').toLowerCase().includes(search.toLowerCase()))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseInt(form.quantidade) || 1
    const val = parseFloat(form.valor) || 0
    const cost = parseFloat(form.custo) || 0
    await createOrder({
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      source: form.source,
      status: 'pendente',
      items: [{ produto: form.produto, quantidade: qty, valor_unitario: val }],
      total_value: qty * val,
      cost,
      notes: form.notes || undefined,
      deadline: form.deadline || undefined,
    })
    setShowModal(false)
    setForm({ customer_name: '', customer_phone: '', source: 'whatsapp', produto: '', quantidade: '1', valor: '', custo: '', deadline: '', notes: '' })
    onToast('✓ Pedido criado!')
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Pedidos</h1>
          <p className={styles.sub}>{orders.length} pedido{orders.length !== 1 ? 's' : ''} no total</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={15} strokeWidth={2.5} /> Novo pedido
        </button>
      </div>

      {/* Search + filter bar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por cliente ou produto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {STATUS_FLOW.map(s => {
            const count = s === 'todos' ? orders.length : orders.filter(o => o.status === s).length
            return (
              <button
                key={s}
                className={`${styles.filter} ${filter === s ? styles.filterActive : ''}`}
                onClick={() => setFilter(s)}
              >
                {STATUS_LABELS[s]} <span className={styles.filterCount}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders table */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.empty}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum pedido nesse status ainda.'}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Valor</th>
                <th>Prazo</th>
                <th>Origem</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const action = NEXT_ACTION[o.status as OrderStatus]
                return (
                  <tr key={o.id}>
                    <td className={styles.num}>{orders.indexOf(o) + 1}</td>
                    <td>
                      <div className={styles.clientName}>{o.customer_name}</div>
                      <div className={styles.clientPhone}>{o.customer_phone}</div>
                    </td>
                    <td className={styles.productCell}>{o.items?.[0]?.produto ?? '—'}</td>
                    <td className={styles.value}>R${o.total_value?.toFixed(2)}</td>
                    <td className={styles.deadline}>
                      {o.deadline ? new Date(o.deadline + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className={styles.source}>{SOURCE_LABELS[o.source]}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          color: STATUS_COLOR[o.status] ?? '#6b5040',
                          background: (STATUS_COLOR[o.status] ?? '#6b5040') + '18',
                        }}
                      >
                        <Circle size={6} fill="currentColor" strokeWidth={0} />
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {action && (
                          <button className={styles.btnSm} onClick={async () => {
                            await updateStatus(o.id, action.next)
                            onToast(action.toast)
                          }}>
                            {action.label}
                          </button>
                        )}
                        <button
                          className={styles.btnDanger}
                          title="Excluir pedido"
                          onClick={() => setConfirmDelete(o.id)}
                        >
                          <Trash2 size={14} />
                        </button>
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
                  <label>Nome do cliente *</label>
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
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="presencial">Presencial</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Prazo de entrega</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Produto / Descrição *</label>
                <input required placeholder="Ex: Caneca personalizada com foto + caixa"
                  value={form.produto} onChange={e => setForm(p => ({ ...p, produto: e.target.value }))} />
              </div>
              <div className={styles.rowTriple}>
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
                <textarea placeholder="Detalhes da personalização, referências de arte, etc."
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
                onToast('Pedido excluído.')
              }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
