'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { GraduationCap, Sparkles, User, Award, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword123!');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      });
      await login(response.data.access_token);
      
      // Intelligent role-based redirection
      if (response.data.role === 'alumni') {
        router.push('/alumni-mentorship');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { detail?: string } } };
      if (errorObj.response?.status === 401) {
        setError('Incorrect email address or password.');
      } else if (errorObj.response?.data?.detail) {
        setError(errorObj.response.data.detail);
      } else {
        setError('An unexpected error occurred during login. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">AlumniConnect</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Welcome back
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Sign in to access your mentorship dashboard and resources
          </p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Quick Demo Evaluation Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('student@demo.edu')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <User className="h-3.5 w-3.5" /> Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('alumni@demo.edu')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Award className="h-3.5 w-3.5" /> Alumni Demo
            </button>
          </div>
        </div>

        {/* Main Card Form */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="error" title="Login Failed">
                {error}
              </Alert>
            )}

            <div className="space-y-4">
              <Input
                id="email-address"
                name="email"
                type="email"
                label="Email address"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 py-2.5"
                isLoading={isSubmitting}
              >
                Sign In <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>

          <div className="mt-6 text-xs text-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-slate-500 dark:text-slate-400">Don&apos;t have an account yet? </span>
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
