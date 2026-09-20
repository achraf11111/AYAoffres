import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umaiswdohfghdeucaqaj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYWlzd2RvaGZnaGRldWNhcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjI1NDksImV4cCI6MjEwNTI5ODU0OX0._oVjpKUmamVCVTXQ1DNbuQcP3OfJj-GtyKq2c507ZQo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
