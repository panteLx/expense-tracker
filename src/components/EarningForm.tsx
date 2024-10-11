import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const earningSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  is_recurring: z.boolean(),
  recurring_period: z.string().optional(),
});

type EarningFormValues = z.infer<typeof earningSchema>;

interface EarningFormProps {
  onAddEarning: (earning: Omit<Earning, 'id' | 'project_id'>) => void;
  initialData?: Earning;
}

const EarningForm: React.FC<EarningFormProps> = ({ onAddEarning, initialData }) => {
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false);
  const { toast } = useToast();

  const form = useForm<EarningFormValues>({
    resolver: zodResolver(earningSchema),
    defaultValues: initialData || {
      name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_period: 'monthly',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      setIsRecurring(initialData.is_recurring);
    }
  }, [initialData, form]);

  const onSubmit = (data: EarningFormValues) => {
    onAddEarning(data);
    if (!initialData) {
      form.reset();
    }
    toast({
      title: initialData ? 'Earning updated' : 'Earning added',
      description: `${data.name} - $${data.amount}`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Earning name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Recurring Earning</FormLabel>
                <FormDescription>
                  Is this a recurring earning?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsRecurring(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {isRecurring && (
          <FormField
            control={form.control}
            name="recurring_period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurring Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recurring period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit">{initialData ? 'Update Earning' : 'Add Earning'}</Button>
      </form>
    </Form>
  );
};

export default EarningForm;