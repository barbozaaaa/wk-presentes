import styles from './LandingPage.module.css'

interface Props {
  onAcessar: () => void
}

export default function LandingPage({ onAcessar }: Props) {
  return (
    <div className={styles.wrapper}>

      {/* ── ESQUERDA ─────────────────────────────────────────────── */}
      <section className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⚡</div>
          <div>
            <span className={styles.logoName}>Flow</span>
            <span className={styles.logoSub}>WK Presentes</span>
          </div>
        </div>

        <h1 className={styles.headline}>
          Gestão completa<br />
          para sua <span className={styles.accent}>loja de presentes.</span>
        </h1>

        <p className={styles.subtitle}>
          Controle pedidos, clientes e financeiro em um só lugar —
          sem planilhas, sem confusão, sem perder venda por falta de organização.
        </p>

        <ul className={styles.features}>
          <li className={styles.feature}>
            <span className={`${styles.featureIcon} ${styles.iconBlue}`}>📦</span>
            <span>Pedidos e produtos em tempo real</span>
          </li>
          <li className={styles.feature}>
            <span className={`${styles.featureIcon} ${styles.iconGreen}`}>👥</span>
            <span>Histórico completo de clientes</span>
          </li>
          <li className={styles.feature}>
            <span className={`${styles.featureIcon} ${styles.iconOrange}`}>💰</span>
            <span>Painel financeiro com KPIs automáticos</span>
          </li>
          <li className={styles.feature}>
            <span className={`${styles.featureIcon} ${styles.iconPurple}`}>💬</span>
            <span>Atendimento e suporte integrados</span>
          </li>
        </ul>
      </section>

      {/* ── DIREITA ──────────────────────────────────────────────── */}
      <section className={styles.right}>
        <div className={styles.dot} />

        <div className={styles.card}>
          <span className={styles.badge}>Versão demonstração</span>

          <h2 className={styles.cardTitle}>Conheça o painel</h2>

          <p className={styles.cardDesc}>
            Explore todas as funcionalidades do Flow sem precisar de cadastro.
          </p>
          <p className={styles.cardNote}>Os dados ficam salvos no seu navegador.</p>

          <button className={styles.btnPrimary} onClick={onAcessar}>
            ⚡ Acessar produto demo
          </button>

          <div className={styles.divider}>
            <span>Interessado na versão completa?</span>
          </div>

          <p className={styles.wppLink}>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 Fale com a equipe no WhatsApp
            </a>
          </p>
        </div>

        <span className={styles.version}>v2.0 · Flow © 2025</span>
      </section>
    </div>
  )
}
