-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT
);

-- Create earnings table
CREATE TABLE IF NOT EXISTS public.earnings (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  source TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Enable read access for all users" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.projects
  FOR INSERT WITH CHECK (true);

-- Create policies for expenses table
CREATE POLICY "Enable read access for all users" ON public.expenses
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.expenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.expenses
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.expenses
  FOR DELETE USING (true);

-- Create policies for earnings table
CREATE POLICY "Enable read access for all users" ON public.earnings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.earnings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.earnings
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.earnings
  FOR DELETE USING (true);