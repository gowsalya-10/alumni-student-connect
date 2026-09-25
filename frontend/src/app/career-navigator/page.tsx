'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Timeline } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Compass, Zap, Target, BookOpen, BrainCircuit, RefreshCw, Clock } from 'lucide-react';
import api from '@/lib/api';
import { CareerRoadmap, RoadmapPhase, RoadmapMilestone } from '@/types';

export default function CareerNavigatorPage() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/v1/roadmap');
      setRoadmap(res.data); // will be null if no roadmap exists
    } catch (err: any) {
      console.error(err);
      setError('Failed to load your career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      // Empty body since the backend will use the student's profile data
      const res = await api.post('/api/v1/roadmap/generate', {});
      setRoadmap(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate career roadmap. Please try again later.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-1/3 mb-8" />
          <Card className="p-6">
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              AI Career Navigator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
              Your personalized, AI-generated learning path tailored to your goals.
            </p>
          </div>
          
          {roadmap && (
            <Button 
              variant="outline" 
              onClick={handleGenerate} 
              disabled={generating}
              className="gap-2 shrink-0"
            >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {generating ? 'Regenerating...' : 'Regenerate Roadmap'}
            </Button>
          )}
        </div>

        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {!roadmap && !loading && !error && (
          <Card className="p-12 text-center border-dashed">
            <EmptyState
              icon={<Compass className="h-12 w-12" />}
              title="No Career Roadmap found"
              description="Ready to plan your future? Generate an AI-powered step-by-step roadmap tailored to your desired career and industry."
              action={
                <Button 
                  size="lg" 
                  onClick={handleGenerate} 
                  disabled={generating}
                  className="gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Generate My Career Roadmap
                    </>
                  )}
                </Button>
              }
              className="border-none bg-transparent"
            />
          </Card>
        )}

        {roadmap && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 col-span-1 md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900/50">
                <div className="flex flex-col h-full">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" /> Goal
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {roadmap.career_goal}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-auto">
                    Domain: <span className="font-medium text-gray-900 dark:text-gray-300">{roadmap.recommended_domain}</span>
                  </p>
                </div>
              </Card>

              <Card className="p-6 col-span-1 md:col-span-2">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {roadmap.explanation}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  Estimated Focus: <span className="font-medium text-gray-900 dark:text-gray-300">{roadmap.estimated_focus}</span>
                </div>
              </Card>
            </div>

            <div className="space-y-12 mt-12">
              {roadmap.phases.map((phase: RoadmapPhase, pIndex: number) => (
                <div key={phase.id} className="relative">
                  <SectionHeader 
                    title={`Phase ${pIndex + 1}: ${phase.phase_name}`} 
                    className="mb-6"
                  />
                  <Card className="p-6">
                    <Timeline items={phase.milestones.map((m: RoadmapMilestone) => ({
                      id: m.id,
                      title: m.skill_name,
                      description: `Difficulty: ${m.difficulty} | Estimated time: ${m.estimated_time}\n${m.description}`,
                      status: m.is_completed ? 'completed' : 'upcoming'
                    }))} />
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
