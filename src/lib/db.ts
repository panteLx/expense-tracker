import { supabase } from './supabase';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function addProject(name: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getExpenses(projectId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data || [];
}

export async function addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', expense.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: number): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getEarnings(projectId: string): Promise<Earning[]> {
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data || [];
}

export async function addEarning(earning: Omit<Earning, 'id'>): Promise<Earning> {
  const { data, error } = await supabase
    .from('earnings')
    .insert(earning)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEarning(earning: Earning): Promise<Earning> {
  const { data, error } = await supabase
    .from('earnings')
    .update(earning)
    .eq('id', earning.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEarning(id: number): Promise<void> {
  const { error } = await supabase
    .from('earnings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getEarningById(id: number): Promise<Earning | null> {
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}