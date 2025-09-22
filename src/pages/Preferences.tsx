import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/*
  Preferences page
  - Reads user preference record from `preferences` table keyed by user_id
  - If table/record is missing, shows friendly defaults
  - This is read-only scaffold; we can wire mutations later
*/

type Prefs = {
  user_id: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  dark_mode?: boolean;
  updated_at?: string | null;
};

const Preferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: prefs, isLoading, error } = useQuery<Prefs | null>({
    queryKey: ['preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return null; // Render defaults if not found
      return data;
    },
    enabled: !!user
  });

  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (prefs) {
      setEmailNotifications(prefs.email_notifications ?? true);
      setPushNotifications(prefs.push_notifications ?? false);
      setDarkMode(prefs.dark_mode ?? false);
    }
  }, [prefs]);

  // Apply theme to the document root when darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const saveMutation = useMutation<void, unknown, { email_notifications: boolean; push_notifications: boolean; dark_mode: boolean }>({
    mutationFn: async (payload) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('preferences')
        .upsert(
          {
            user_id: user.id,
            email_notifications: payload.email_notifications,
            push_notifications: payload.push_notifications,
            dark_mode: payload.dark_mode,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['preferences', user?.id] });
      toast({ title: 'Preferences saved', description: 'Your preferences have been updated.' });
    },
    onError: (err: unknown) => {
      console.error('Preferences save error:', err);
      const message = err instanceof Error ? err.message : 'Please try again.';
      toast({ title: 'Failed to save preferences', description: message, variant: 'destructive' });
    }
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Preferences</h1>

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading preferences...</p>}
          {error && (
            <p className="text-sm text-destructive">Could not load preferences. Showing defaults.</p>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="email_notifications">Email notifications</Label>
            <Switch id="email_notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push_notifications">Push notifications</Label>
            <Switch id="push_notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark_mode">Dark mode</Label>
            <Switch id="dark_mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <p className="text-xs text-muted-foreground">Theme is managed globally. We can hook this up to your theme provider later.</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => saveMutation.mutate({ email_notifications: emailNotifications, push_notifications: pushNotifications, dark_mode: darkMode })} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};

export default Preferences;
