'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, Sparkles, Compass, FileText, Award, 
  ArrowRight, ShieldCheck, TrendingUp, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight leading-none text-slate-900 dark:text-white">AlumniConnect</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Mentorship Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#demo-accounts" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Demo Credentials</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-slate-700 dark:text-slate-200">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(0,0,0,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            University-Alumni Mentorship Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Bridge the Gap Between <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
              Classroom & Career
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect with verified alumni at top tech companies. Unlock AI-curated career roadmaps, master in-demand skills, benchmark your resume with ATS scoring, and schedule 1:1 mentorship sessions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30">
                Join as Student <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900">
                Sign In with Demo Account
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">100%</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Verified Alumni Mentors</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100/70 text-violet-700 dark:bg-violet-950 dark:text-violet-300 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">Smart Match</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">AI Skill Alignment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">25+ Skills</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Proficiency Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100/70 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-white">Impact Points</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Gamified Coaching Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              Comprehensive Platform
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything Needed for Seamless University Mentorship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Match AI</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Matches students with alumni mentors based on shared technical skills, target job roles, and mentorship focus areas with match percentage rankings.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-violet-600/30 group-hover:scale-105 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">AI Career Roadmaps</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Step-by-step phased learning milestones from foundational CS through production deployment. Mark milestones as completed to boost career readiness.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-5 shadow-sm shadow-amber-500/30 group-hover:scale-105 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ATS Resume Vault</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Upload resumes and instantly receive ATS health scores, keyword checks, and improvement suggestions. Download primary resumes at any time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-5 shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Alumni Impact Hub</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Alumni log coaching sessions, earn reward points, collect 5-star student ratings, and build institutional legacy through transparent impact scoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Workflow */}
      <section id="workflow" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              Structured Journey
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How AlumniConnect Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20 mb-4">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">Build Profile</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Specify department, year, target industry, technical skills, and mentorship preferences.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-violet-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-violet-600/20 mb-4">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">Discover Mentors</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Browse verified alumni or use Smart Matches to find mentors with up to 98% skill alignment.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-purple-600/20 mb-4">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">1:1 Mentorship</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Request sessions, discuss career strategies, code reviews, and log milestones.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-emerald-600/20 mb-4">
                4
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">Rate & Reward</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Submit 5-star ratings and feedback. Alumni accumulate impact scores and reward points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick-Access Section */}
      <section id="demo-accounts" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 dark:from-slate-900 dark:via-slate-850 dark:to-indigo-950/40 border border-indigo-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
                  Evaluation Ready
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Seeded Demonstration Accounts
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Use these pre-populated fictional accounts to evaluate all student and alumni workflows:
                </p>
              </div>

              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                  Go to Login <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Student Account */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Student Demo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">Active</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Alex Rivera</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 select-all">student@demo.edu</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">Password: DemoPassword123!</p>
              </div>

              {/* Alumni Account */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase">Alumni Mentor Demo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">Verified</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Dr. Elena Rostova</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 select-all">alumni@demo.edu</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">Password: DemoPassword123!</p>
              </div>

              {/* Admin Account */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Administrator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 font-semibold">System</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">System Admin</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 select-all">admin@demo.edu</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">Password: DemoPassword123!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span className="font-bold text-slate-200">AlumniConnect Mentorship Platform</span>
          </div>
          <p>© 2026 AlumniConnect. Engineered for University-Alumni Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
