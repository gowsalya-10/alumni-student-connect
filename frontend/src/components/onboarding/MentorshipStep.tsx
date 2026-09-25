import React, { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { OnboardingData } from '@/app/onboarding/page';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const COMMON_INTERESTS = [
  'Resume Review',
  'Mock Interviews',
  'Career Advice',
  'Technical Guidance',
  'Networking',
  'Industry Insights',
  'Startup/Entrepreneurship'
];

export function MentorshipStep({ data, updateData }: Props) {
  const toggleInterest = (interest: string) => {
    if (data.mentorship_interests.includes(interest)) {
      updateData({
        mentorship_interests: data.mentorship_interests.filter(i => i !== interest)
      });
    } else {
      updateData({
        mentorship_interests: [...data.mentorship_interests, interest]
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Mentorship Preferences</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          How can alumni help you succeed?
        </p>
      </div>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          What are you looking for? (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-3">
          {COMMON_INTERESTS.map(interest => {
            const isSelected = data.mentorship_interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <Select
          label="Preferred Communication Method"
          value={data.preferred_communication}
          onChange={(e) => updateData({ preferred_communication: e.target.value })}
        >
          <option value="email">Email</option>
          <option value="chat">In-App Chat</option>
          <option value="video_call">Video Call (Zoom/Meet)</option>
          <option value="phone">Phone</option>
        </Select>
      </div>
    </div>
  );
}
