'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkillChip } from '@/components/ui/SkillChip';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { MapPin, Briefcase, GraduationCap, Mail, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import api from '@/lib/api';
import { AlumniProfile } from '@/types';

export default function AlumniProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/v1/alumni/${params.id}`);
        setProfile(res.data);
      } catch (err) {
        setError('Failed to load alumni profile.');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-6 w-24 mb-6" />
          <Card className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="h-32 w-32 rounded-full shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </Card>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
          </Button>
          <Alert variant="error" title="Error">{error || 'Profile not found'}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
        </Button>

        <Card className="p-6 md:p-8 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden relative">
          {/* Header decorative bg */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-900/40 dark:to-indigo-900/40" />
          
          <div className="relative pt-12 flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="shrink-0 flex flex-col items-center md:items-start">
              <div className="rounded-full p-1 bg-white dark:bg-gray-900 shadow-sm mb-4">
                <Avatar src={profile.photo_url || undefined} alt={profile.name} size="xl" className="h-32 w-32 text-4xl" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                    {profile.is_verified && (
                      <span className="ml-2 inline-flex items-center text-xs font-medium text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 align-middle dark:bg-blue-900/50 dark:text-blue-400">
                        Verified Alumni
                      </span>
                    )}
                  </h1>
                  <p className="text-xl text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {profile.current_role} {profile.company ? `at ${profile.company}` : ''}
                  </p>
                </div>
                
                <div className="shrink-0">
                  {/* Future mentorship feature button */}
                  <Button className="gap-2 w-full md:w-auto shadow-sm hover:shadow-md transition-shadow">
                    <MessageSquarePlus className="h-4 w-4" />
                    Request Mentorship
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-600 dark:text-gray-300 justify-center md:justify-start">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {profile.location}
                  </div>
                )}
                {profile.industry && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    {profile.industry}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Contact info available upon connection
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {profile.bio && (
              <Card className="p-6 border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {profile.bio}
                </div>
              </Card>
            )}

            {profile.experience && (
              <Card className="p-6 border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  Experience
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {profile.experience}
                </div>
              </Card>
            )}
            
            {profile.education && (
              <Card className="p-6 border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  Education
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {profile.education}
                </div>
              </Card>
            )}
            
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Skills</h2>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <SkillChip key={skill} name={skill} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills listed.</p>
              )}
            </Card>

            <Card className="p-6 border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mentorship Interests</h2>
              {profile.mentorship_interests.length > 0 ? (
                <ul className="space-y-2">
                  {profile.mentorship_interests.map((interest, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      {interest}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Open to connecting.</p>
              )}
            </Card>
            
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
