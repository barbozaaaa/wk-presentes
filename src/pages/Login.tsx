import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

type Tab = 'login' | 'cadastro'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab]           = useState<Tab>('login')
  const [biz, setBiz]           = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.includes('Invalid login')) setError('E-mail ou senha incorretos.')
        else setError('Erro de conexão. Verifique sua internet.')
      }
    } else {
      if (!biz.trim()) { setError('Informe o nome da empresa.'); setLoading(false); return }
      const { error } = await signUp(email, password, biz)
      if (error) {
        if (error.includes('already registered')) setError('E-mail já cadastrado. Faça login.')
        else if (error.includes('password')) setError('Senha deve ter ao menos 6 caracteres.')
        else setError('Erro de conexão. Tente novamente.')
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>

      {/* ── LADO ESQUERDO — apresentação do produto ── */}
      <div className={styles.left}>
        <div className={styles.leftInner}>

          <div className={styles.logo}>
            <div className={styles.logoIcon}>⚡</div>
            <div>
              <span className={styles.logoName}>Flow</span>
              <span className={styles.logoSub}>WK Presentes</span>
            </div>
          </div>

          <h1 className={styles.headline}>
            Tudo que sua loja<br />
            precisa, em um<br />
            <span className={styles.accent}>só lugar.</span>
          </h1>

          <p className={styles.sub}>
            Do pedido ao financeiro — controle sua loja de presentes
            de forma simples, rápida e sem complicação.
          </p>

          <ul className={styles.features}>
            <li>
              <span className={styles.featureIcon}>📦</span>
              <div>
                <strong>Pedidos em tempo real</strong>
                <span>Acompanhe cada venda do início ao fim</span>
              </div>
            </li>
            <li>
              <span className={styles.featureIcon}>👥</span>
              <div>
                <strong>Gestão de clientes</strong>
                <span>Histórico completo de cada cliente</span>
              </div>
            </li>
            <li>
              <span className={styles.featureIcon}>💰</span>
              <div>
                <strong>Painel financeiro</strong>
                <span>Receita, despesas e margem de lucro</span>
              </div>
            </li>
            <li>
              <span className={styles.featureIcon}>💬</span>
              <div>
                <strong>Atendimento integrado</strong>
                <span>Registre e acompanhe cada contato</span>
              </div>
            </li>
          </ul>

        </div>
      </div>

      {/* ── LADO DIREITO — formulário de login ── */}
      <div className={styles.right}>
        <div className={styles.card}>

          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {tab === 'login' ? 'Entrar na sua conta' : 'Criar conta'}
            </h2>
            <p className={styles.cardSub}>
              {tab === 'login'
                ? 'Acesse o painel da sua loja'
                : 'Comece a usar o Flow agora'}
            </p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setTab('login'); setError(null); setSuccess(null) }}>
              Entrar
            </button>
            <button
              className={`${styles.tab} ${tab === 'cadastro' ? styles.tabActive : ''}`}
              onClick={() => { setTab('cadastro'); setError(null); setSuccess(null) }}>
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {tab === 'cadastro' && (
              <div className={styles.field}>
                <label className={styles.label}>Nome da empresa</label>
                <input
                  className={styles.input}
                  placeholder="Ex: WK Canecas e Presentes"
                  value={biz}
                  onChange={e => setBiz(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>E-mail</label>
              <input
                className={styles.input}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus={tab === 'login'}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Senha</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {tab === 'cadastro' && (
                <span className={styles.hint}>Mínimo 6 caracteres</span>
              )}
            </div>

            {error   && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button
              type="submit"
              className={styles.btn}
              disabled={loading || !email || !password}
            >
              {loading
                ? 'Aguarde...'
                : tab === 'login'
                  ? 'Entrar no painel'
                  : 'Criar minha conta'}
            </button>
          </form>

          <p className={styles.version}>Flow v2.0 · WK Presentes © 2025</p>
        </div>
      </div>

    </div>
  )
}
