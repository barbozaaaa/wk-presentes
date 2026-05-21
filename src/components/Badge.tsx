import styles from './Badge.module.css'

type Variant = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray' | 'brown'

interface Props {
  variant?: Variant
  children: React.ReactNode
}

export default function Badge({ variant = 'gray', children }: Props) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
}
