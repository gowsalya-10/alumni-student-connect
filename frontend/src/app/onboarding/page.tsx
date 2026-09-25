'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';

// Step components
import { ProfileStep } from '@/components/onboarding/ProfileStep';
import { CareerGoalStep } from '@/components/onboarding/CareerGoalStep';
import { SkillsStep } from '@/components/onboarding/SkillsStep';
import { MentorshipStep } from '@/components/onboarding/MentorshipStep';
import { ResumeStep } from '@/components/onboarding/ResumeStep';
import { CompleteStep } from '@/components/onboarding/CompleteStep';

export type OnboardingData = {
  department: string;
  year: string;
  college: string;
  preferred_location: string;
  desired_career: string;
  desired_domain: string;
  preferred_industry: string;
  preferred_job_role: string;
  career_goal_text: string;
  skills: string[];
  mentorship_interests: string[];
  preferred_communication: string;
};

const STEPS = [
  'Profile',
  'Career Goal',
  'Skills',
  'Mentorship',
  'Resume',
  'Complete',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [data, setData] = useState<OnboardingData>({
    department: '',
    year: '',
    college: '',
    preferred_location: '',
    desired_career: '',
    desired_domain: '',
    preferred_industry: '',
    preferred_job_role: '',
    career_goal_text: '',
    skills: [],
    mentorship_interests: [],
    preferred_communication: 'email',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          api.get('/api/v1/student/profile'),
          api.get('/api/v1/student/skills')
        ]);
        
        const p = profileRes.data;
        if (p.onboarding_completed) {
          router.push('/dashboard');
          return;
        }
        
        setData({
          department: p.department || '',
          year: p.year ? String(p.year) : '',
          college: p.college || '',
          preferred_location: p.preferred_location || '',
          desired_career: p.desired_career || '',
          desired_domain: p.desired_domain || '',
          preferred_industry: p.preferred_industry || '',
          preferred_job_role: p.preferred_job_role || '',
          career_goal_text: p.career_goal_text || '',
          skills: skillsRes.data || [],
          mentorship_interests: p.mentorship_interests || [],
          preferred_communication: p.preferred_communication || 'email',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    setError('');
    setIsSaving(true);
    try {
      // Save data before moving to next step
      const payload: any = { ...data };
      if (payload.year) {
        payload.year = parseInt(payload.year, 10);
      } else {
        payload.year = null;
      }
      
      // We don't send skills to the profile endpoint
      const { skills, ...profilePayload } = payload;
      
      await api.put('/api/v1/student/profile', profilePayload);
      
      if (currentStep === 2) {
        // We are on skills step, save skills
        await api.put('/api/v1/student/skills', data.skills);
      }
      
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setError('Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <PageContainer className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <ProgressRing value={0} size={48} showValue={false} className="animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium">Loading your profile...</p>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ProfileStep data={data} updateData={updateData} />;
      case 1:
        return <CareerGoalStep data={data} updateData={updateData} />;
      case 2:
        return <SkillsStep data={data} updateData={updateData} />;
      case 3:
        return <MentorshipStep data={data} updateData={updateData} />;
      case 4:
        return <ResumeStep data={data} updateData={updateData} />;
      case 5:
        return <CompleteStep />;
      default:
        return null;
    }
  };

  const progressPct = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.email.split('@')[0]}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Let&apos;s set up your career profile.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <ProgressRing value={progressPct} size={32} strokeWidth={3} showValue={false} />
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Main Card */}
          <Card className="flex-1 overflow-hidden shadow-card border-gray-200/60 dark:border-gray-800">
            {/* Step Indicators */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between overflow-x-auto hide-scrollbar">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isPassed = idx < currentStep;
                return (
                  <div key={step} className="flex items-center min-w-max">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isPassed
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-sm font-medium hidden sm:block ${
                          isActive
                            ? 'text-gray-900 dark:text-white'
                            : isPassed
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="w-8 sm:w-12 h-px bg-gray-200 dark:bg-gray-700 mx-2 sm:mx-4" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Content */}
            <CardContent className="p-6 sm:p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Footer Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {currentStep > 0 && currentStep < STEPS.length - 1 ? (
              <Button variant="ghost" onClick={handleBack} disabled={isSaving}>
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {currentStep < STEPS.length - 1 && (
              <Button onClick={handleNext} isLoading={isSaving} className="ml-auto min-w-[120px]">
                {currentStep === STEPS.length - 2 ? 'Finish' : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
