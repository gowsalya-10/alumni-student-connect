import React from 'react';
import { Input } from '@/components/ui/Input';
import { OnboardingData } from '@/app/onboarding/page';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export function ProfileStep({ data, updateData }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tell us about your academic background.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="College / University"
          placeholder="e.g. Stanford University"
          value={data.college}
          onChange={(e) => updateData({ college: e.target.value })}
        />
        <Input
          label="Department / Major"
          placeholder="e.g. Computer Science"
          value={data.department}
          onChange={(e) => updateData({ department: e.target.value })}
        />
        <Input
          label="Graduation Year"
          placeholder="e.g. 2025"
          type="number"
          value={data.year}
          onChange={(e) => updateData({ year: e.target.value })}
        />
        <Input
          label="Preferred Location"
          placeholder="e.g. San Francisco, CA"
          value={data.preferred_location}
          onChange={(e) => updateData({ preferred_location: e.target.value })}
        />
      </div>
    </div>
  );
}
