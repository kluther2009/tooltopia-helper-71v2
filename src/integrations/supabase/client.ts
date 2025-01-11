import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bnwztdwbdejiubjfpigj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud3p0ZHdiZGVqaXViamZwaWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1OTY1NTgsImV4cCI6MjA0OTE3MjU1OH0.sxCfIL5HXXQVkwOYLBXRrAj5FALgfecsFLc9vdS54yQ";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);