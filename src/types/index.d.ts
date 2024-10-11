interface Project {
  id: string;
  name: string;
}

interface Expense {
  id: number;
  project_id: string;
  name: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  recurring_period?: string;
}

interface Earning {
  id: number;
  project_id: string;
  name: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  recurring_period?: string;
}