import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

type Tab = 'login' | 'cadastro'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab]         = useState<Tab>('login')
  const [biz, setBiz]         = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.includes('Invalid login')) setError('Email ou senha incorretos.')
        else setError('Erro de conexão. Verifique sua internet.')
      }
    } else {
      if (!biz.trim()) { setError('Informe o nome do negócio.'); setLoading(false); return }
      const { error } = await signUp(email, password, biz)
      if (error) {
        if (error.includes('already registered')) setError('Email já cadastrado. Faça login.')
        else if (error.includes('password')) setError('Senha deve ter ao menos 6 caracteres.')
        else setError('Erro de conexão. Tente novamente.')
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <div>
            <div className={styles.logoName}>Flow</div>
            <div className={styles.logoSub}>Painel de Gestão</div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setTab('login'); setError(null); setSuccess(null) }}>
            Entrar
          </button>
          <button className={`${styles.tab} ${tab === 'cadastro' ? styles.tabActive : ''}`}
            onClick={() => { setTab('cadastro'); setError(null); setSuccess(null) }}>
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {tab === 'cadastro' && (
            <div className={styles.field}>
              <label className={styles.label}>Nome do negócio</label>
              <input className={styles.input} placeholder="Ex: WK Canecas e Presentes"
                value={biz} onChange={e => setBiz(e.target.value)} autoFocus />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>E-mail</label>
            <input className={styles.input} type="email" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} autoFocus={tab === 'login'} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input className={styles.input} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
            {tab === 'cadastro' && <span className={styles.hint}>Mínimo 6 caracteres</span>}
          </div>

          {error   && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button type="submit" className={styles.btn} disabled={loading || !email || !password}>
            {loading ? 'Aguarde...' : tab === 'login' ? 'Entrar no painel' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
