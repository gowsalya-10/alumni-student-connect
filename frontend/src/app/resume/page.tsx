'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FileText, Upload, Star, Trash2, Check, AlertTriangle, Download } from 'lucide-react';
import api from '@/lib/api';

interface ResumeVersion {
  id: string;
  file_url: string;
  version_name: string;
  health_score: number | null;
  is_primary: boolean;
}

interface ResumeHealthCheck {
  score: number;
  checks: { name: string; status: 'pass' | 'warning' | 'fail' }[];
}

interface VaultData {
  primary_resume: ResumeVersion | null;
  versions: ResumeVersion[];
  health: ResumeHealthCheck | null;
}

export default function ResumeVaultPage() {
  const [data, setData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVault = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/resumes');
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load resume vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert("Only PDF resumes are supported.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await api.post('/api/v1/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchVault();
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload resume. ' + (err.response?.data?.detail || ''));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.put(`/api/v1/resumes/${id}/primary`);
      await fetchVault();
    } catch (err) {
      alert('Failed to set primary resume.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/api/v1/resumes/${id}`);
      await fetchVault();
    } catch (err) {
      alert('Failed to delete resume.');
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-2" />
            <Skeleton className="h-64 col-span-1" />
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

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              Resume Vault
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage your resumes and check their AI-powered health score.
            </p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2 shrink-0">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload New Resume'}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
          />
        </div>

        {!data?.versions.length ? (
          <Card className="p-12 text-center border-dashed border-gray-300 dark:border-gray-700">
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No resumes uploaded"
              description="Upload your first resume in PDF format to get started and receive a health score."
              action={
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  Upload Resume
                </Button>
              }
              className="border-none bg-transparent"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Vault Area */}
            <div className="lg:col-span-2 space-y-6">
              
              {data.primary_resume && (
                <Card className="p-6 border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      Primary Resume
                    </h2>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 gap-4">
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-gray-900 dark:text-white truncate" title={data.primary_resume.version_name}>
                          {data.primary_resume.version_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Health Score: {data.primary_resume.health_score}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={`${apiUrl}${data.primary_resume.file_url}`} target="_blank" rel="noreferrer" download>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" /> Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6 border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Version History</h3>
                <div className="space-y-3">
                  {data.versions.map(version => (
                    <div key={version.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
                            {version.version_name}
                            {version.is_primary && (
                              <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-1.5 py-0.5 rounded">Primary</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {!version.is_primary && (
                          <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(version.id)}>
                            Set Primary
                          </Button>
                        )}
                        <a href={`${apiUrl}${version.file_url}`} target="_blank" rel="noreferrer" download>
                          <Button variant="ghost" size="sm" className="px-2">
                            <Download className="h-4 w-4 text-gray-500" />
                          </Button>
                        </a>
                        <Button variant="ghost" size="sm" className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(version.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Health Score Area */}
            <div className="lg:col-span-1">
              {data.health ? (
                <Card className="p-6 border-gray-200 dark:border-gray-800 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Resume Health</h3>
                  
                  <div className="flex flex-col items-center justify-center mb-8">
                    <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-gray-100 dark:border-gray-800">
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
                        <circle 
                          cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" 
                          className={data.health.score >= 80 ? 'text-green-500' : data.health.score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                          strokeDasharray="289" strokeDashoffset={289 - (289 * data.health.score) / 100}
                          strokeLinecap="round" transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.health.score}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.health.checks.map((check, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        {check.status === 'pass' ? (
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                        ) : check.status === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300 pt-0.5">{check.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 border-gray-200 dark:border-gray-800 h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <Star className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-4" />
                  <p>Set a primary resume to see its health score analysis.</p>
                </Card>
              )}
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
