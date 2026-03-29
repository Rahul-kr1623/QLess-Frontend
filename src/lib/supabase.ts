import { createClient } from '@supabase/supabase-js';

// Seedha .env file se secure tareeke se values utha rahe hain
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client initialize kar rahe hain
export const supabase = createClient(supabaseUrl, supabaseKey);

// Bacchon ka data structure (TypeScript Interface)
export interface Attendee {
  id: string;
  name: string;
  email: string;
  reg_no: string;
  is_present: boolean;
  entry_time: string | null;
  event_id: string | null;
}