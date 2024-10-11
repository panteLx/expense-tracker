import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getExpenseById, getEarningById } from '@/lib/db';
import { format } from 'date-fns';

interface SharedItemViewProps {
  itemType: 'expense' | 'earning';
  itemId: number;
}

const SharedItemView: React.FC<SharedItemViewProps> = ({ itemType, itemId }) => {
  const [item, setItem] = useState<Expense | Earning | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (itemType === 'expense') {
          const expense = await getExpenseById(itemId);
          setItem(expense);
        } else {
          const earning = await getEarningById(itemId);
          setItem(earning);
        }
      } catch (error) {
        console.error('Error fetching shared item:', error);
        setError('Failed to load the shared item. It may not exist or you may not have permission to view it.');
      }
    };
    fetchItem();
  }, [itemType, itemId]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{itemType === 'expense' ? 'Expense' : 'Earning'} Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Name:</strong> {item.name}</p>
        <p><strong>Amount:</strong> ${item.amount.toFixed(2)}</p>
        <p><strong>Date:</strong> {format(new Date(item.date), 'MMM dd, yyyy')}</p>
        {itemType === 'expense' && (
          <p><strong>Category:</strong> {(item as Expense).category}</p>
        )}
        {itemType === 'earning' && (
          <p><strong>Source:</strong> {(item as Earning).source}</p>
        )}
        <p><strong>Recurring:</strong> {item.isRecurring ? 'Yes' : 'No'}</p>
        {item.isRecurring && (
          <p><strong>Recurring Period:</strong> {item.recurringPeriod}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedItemView;