import { useAuth } from '../context/AuthContext'
import { useBusinessInfo } from '../hooks/useOrders'
import styles from './Sidebar.module.css'

type Page = 'dashboard' | 'pedidos' | 'clientes' | 'financeiro' | 'automacoes'

interface Props {
  current: Page
  onChange: (p: Page) => void
  onSignOut: () => void
}

const nav: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard',   icon: '🏠', label: 'Início'       },
  { id: 'pedidos',     icon: '📦', label: 'Pedidos'      },
  { id: 'clientes',    icon: '👥', label: 'Clientes'     },
  { id: 'financeiro',  icon: '💰', label: 'Financeiro'   },
  { id: 'automacoes',  icon: '⚡', label: 'Automações'   },
]

export default function Sidebar({ current, onChange, onSignOut }: Props) {
  const { session } = useAuth()
  const { name, plan } = useBusinessInfo()
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎁</span>
          <div>
            <div className={styles.logoName}>WK Presentes</div>
            <div className={styles.logoPlan}>{plan === 'pro' ? 'Pro' : plan === 'basic' ? 'Basic' : 'Trial'}</div>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {nav.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${current === item.id ? styles.active : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.user}>
          <div className={styles.avatar}>{initials || 'WK'}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{name}</div>
            <div className={styles.userEmail}>{session?.user?.email}</div>
          </div>
          <button className={styles.signOut} onClick={onSignOut} title="Sair">⏻</button>
        </div>
      </div>
    </aside>
  )
}
