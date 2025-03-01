import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zpsbbamiigqrzowpxikk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwc2JiYW1paWdxcnpvd3B4aWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NjA1NDksImV4cCI6MjA1NjQzNjU0OX0.SAvQe6BowG2oSObcTyFz_FxwcX9C7O9RhZumVtFNHxA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)