import styles from './Atendimento.module.css'

interface Props { onToast: (msg: string) => void }

export default function Atendimento({ onToast: _t }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Atendimento</h1>
        <p className={styles.sub}>Mensagens do WhatsApp e Instagram</p>
      </div>
      <div className={styles.coming}>
        <span className={styles.comingIcon}>💬</span>
        <h2>Em breve</h2>
        <p>A área de atendimento integrado com WhatsApp e Instagram está sendo desenvolvida.</p>
        <p>Aqui você poderá ver todas as mensagens recebidas, responder clientes e acompanhar o status de cada atendimento.</p>
        <div className={styles.features}>
          <div className={styles.feature}>📱 Mensagens do WhatsApp</div>
          <div className={styles.feature}>📸 Mensagens do Instagram</div>
          <div className={styles.feature}>✅ Marcar como respondido</div>
          <div className={styles.feature}>🤖 Bot automático</div>
        </div>
      </div>
    </div>
  )
}
