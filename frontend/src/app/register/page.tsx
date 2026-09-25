'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/feedback/Alert';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/v1/auth/register', {
        name,
        email,
        password,
        role,
      });
      await login(response.data.access_token);
      router.push('/dashboard');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an account
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-soft sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="error" title="Registration Failed">
                {error}
              </Alert>
            )}
            <div className="space-y-4">
              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                required
                placeholder="you@example.com"
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
              <Select
                id="role"
                name="role"
                label="I am a..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
              </Select>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                Register
              </Button>
            </div>
          </form>
          <div className="mt-6 text-sm text-center">
            <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
