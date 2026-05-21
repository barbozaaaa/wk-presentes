import { createClient } from '@supabase/supabase-js'

// Configure com suas credenciais do Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const isConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY
