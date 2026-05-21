import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ecimoomzvdvzahmiyudg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjaW1vb216dmR2emFobWl5dWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTIwMzMsImV4cCI6MjA5NDk2ODAzM30.fnAGIthX6h-_NpgZSfQBYELL-X0eMyGr7p6Ffl6DYL0'
)
export const isConfigured = true
