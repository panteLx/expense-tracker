import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import ExpenseForm from './ExpenseForm';
import EarningForm from './EarningForm';
import ShareLink from './ShareLink';
import { format, isAfter, isBefore, isWithinInterval, startOfYear, endOfYear, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, eachMonthOfInterval, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, addYears, isEqual } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateRange } from "react-day-picker"

interface DashboardProps {
  expenses: Expense[];
  earnings: Earning[];
  onUpdateExpense: (expense: Expense) => void;
  onUpdateEarning: (earning: Earning) => void;
  onRemoveExpense: (id: number) => void;
  onRemoveEarning: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  expenses, 
  earnings, 
  onUpdateExpense, 
  onUpdateEarning, 
  onRemoveExpense, 
  onRemoveEarning
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date())
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingEarning, setEditingEarning] = useState<Earning | null>(null);

  const getTimeUntilNextRecurrence = (item: Expense | Earning) => {
    if (!item.is_recurring) return 'N/A';

    const today = new Date();
    let nextDate = new Date(item.date);

    while (isBefore(nextDate, today) || isEqual(nextDate, today)) {
      switch (item.recurring_period) {
        case 'daily':
          nextDate = addDays(nextDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
      }
    }

    const daysUntil = differenceInDays(nextDate, today);
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 7) return `${daysUntil} days`;
    if (daysUntil < 30) return `${Math.floor(daysUntil / 7)} weeks`;
    if (daysUntil < 365) return `${Math.floor(daysUntil / 30)} months`;
    return `${Math.floor(daysUntil / 365)} years`;
  };

  const calculateAmountForPeriod = (item: Expense | Earning, start: Date, end: Date) => {
    const itemDate = new Date(item.date);
    if (!item.is_recurring) {
      return isWithinInterval(itemDate, { start, end }) ? item.amount : 0;
    }

    let total = 0;
    let currentDate = new Date(Math.max(itemDate.getTime(), start.getTime()));

    while (currentDate <= end) {
      if (!isBefore(currentDate, itemDate)) {
        total += item.amount;
      }

      switch (item.recurring_period) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, 1);
          break;
      }
    }

    return total;
  };

  const calculateTotalAmount = (items: (Expense | Earning)[], start: Date, end: Date) => {
    return items.reduce((total, item) => {
      return total + calculateAmountForPeriod(item, start, end);
    }, 0);
  };

  const totalExpenses = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return calculateTotalAmount(expenses, dateRange.from, dateRange.to);
    }
    return 0;
  }, [expenses, dateRange]);

  const totalEarnings = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return calculateTotalAmount(earnings, dateRange.from, dateRange.to);
    }
    return 0;
  }, [earnings, dateRange]);

  const netEarnings = totalEarnings - totalExpenses;

  const chartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const months = eachMonthOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthlyExpenses = calculateTotalAmount(expenses, monthStart, monthEnd);
      const monthlyEarnings = calculateTotalAmount(earnings, monthStart, monthEnd);

      return {
        name: format(month, 'MMM yyyy'),
        Expenses: monthlyExpenses,
        Earnings: monthlyEarnings,
        NetEarnings: monthlyEarnings - monthlyExpenses,
      };
    });
  }, [expenses, earnings, dateRange]);

  return (
    <div className="space-y-4">
      <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netEarnings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${netEarnings.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Expenses" stroke="#ff0000" />
              <Line type="monotone" dataKey="Earnings" stroke="#00ff00" />
              <Line type="monotone" dataKey="NetEarnings" stroke="#0000ff" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center mb-2">
                  <span>
                    {expense.name} - ${expense.amount.toFixed(2)} 
                    <br />
                    <small className="text-muted-foreground">
                      {format(new Date(expense.date), 'MMM dd, yyyy')} 
                      {expense.is_recurring && ` (${expense.recurring_period})`}
                    </small>
                    {expense.is_recurring && (
                      <>
                        <br />
                        <small className="text-muted-foreground">Next: {getTimeUntilNextRecurrence(expense)}</small>
                      </>
                    )}
                  </span>
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingExpense(expense)}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Expense</DialogTitle>
                        </DialogHeader>
                        {editingExpense && (
                          <ExpenseForm
                            onAddExpense={(updatedExpense) => {
                              onUpdateExpense({ ...updatedExpense, id: editingExpense.id, project_id: editingExpense.project_id });
                              setEditingExpense(null);
                            }}
                            initialData={editingExpense}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => onRemoveExpense(expense.id)}>
                      Remove
                    </Button>
                    <ShareLink itemId={expense.id} itemType="expense" />
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {earnings.map((earning) => (
                <div key={earning.id} className="flex justify-between items-center mb-2">
                  <span>
                    {earning.name} - ${earning.amount.toFixed(2)}
                    <br />
                    <small className="text-muted-foreground">
                      {format(new Date(earning.date), 'MMM dd, yyyy')} 
                      {earning.is_recurring && ` (${earning.recurring_period})`}
                    </small>
                    {earning.is_recurring && (
                      <>
                        <br />
                        <small className="text-muted-foreground">Next: {getTimeUntilNextRecurrence(earning)}</small>
                      </>
                    )}
                  </span>
                  <div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingEarning(earning)}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Earning</DialogTitle>
                        </DialogHeader>
                        {editingEarning && (
                          <EarningForm
                            onAddEarning={(updatedEarning) => {
                              onUpdateEarning({ ...updatedEarning, id: editingEarning.id, project_id: editingEarning.project_id });
                              setEditingEarning(null);
                            }}
                            initialData={editingEarning}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => onRemoveEarning(earning.id)}>
                      Remove
                    </Button>
                    <ShareLink itemId={earning.id} itemType="earning" />
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;