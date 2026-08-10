import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// For frontend components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For backend admin tasks (inserting articles, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
