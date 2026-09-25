import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';

export function CompleteStep() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        await api.post('/api/v1/student/onboarding/complete');
        setStatus('success');
        
        // Wait a brief moment so the user sees the success state before redirecting
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (err) {
        console.error(err);
        setError('Failed to finalize your profile setup.');
        setStatus('error');
      }
    };

    completeOnboarding();
  }, [router]);

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wrapping things up...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Saving your amazing profile.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 dark:bg-green-900/30 dark:text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You're all set!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your profile looks great. Taking you to the dashboard...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert variant="error" title="Oops!" className="max-w-md mx-auto text-left">
            {error}
          </Alert>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 text-blue-600 hover:underline text-sm font-medium"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
