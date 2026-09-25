import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { OnboardingData } from '@/app/onboarding/page';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export function CareerGoalStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Career Goals</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Where do you see yourself heading?
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Desired Career"
            placeholder="e.g. Software Engineer"
            value={data.desired_career}
            onChange={(e) => updateData({ desired_career: e.target.value })}
          />
          <Input
            label="Preferred Industry"
            placeholder="e.g. Technology, Finance"
            value={data.preferred_industry}
            onChange={(e) => updateData({ preferred_industry: e.target.value })}
          />
        </div>
        
        <Textarea
          label="Career Goal Statement"
          placeholder="Describe what you want to achieve in your career..."
          rows={4}
          value={data.career_goal_text}
          onChange={(e) => updateData({ career_goal_text: e.target.value })}
          helperText="This helps mentors understand your long-term vision."
        />
      </div>
    </div>
  );
}
