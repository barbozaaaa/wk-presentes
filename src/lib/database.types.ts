export interface Business {
  id: string
  owner_id: string
  name: string
  plan: 'trial' | 'basic' | 'pro'
  created_at: string
}

export interface Customer {
  id: string
  business_id: string
  name: string
  phone: string
  instagram?: string
  email?: string
  notes?: string
  total_orders: number
  total_spent: number
  created_at: string
}

export type OrderStatus =
  | 'novo'
  | 'criando_arte'
  | 'aguardando_aprovacao'
  | 'aprovado'
  | 'em_producao'
  | 'pronto'
  | 'entregue'
  | 'cancelado'

export type OrderSource = 'whatsapp' | 'instagram' | 'presencial' | 'outro'

export interface OrderItem {
  produto: string
  quantidade: number
  valor_unitario: number
  detalhes?: string
}

export interface Order {
  id: string
  business_id: string
  customer_id?: string
  customer_name: string
  customer_phone: string
  source: OrderSource
  status: OrderStatus
  items: OrderItem[]
  total_value: number
  cost: number
  notes?: string
  deadline?: string
  art_url?: string
  created_at: string
  updated_at: string
}

export interface FinancialSummary {
  month: string
  revenue: number
  cost: number
  profit: number
  orders_count: number
}
