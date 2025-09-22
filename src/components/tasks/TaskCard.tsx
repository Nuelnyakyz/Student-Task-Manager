import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  Clock, 
  Circle, 
  Star, 
  MoreVertical, 
  Trash2, 
  Calendar,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  priority: string;
  status: string;
  due_date?: string;
  is_favorite: boolean;
  created_at: string;
  completed_at?: string;
  updated_at: string;
  user_id: string;
}

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Click to mark as In Progress';
      case 'in-progress':
        return 'Click to mark as Completed';
      case 'completed':
        return 'Click to mark as Pending';
      default:
        return 'Click to change status';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const isDueSoon = task.due_date && isAfter(new Date(task.due_date), new Date()) && isBefore(new Date(task.due_date), addDays(new Date(), 3));

  const handleStatusChange = () => {
    const statusOrder = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];
    
    onUpdate({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    });
  };

  const toggleFavorite = () => {
    onUpdate({ is_favorite: !task.is_favorite });
  };

  return (
    <TooltipProvider>
      <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleStatusChange} 
                      className="transition-all hover:scale-110 hover:bg-muted/50 rounded-full p-1 -m-1"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getStatusTooltip(task.status)}</p>
                  </TooltipContent>
                </Tooltip>
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {task.status === 'pending' ? 'Pending' : 
                 task.status === 'in-progress' ? 'In Progress' : 
                 'Completed'}
              </Badge>
              {task.is_favorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            
            <div className="flex items-center flex-wrap gap-2">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              
              {task.subject && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {task.subject}
                </Badge>
              )}
              
              {task.due_date && (
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    isOverdue ? 'bg-red-100 text-red-800 border-red-200' : 
                    isDueSoon ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''
                  }`}
                >
                  {isOverdue && <AlertTriangle className="h-3 w-3" />}
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), 'MMM dd, yyyy')}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFavorite}>
                <Star className={`mr-2 h-4 w-4 ${task.is_favorite ? 'fill-current text-yellow-500' : ''}`} />
                {task.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};