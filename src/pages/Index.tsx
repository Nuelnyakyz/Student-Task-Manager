import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, CheckSquare, Calendar, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Student Task Manager</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Organize Your Academic Life
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Keep track of assignments, set priorities, manage deadlines, and stay on top of your studies with our comprehensive student task manager.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
            Start Managing Tasks
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CheckSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create, organize, and track your assignments with priorities, subjects, and due dates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Deadline Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Never miss another deadline with visual indicators for overdue and upcoming tasks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Progress Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your productivity with detailed statistics and completion tracking.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Organized?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of students who have improved their academic productivity.
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
