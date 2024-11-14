import { supabase } from '@/lib/supabase'

console.log('Imported supabase:', supabase)

export async function validateApiKey(key) {
  if (!key) {
    return { isValid: false }
  }
  
  try {
    const query = supabase
      .from('api_keys')
      .select('*')
      .eq('key', key)
      .limit(1)
      .single()
    
    console.log('Validating key:', key)
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { isValid: !!data }
  } catch (error) {
    console.error('API key validation error:', error)
    return { isValid: false }
  }
} 