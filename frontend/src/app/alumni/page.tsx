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
import { Search, MapPin, Briefcase, Filter, Users } from 'lucide-react';
import api from '@/lib/api';
import { AlumniProfile } from '@/types';

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (domainFilter) params.append('domain', domainFilter);
      
      const res = await api.get(`/api/v1/alumni?${params.toString()}`);
      setAlumni(res.data);
    } catch (err) {
      setError('Failed to load alumni directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchAlumni();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, domainFilter]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              Alumni Directory
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Discover and connect with alumni in your desired field.
            </p>
          </div>
        </div>

        <Card className="p-4 border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                placeholder="Search by name, role, company, or skills..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64 flex gap-2">
              <div className="flex-1">
                <Select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                >
                  <option value="">All Domains</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Design">Design</option>
                </Select>
              </div>
              <Button variant="outline" className="px-3 md:hidden">
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-gray-300 dark:border-gray-700">
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No alumni found"
              description="We couldn't find any alumni matching your search criteria. Try adjusting your filters."
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map(person => (
              <Card key={person.user_id} className="p-6 flex flex-col hover:shadow-md transition-shadow border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar src={person.photo_url || undefined} alt={person.name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
                      {person.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium line-clamp-1">
                      {person.current_role || 'Alumni'}
                    </p>
                    {person.company && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {person.company}
                      </p>
                    )}
                  </div>
                </div>

                {person.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-4">
                    <MapPin className="h-4 w-4" />
                    {person.location}
                  </p>
                )}

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Top Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5 h-[52px] overflow-hidden">
                    {person.skills.slice(0, 5).map(skill => (
                      <SkillChip key={skill} name={skill} />
                    ))}
                    {person.skills.length > 5 && (
                      <span className="text-xs text-gray-500 py-1">+{person.skills.length - 5} more</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link href={`/alumni/${person.user_id}`} className="block w-full">
                    <Button variant="outline" className="w-full justify-center">
                      View Profile
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
