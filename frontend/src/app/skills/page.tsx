'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Target, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { CareerRoadmap, StudentProfile } from '@/types';

interface SkillGapData {
  profile: StudentProfile | null;
  roadmap: CareerRoadmap | null;
  currentSkills: string[];
}

export default function SkillGapPage() {
  const [data, setData] = useState<SkillGapData>({ profile: null, roadmap: null, currentSkills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        setLoading(true);
        const [profileRes, skillsRes, roadmapRes] = await Promise.all([
          api.get('/api/v1/student/profile'),
          api.get('/api/v1/student/skills'),
          api.get('/api/v1/roadmap')
        ]);
        
        setData({
          profile: profileRes.data,
          currentSkills: skillsRes.data || [],
          roadmap: roadmapRes.data || null
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load skill gap data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSkillGap();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-1" />
            <Skeleton className="h-64 col-span-2" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8">
          <Alert variant="error" title="Error">{error}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, roadmap, currentSkills } = data;
  const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

  // Extract required skills from roadmap
  const requiredSkills: { name: string; difficulty: string }[] = [];
  if (roadmap) {
    roadmap.phases.forEach(phase => {
      phase.milestones.forEach(m => {
        if (!requiredSkills.find(s => s.name.toLowerCase() === m.skill_name.toLowerCase())) {
          requiredSkills.push({ name: m.skill_name, difficulty: m.difficulty });
        }
      });
    });
  }

  // Calculate gaps
  const matchedSkills = requiredSkills.filter(s => currentSkillsLower.includes(s.name.toLowerCase()));
  const missingSkills = requiredSkills.filter(s => !currentSkillsLower.includes(s.name.toLowerCase()));
  
  // Non-roadmap skills that student has
  const extraSkills = currentSkills.filter(
    s => !requiredSkills.find(rs => rs.name.toLowerCase() === s.toLowerCase())
  );

  const matchPercentage = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            Skill Gap Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Compare your current skills with your target career requirements.
          </p>
        </div>

        {!roadmap ? (
          <Alert variant="warning" title="No Roadmap Found">
            You need to generate a Career Roadmap first to see your skill gaps. Go to the Career Navigator to get started.
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Overview Card */}
            <Card className="col-span-1 border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center text-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Target Role
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-8">
                {profile?.desired_career || roadmap.career_goal}
              </p>
              
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Overall Match</h4>
              <ProgressRing 
                value={matchPercentage} 
                size={160} 
                strokeWidth={12} 
              />
              
              <div className="mt-8 w-full grid grid-cols-2 gap-4 text-left">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentSkills.length}</div>
                  <div className="text-xs text-gray-500">Current Skills</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{missingSkills.length}</div>
                  <div className="text-xs text-gray-500">Skills to Learn</div>
                </div>
              </div>
            </Card>

            {/* Detailed Analysis Card */}
            <Card className="col-span-1 lg:col-span-2 border-gray-200 dark:border-gray-800 p-0 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Skills Breakdown</h3>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {requiredSkills.length > 0 ? requiredSkills.map(skill => {
                  const hasSkill = currentSkillsLower.includes(skill.name.toLowerCase());
                  return (
                    <div key={skill.name} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{skill.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Level: {skill.difficulty}</div>
                      </div>
                      <div className="flex items-center">
                        {hasSkill ? (
                          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acquired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full text-xs font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Missing
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-8 text-center text-gray-500">No required skills identified.</div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Additional Skills */}
        {extraSkills.length > 0 && (
          <Card className="p-6 border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Other Verified Skills</h3>
            <div className="flex flex-wrap gap-2">
              {extraSkills.map(skill => (
                <span key={skill} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
