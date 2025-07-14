
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GitHubButtonProps {
  mode: 'login' | 'signup';
}

const GitHubButton: React.FC<GitHubButtonProps> = ({ mode }) => {
  const handleGitHubAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "GitHub authentication failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "GitHub authentication failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGitHubAuth}
      className="w-full border-slate-600/50 bg-slate-700/30 text-slate-300 hover:bg-slate-600/50"
    >
      <Github className="w-4 h-4 mr-2" />
      {mode === 'login' ? 'Sign in' : 'Sign up'} with GitHub
    </Button>
  );
};

export default GitHubButton;
