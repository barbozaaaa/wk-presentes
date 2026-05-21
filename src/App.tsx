import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pedidos from './pages/Pedidos'
import Clientes from './pages/Clientes'
import Financeiro from './pages/Financeiro'
import Automacoes from './pages/Automacoes'
import Sidebar from './components/Sidebar'
import styles from './App.module.css'

type Page = 'dashboard' | 'pedidos' | 'clientes' | 'financeiro' | 'automacoes'

function AppInner() {
  const { session, loading, signOut } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  async function handleSignOut() {
    await signOut()
    setPage('dashboard')
  }

  if (loading) return (
    <div className={styles.splash}>
      <span className={styles.splashIcon}>🎁</span>
      <span className={styles.splashText}>WK Presentes</span>
    </div>
  )

  if (!session) return <Login />

  return (
    <div className={styles.layout}>
      <Sidebar current={page} onChange={setPage} onSignOut={handleSignOut} />
      <main className={styles.main}>
        {page === 'dashboard'  && <Dashboard  onToast={showToast} />}
        {page === 'pedidos'    && <Pedidos    onToast={showToast} />}
        {page === 'clientes'   && <Clientes   onToast={showToast} />}
        {page === 'financeiro' && <Financeiro />}
        {page === 'automacoes' && <Automacoes onToast={showToast} />}
      </main>
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
