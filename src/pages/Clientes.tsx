import { useState } from 'react'
import { Search, Plus, Users, Trophy, BarChart2 } from 'lucide-react'
import { useCustomers } from '../hooks/useOrders'
import styles from './Clientes.module.css'

interface Props { onToast: (msg: string) => void }

export default function Clientes({ onToast }: Props) {
  const { customers, loading, createCustomer } = useCustomers()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', instagram: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.instagram ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // Sidebar data
  const topClients = [...customers]
    .sort((a, b) => (b.total_spent ?? 0) - (a.total_spent ?? 0))
    .slice(0, 5)

  const totalSpent = customers.reduce((s, c) => s + (c.total_spent ?? 0), 0)
  const avgSpent   = customers.length ? totalSpent / customers.length : 0
  const withOrders = customers.filter(c => (c.total_orders ?? 0) > 0).length
  const totalOrders = customers.reduce((s, c) => s + (c.total_orders ?? 0), 0)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await createCustomer({
      name: form.name, phone: form.phone,
      email: form.email || undefined,
      instagram: form.instagram || undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    setShowModal(false)
    setForm({ name: '', phone: '', email: '', instagram: '', notes: '' })
    onToast('✓ Cliente cadastrado!')
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Clientes</h1>
          <p className={styles.sub}>{customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={15} strokeWidth={2.5} /> Novo cliente
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={14} className={styles.searchIcon} />
        <input className={styles.searchInput}
          placeholder="Buscar por nome, telefone ou Instagram..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Two-column */}
      <div className={styles.contentGrid}>

        {/* Table */}
        <div className={styles.card}>
          {loading ? (
            <div className={styles.empty}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={36} strokeWidth={1.5} color="#c8b8a8" />
              <p>{search ? `Nenhum resultado para "${search}"` : 'Nenhum cliente ainda.'}</p>
              {!search && <span>Clientes são adicionados ao criar pedidos, ou manualmente aqui.</span>}
              {!search && (
                <button className={styles.btnSecondary} onClick={() => setShowModal(true)}>
                  Adicionar primeiro cliente
                </button>
              )}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th><th>WhatsApp</th><th>Instagram</th>
                  <th>Pedidos</th><th>Total gasto</th><th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.clientName}>{c.name}</div>
                      {c.email && <div className={styles.clientEmail}>{c.email}</div>}
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td>
                      {c.instagram
                        ? <a className={styles.ig} href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                            @{c.instagram.replace('@', '')}
                          </a>
                        : '—'}
                    </td>
                    <td>{c.total_orders ?? 0}</td>
                    <td className={styles.spent}>R${(c.total_spent ?? 0).toFixed(2)}</td>
                    <td className={styles.notes}>{c.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right sidebar */}
        <div className={styles.sidebar}>

          {/* Statistics */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHead}><BarChart2 size={15} /> Estatísticas</div>
            <div className={styles.statList}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Total de clientes</span>
                <span className={styles.statVal}>{customers.length}</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Com pedidos</span>
                <span className={styles.statVal}>{withOrders}</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Total de pedidos</span>
                <span className={styles.statVal}>{totalOrders}</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Gasto médio</span>
                <span className={styles.statVal} style={{ color: '#1a7a44' }}>R${avgSpent.toFixed(2)}</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Total faturado</span>
                <span className={styles.statVal} style={{ color: '#c17f4a', fontWeight: 800 }}>R${totalSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Top clients */}
          <div className={styles.sideCard}>
            <div className={styles.sideCardHead}><Trophy size={15} /> Melhores clientes</div>
            {topClients.filter(c => (c.total_spent ?? 0) > 0).length === 0 ? (
              <p className={styles.sideEmpty}>Nenhum gasto registrado ainda.</p>
            ) : (
              <div className={styles.topList}>
                {topClients.filter(c => (c.total_spent ?? 0) > 0).map((c, i) => (
                  <div key={c.id} className={styles.topRow}>
                    <span className={styles.topRank}>{i + 1}</span>
                    <div className={styles.topInfo}>
                      <span className={styles.topName}>{c.name}</span>
                      <span className={styles.topOrders}>{c.total_orders ?? 0} pedido{(c.total_orders ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <span className={styles.topSpent}>R${(c.total_spent ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New customer modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Novo cliente</h2>
              <button className={styles.close} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome *</label>
                  <input required placeholder="Ex: Maria Silva"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>WhatsApp / Telefone</label>
                  <input placeholder="(11) 99999-9999"
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>E-mail</label>
                  <input type="email" placeholder="maria@email.com"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Instagram</label>
                  <input placeholder="@maria.silva"
                    value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Observações</label>
                <textarea placeholder="Preferências, detalhes importantes, etc."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Salvando...' : 'Cadastrar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
