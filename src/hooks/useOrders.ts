import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Order, OrderStatus, Customer } from '../lib/database.types'

async function getBusinessId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .single()
  return (data as any)?.id ?? null
}

export function useOrders() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!session?.user) return
    setLoading(true)
    const bid = await getBusinessId(session.user.id)
    if (!bid) { setLoading(false); return }
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', bid)
      .order('created_at', { ascending: false })
    setOrders((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [session])

  async function updateStatus(id: string, status: OrderStatus) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() } as any).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  async function createOrder(order: Omit<Order, 'id' | 'business_id' | 'created_at' | 'updated_at'>) {
    if (!session?.user) return
    const bid = await getBusinessId(session.user.id)
    if (!bid) return
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('orders')
      .insert([{ ...order, business_id: bid, created_at: now, updated_at: now } as any])
      .select()
      .single()
    if (data) setOrders(prev => [data as Order, ...prev])
  }

  async function deleteOrder(id: string) {
    await supabase.from('orders').delete().eq('id', id)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  return { orders, loading, updateStatus, createOrder, deleteOrder, reload: load }
}

export function useCustomers() {
  const { session } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!session?.user) return
      setLoading(true)
      const bid = await getBusinessId(session.user.id)
      if (!bid) { setLoading(false); return }
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', bid)
        .order('name')
      setCustomers((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [session])

  return { customers, loading }
}

export function useBusinessInfo() {
  const { session } = useAuth()
  const [name, setName] = useState('WK Presentes')
  const [plan, setPlan] = useState('trial')

  useEffect(() => {
    async function load() {
      if (!session?.user) return
      const { data } = await supabase
        .from('businesses')
        .select('name, plan')
        .eq('owner_id', session.user.id)
        .single()
      if (data) {
        setName((data as any).name ?? 'WK Presentes')
        setPlan((data as any).plan ?? 'trial')
      }
    }
    load()
  }, [session])

  return { name, plan }
}
