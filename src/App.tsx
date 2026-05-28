import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pedidos from './pages/Pedidos'
import Produtos from './pages/Produtos'
import Clientes from './pages/Clientes'
import Atendimento from './pages/Atendimento'
import Financeiro from './pages/Financeiro'
import Configuracoes from './pages/Configuracoes'
import Sidebar from './components/Sidebar'
import styles from './App.module.css'

type Page = 'dashboard' | 'pedidos' | 'produtos' | 'clientes' | 'atendimento' | 'financeiro' | 'configuracoes'

function AppInner() {
  const { session, loading, signOut } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [showLanding, setShowLanding] = useState(true)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  async function handleSignOut() {
    await signOut()
    setPage('dashboard')
    setShowLanding(true)
  }

  if (loading) return (
    <div className={styles.splash}>
      <span className={styles.splashIcon}>⚡</span>
      <span className={styles.splashText}>Flow</span>
    </div>
  )

  if (!session && showLanding) return <LandingPage onAcessar={() => setShowLanding(false)} />
  if (!session) return <Login />

  return (
    <div className={styles.layout}>
      <Sidebar current={page} onChange={p => setPage(p as Page)} onSignOut={handleSignOut} />
      <main className={styles.main}>
        {page === 'dashboard'   && <Dashboard   onToast={showToast} onNavigate={p => setPage(p as Page)} />}
        {page === 'pedidos'     && <Pedidos     onToast={showToast} />}
        {page === 'produtos'    && <Produtos    onToast={showToast} />}
        {page === 'clientes'    && <Clientes    onToast={showToast} />}
        {page === 'atendimento' && <Atendimento onToast={showToast} />}
        {page === 'financeiro'    && <Financeiro />}
        {page === 'configuracoes' && <Configuracoes onToast={showToast} />}
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
