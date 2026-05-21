import { useState } from 'react'
import { useProducts, type Product } from '../hooks/useOrders'
import Badge from '../components/Badge'
import styles from './Produtos.module.css'

interface Props { onToast: (msg: string) => void }

type Status = 'ativo' | 'inativo' | 'sem_estoque'

const CATEGORIAS = [
  'Canecas', 'Kits', 'Chaveiros', 'Papelaria', 'Festas', 'Casamentos',
  'Maternidade', 'Lembranças', 'Outros'
]

const STATUS_LABELS: Record<Status, string> = {
  ativo: 'Ativo', inativo: 'Inativo', sem_estoque: 'Sem estoque'
}
const STATUS_VARIANT: Record<Status, 'green' | 'gray' | 'amber'> = {
  ativo: 'green', inativo: 'gray', sem_estoque: 'amber'
}

const EMPTY_FORM = {
  name: '', description: '', price: '', cost: '',
  category: 'Canecas', image_url: '', stock: '0', status: 'ativo' as Status
}

export default function Produtos({ onToast }: Props) {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Product | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm(p => ({ ...p, [k]: v }))

  const categories = ['Todos', ...CATEGORIAS]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'Todos' || p.category === catFilter
    return matchSearch && matchCat
  })

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, description: p.description ?? '',
      price: String(p.price), cost: String(p.cost),
      category: p.category, image_url: p.image_url ?? '',
      stock: String(p.stock), status: p.status
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: parseFloat(form.price) || 0,
      cost: parseFloat(form.cost) || 0,
      category: form.category,
      image_url: form.image_url.trim() || undefined,
      stock: parseInt(form.stock) || 0,
      status: form.status,
    }
    if (editing) {
      await updateProduct(editing.id, payload)
      onToast('✏️ Produto atualizado!')
    } else {
      await createProduct(payload)
      onToast('✅ Produto cadastrado!')
    }
    setShowModal(false)
  }

  const activeCount   = products.filter(p => p.status === 'ativo').length
  const inactiveCount = products.filter(p => p.status === 'inativo').length
  const noStockCount  = products.filter(p => p.status === 'sem_estoque').length

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Produtos</h1>
          <p className={styles.sub}>{products.length} cadastrados · {activeCount} ativos</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>＋ Novo produto</button>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.sumCard}>
          <span className={styles.sumIcon}>✅</span>
          <span className={styles.sumVal}>{activeCount}</span>
          <span className={styles.sumLabel}>Ativos</span>
        </div>
        <div className={styles.sumCard}>
          <span className={styles.sumIcon}>⚠️</span>
          <span className={styles.sumVal}>{noStockCount}</span>
          <span className={styles.sumLabel}>Sem estoque</span>
        </div>
        <div className={styles.sumCard}>
          <span className={styles.sumIcon}>🔴</span>
          <span className={styles.sumVal}>{inactiveCount}</span>
          <span className={styles.sumLabel}>Inativos</span>
        </div>
        <div className={styles.sumCard}>
          <span className={styles.sumIcon}>🏷️</span>
          <span className={styles.sumVal}>{products.length}</span>
          <span className={styles.sumLabel}>Total</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.search}
          placeholder="🔍 Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.cats}>
          {categories.map(c => (
            <button
              key={c}
              className={`${styles.cat} ${catFilter === c ? styles.catActive : ''}`}
              onClick={() => setCatFilter(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className={styles.emptyFull}>Carregando produtos...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyFull}>
          {products.length === 0
            ? '🏷️ Nenhum produto cadastrado. Clique em "+ Novo produto" para começar!'
            : '🔍 Nenhum produto encontrado com esse filtro.'
          }
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(p => (
            <div key={p.id} className={`${styles.card} ${p.status !== 'ativo' ? styles.cardDim : ''}`}>
              <div className={styles.cardImg}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} />
                  : <span className={styles.cardImgPlaceholder}>🎁</span>
                }
                <div className={styles.cardBadge}>
                  <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardCat}>{p.category}</div>
                <div className={styles.cardName}>{p.name}</div>
                {p.description && <div className={styles.cardDesc}>{p.description}</div>}
                <div className={styles.cardFooter}>
                  <div className={styles.cardPrices}>
                    <span className={styles.cardPrice}>R${p.price.toFixed(2)}</span>
                    {p.cost > 0 && (
                      <span className={styles.cardMargin}>
                        {Math.round((p.price - p.cost) / p.price * 100)}% margem
                      </span>
                    )}
                  </div>
                  <div className={styles.cardStock}>
                    {p.stock > 0 ? `${p.stock} un.` : 'Sob encomenda'}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.btnEdit} onClick={() => openEdit(p)}>✏️ Editar</button>
                  <button className={styles.btnDel}  onClick={() => setConfirmDel(p.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal create/edit */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{editing ? '✏️ Editar produto' : '➕ Novo produto'}</h2>
              <button className={styles.close} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Image preview */}
              {form.image_url && (
                <div className={styles.imgPreview}>
                  <img src={form.image_url} alt="preview" />
                </div>
              )}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome do produto *</label>
                  <input required placeholder="Ex: Caneca personalizada"
                    value={form.name} onChange={e => f('name', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>Descrição</label>
                <textarea placeholder="Descreva o produto, materiais, tamanhos disponíveis..."
                  value={form.description} onChange={e => f('description', e.target.value)} rows={2} />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Preço de venda (R$) *</label>
                  <input type="number" step="0.01" min="0" required placeholder="0.00"
                    value={form.price} onChange={e => f('price', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Custo (R$)</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00"
                    value={form.cost} onChange={e => f('cost', e.target.value)} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Estoque (0 = sob encomenda)</label>
                  <input type="number" min="0" value={form.stock} onChange={e => f('stock', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Status</label>
                  <select value={form.status} onChange={e => f('status', e.target.value as Status)}>
                    <option value="ativo">✅ Ativo</option>
                    <option value="sem_estoque">⚠️ Sem estoque</option>
                    <option value="inativo">🔴 Inativo</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>URL da imagem</label>
                <input type="url" placeholder="https://..."
                  value={form.image_url} onChange={e => f('image_url', e.target.value)} />
                <span className={styles.hint}>Cole o link de uma imagem do produto</span>
              </div>
              {/* Margin preview */}
              {parseFloat(form.price) > 0 && parseFloat(form.cost) > 0 && (
                <div className={styles.marginPreview}>
                  <span>💡 Margem de lucro: </span>
                  <strong style={{ color: '#1a7a44' }}>
                    {Math.round((parseFloat(form.price) - parseFloat(form.cost)) / parseFloat(form.price) * 100)}%
                    (R${(parseFloat(form.price) - parseFloat(form.cost)).toFixed(2)})
                  </strong>
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>
                  {editing ? 'Salvar alterações' : 'Cadastrar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div className={styles.overlay} onClick={() => setConfirmDel(null)}>
          <div className={styles.confirm} onClick={e => e.stopPropagation()}>
            <span className={styles.confirmIcon}>🗑️</span>
            <p>Excluir este produto permanentemente?</p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className={styles.btnDanger} onClick={async () => {
                await deleteProduct(confirmDel)
                setConfirmDel(null)
                onToast('🗑️ Produto excluído.')
              }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
