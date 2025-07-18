import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FacebookButtonProps {
  mode: 'login' | 'signup';
}

const FacebookButton: React.FC<FacebookButtonProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithFacebook } = useAuth();

  const handleFacebookAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithFacebook();
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFacebookAuth}
      disabled={isLoading}
      variant="outline"
      className="w-full bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 text-white"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
      )}
      {isLoading 
        ? `${mode === 'login' ? 'Signing in' : 'Signing up'}...`
        : `Continue with Facebook`
      }
    </Button>
  );
};

export default FacebookButton;