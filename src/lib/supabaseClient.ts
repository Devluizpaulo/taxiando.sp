import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vzcbqtowoousgklffnhi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y2JxdG93b291c2drbGZmbmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MzE1MzIsImV4cCI6MjA1OTQwNzUzMn0.T1E1DQol6Ld2mVrarSUoEpqcNwDvKaEWTTbM_YmhDm8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 