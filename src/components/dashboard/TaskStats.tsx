import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';

export const TaskStats = () => {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user
  });

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;

  const stats = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: Calendar,
      description: 'All your tasks',
      color: 'text-primary'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      description: 'Tasks finished',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      description: 'Currently working on',
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertCircle,
      description: 'Need attention',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};