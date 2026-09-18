import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://umaiswdohfghdeucaqaj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYWlzd2RvaGZnaGRldWNhcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjI1NDksImV4cCI6MjEwNTI5ODU0OX0._oVjpKUmamVCVTXQ1DNbuQcP3OfJj-GtyKq2c507ZQo';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading tenders data:', error);
    return NextResponse.json({ error: 'Failed to load tenders data' }, { status: 500 });
  }
}
