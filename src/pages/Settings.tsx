import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type Profile = {
  user_id: string;
  full_name?: string;
  bio?: string;
  email?: string | null;
  avatar_url?: string | null;
  updated_at?: string | null;
};

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profile, isLoading, error } = useQuery<Profile | null>({
    queryKey: ['profile-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const saveMutation = useMutation<void, unknown, { full_name: string; bio: string }>({
    mutationFn: async (payload) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            full_name: payload.full_name,
            bio: payload.bio,
            email: user.email,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['profile-settings', user?.id] });
      toast({ title: 'Profile saved', description: 'Your profile has been updated successfully.' });
    },
    onError: (err: unknown) => {
      console.error('Profile save error:', err);
      const message = err instanceof Error ? err.message : 'Please try again.';
      toast({ title: 'Failed to save profile', description: message, variant: 'destructive' });
    }
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading profile...</p>}
          {error && (
            <p className="text-sm text-destructive">Failed to load profile. Please try again.</p>
          )}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} readOnly className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="about">About</Label>
                <Input id="about" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => saveMutation.mutate({ full_name: fullName, bio })} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage password and sessions from your authentication provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
