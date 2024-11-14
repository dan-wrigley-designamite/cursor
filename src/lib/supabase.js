import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xplpiixslvkcalywkznt.supabase.co'
// Use the key you just copied from the dashboard
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbHBpaXhzbHZrY2FseXdrem50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDkxMDU1NCwiZXhwIjoyMDQ2NDg2NTU0fQ.mcj3eWLu42O08p2TSlvmN7lByfCReFzQbz6jchwYNqo'

export const supabase = createClient(supabaseUrl, supabaseKey) 