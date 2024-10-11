import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(username: string, pin: string) {
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@example.com`,
    password: pin,
  });
  
  if (error) throw error;
  
  if (data.user) {
    await supabase.from('users').insert({ id: data.user.id, username, pin });
  }
  
  return data;
}

export async function signIn(username: string, pin: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@example.com`,
    password: pin,
  });
  
  if (error) throw error;
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}