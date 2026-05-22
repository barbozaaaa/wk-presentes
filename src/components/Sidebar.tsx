import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBusinessInfo } from '../hooks/useOrders'
import styles from './Sidebar.module.css'

type Page = 'dashboard' | 'pedidos' | 'produtos' | 'clientes' | 'atendimento' | 'financeiro'

interface Props {
  current: Page
  onChange: (p: Page) => void
  onSignOut: () => void
}

const nav: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard',   icon: '🏠', label: 'Início'       },
  { id: 'pedidos',     icon: '📦', label: 'Pedidos'      },
  { id: 'produtos',    icon: '🏷️', label: 'Produtos'     },
  { id: 'clientes',    icon: '👥', label: 'Clientes'     },
  { id: 'atendimento', icon: '💬', label: 'Atendimento'  },
  { id: 'financeiro',  icon: '💰', label: 'Financeiro'   },
]

export default function Sidebar({ current, onChange, onSignOut }: Props) {
  const { session } = useAuth()
  const { name, plan } = useBusinessInfo()
  const [mobileOpen, setMobileOpen] = useState(false)
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  function handleNav(id: Page) {
    onChange(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile topbar */}
      <header className={styles.topbar}>
        <button className={styles.hamburger} onClick={() => setMobileOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <div className={styles.topbarBrand}>
          <span>⚡</span>
          <span className={styles.topbarName}>Flow</span>
        </div>
      </header>

      {/* Overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <div>
              <div className={styles.logoName}>Flow</div>
              <div className={styles.logoPlan}>
                {plan === 'pro' ? '⭐ Pro' : plan === 'basic' ? 'Basic' : 'Trial'}
              </div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {nav.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${current === item.id ? styles.active : ''}`}
              onClick={() => handleNav(item.id)}
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
    </>
  )
}
