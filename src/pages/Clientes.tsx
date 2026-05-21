import { useCustomers } from '../hooks/useOrders'
import styles from './Clientes.module.css'

interface Props { onToast: (msg: string) => void }

export default function Clientes({ onToast: _onToast }: Props) {
  const { customers, loading } = useCustomers()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Clientes</h1>
          <p className={styles.sub}>{customers.length} clientes cadastrados</p>
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.empty}>Carregando...</div>
        ) : customers.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>👥</span>
            <p>Nenhum cliente ainda.</p>
            <span>Os clientes são adicionados automaticamente ao criar pedidos.</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Nome</th><th>WhatsApp</th><th>Instagram</th><th>Pedidos</th><th>Total gasto</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className={styles.clientName}>{c.name}</div>
                    {c.email && <div className={styles.clientEmail}>{c.email}</div>}
                  </td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.instagram ? <a className={styles.ig} href={`https://instagram.com/${c.instagram.replace('@','')}`} target="_blank">@{c.instagram.replace('@','')}</a> : '—'}</td>
                  <td>{c.total_orders ?? 0}</td>
                  <td className={styles.spent}>R${(c.total_spent ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
