'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { SkillChip } from '@/components/ui/SkillChip';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { 
  Search, MapPin, Briefcase, Users, Sparkles, 
  CheckCircle2, ArrowRight 
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AlumniProfile, AlumniMatch } from '@/types';

export default function AlumniDirectoryPage() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<(AlumniProfile | AlumniMatch)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [showMatching, setShowMatching] = useState(false);

  const fetchAlumni = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      if (showMatching && user?.role === 'student') {
        const res = await api.get('/api/v1/alumni/matching');
        setAlumni(res.data);
      } else {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (domainFilter) params.append('domain', domainFilter);
        
        const res = await api.get(`/api/v1/alumni?${params.toString()}`);
        setAlumni(res.data);
      }
    } catch {
      setError('Failed to load alumni directory.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, domainFilter, showMatching, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlumni();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAlumni]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
        
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              Alumni Mentorship Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect with verified alumni leaders in your target engineering field.
            </p>
          </div>

          {user?.role === 'student' && (
            <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-200/70 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-300/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowMatching(false)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !showMatching
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Mentors
              </button>
              <button
                type="button"
                onClick={() => setShowMatching(true)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  showMatching
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Smart Matches
              </button>
            </div>
          )}
        </div>

        {/* Search & Domain Filter Bar */}
        <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search by mentor name, current role, company, or skills..." 
                className="pl-10 text-xs py-2.5 rounded-xl border-slate-200 dark:border-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="text-xs py-2.5 rounded-xl border-slate-200 dark:border-slate-700"
              >
                <option value="">All Technical Domains</option>
                <option value="Web Development">Web Development</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Product Design">Product Design</option>
              </Select>
            </div>
          </div>
        </Card>

        {error && <Alert variant="error" title="Notice">{error}</Alert>}

        {/* Alumni Mentor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <EmptyState
              icon={<Users className="h-12 w-12 text-indigo-400" />}
              title="No alumni mentors found"
              description="Try adjusting your search keywords or domain filters to explore more mentors."
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map(person => (
              <Card 
                key={person.user_id} 
                className="p-6 flex flex-col justify-between border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar src={person.photo_url || undefined} alt={person.name} size="lg" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                          {person.name}
                          {person.is_verified && (
                            <span title="Verified Alumni Mentor" className="inline-flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            </span>
                          )}
                        </h3>
                        {'match_pct' in person && (
                          <span className="shrink-0 text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800">
                            <Sparkles className="h-3 w-3" /> {(person as AlumniMatch).match_pct}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1 mt-0.5">
                        {person.current_role || 'Alumni Mentor'}
                      </p>

                      {person.company && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 line-clamp-1">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          {person.company}
                        </p>
                      )}
                    </div>
                  </div>

                  {'match_pct' in person && (person as AlumniMatch).matching_reasons?.length > 0 && (
                    <div className="mb-3.5 p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">Match Reason: </span>
                      {(person as AlumniMatch).matching_reasons[0]}
                    </div>
                  )}

                  {person.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                      {person.bio}
                    </p>
                  )}

                  {person.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {person.location}
                    </p>
                  )}

                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Core Expertise
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                      {person.skills.slice(0, 5).map(skill => (
                        <SkillChip key={skill} name={skill} className="text-xs py-0.5 px-2 bg-slate-100 dark:bg-slate-800" />
                      ))}
                      {person.skills.length > 5 && (
                        <span className="text-[11px] text-slate-500 py-0.5 px-1.5">+{person.skills.length - 5}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/alumni/${person.user_id}`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center text-xs font-semibold group-hover:border-indigo-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      View Profile & Connect <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
