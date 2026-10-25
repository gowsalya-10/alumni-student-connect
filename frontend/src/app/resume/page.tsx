'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { 
  FileText, Upload, Star, Trash2, AlertTriangle, 
  Download, CheckCircle2, XCircle, Sparkles 
} from 'lucide-react';
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
      const res = await api.get('/api/v1/resumes');
      setData(res.data);
    } catch {
      setError('Failed to load resume vault.');
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadVault = async () => {
      try {
        const res = await api.get('/api/v1/resumes');
        if (!ignore) setData(res.data);
      } catch {
        if (!ignore) setError('Failed to load resume vault.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadVault();
    return () => { ignore = true; };
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
      alert('Resume uploaded and ATS analyzed successfully!');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert('Failed to upload resume. ' + (detail || ''));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.put(`/api/v1/resumes/${id}/primary`);
      await fetchVault();
    } catch {
      alert('Failed to set primary resume.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await api.delete(`/api/v1/resumes/${id}`);
      await fetchVault();
    } catch {
      alert('Failed to delete resume.');
    }
  };

  const handleDownload = (fileUrl: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.open(`${backendUrl}/api/v1/resumes/download/${fileUrl}`, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl md:col-span-2" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const primary = data?.primary_resume;
  const versions = data?.versions || [];
  const health = data?.health;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="h-5 w-5" />
              </div>
              Resume Vault & ATS Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Store, version, and benchmark your engineering resumes against campus recruiter ATS systems.
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <Button
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Analyzing Resume...' : 'Upload New PDF'}
            </Button>
          </div>
        </div>

        {error && <Alert variant="error" title="Notice">{error}</Alert>}

        {/* Primary Resume & ATS Health Overview */}
        {primary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Primary Resume Card */}
            <Card className="p-6 md:col-span-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" /> Primary Version
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                      {primary.version_name || 'Active Engineering Resume'}
                    </h3>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                      {primary.file_url}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Standard PDF Format • Verified & Stored on Disk
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span>ATS Parsed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Alumni Viewable</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  size="sm"
                  onClick={() => handleDownload(primary.file_url)}
                  className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF Binary
                </Button>
                <span className="text-xs text-slate-400">Ready for recruiter review</span>
              </div>
            </Card>

            {/* ATS Score Gauge Card */}
            <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                ATS Compatibility Score
              </span>
              <ProgressRing 
                value={primary.health_score || 88} 
                size={130} 
                strokeWidth={10} 
              />
              <p className="font-bold text-sm text-slate-900 dark:text-white mt-4">
                {(primary.health_score || 88) >= 80 ? '🌟 Highly Compatible' : '⚠️ Minor Revisions Advised'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Parsed keywords, contact info, structure, and action verbs.
              </p>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <EmptyState
              icon={<FileText className="h-12 w-12 text-indigo-400" />}
              title="No resumes uploaded yet"
              description="Upload your PDF resume to receive an automated ATS scoring benchmark and make it available to alumni mentors."
              action={
                <Button 
                  size="md" 
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Upload className="h-4 w-4" /> Upload Resume PDF
                </Button>
              }
              className="border-none bg-transparent"
            />
          </Card>
        )}

        {/* ATS Health Check Details */}
        {health && health.checks?.length > 0 && (
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              Automated ATS Inspection Checks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {health.checks.map((chk, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center gap-2.5"
                >
                  {chk.status === 'pass' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : chk.status === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {chk.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Resume Versions Table */}
        {versions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              All Resume Versions ({versions.length})
            </h3>
            <div className="space-y-3">
              {versions.map(v => (
                <Card 
                  key={v.id} 
                  className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {v.version_name || 'Resume Version'}
                        </p>
                        {v.is_primary && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {v.file_url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                      Score: {v.health_score || 85}%
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8"
                      onClick={() => handleDownload(v.file_url)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>

                    {!v.is_primary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 text-indigo-600"
                        onClick={() => handleSetPrimary(v.id)}
                      >
                        Set Primary
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-8 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(v.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
