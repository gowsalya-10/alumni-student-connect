import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SkillChip } from '@/components/ui/SkillChip';
import { EmptyState } from '@/components/feedback/EmptyState';
import { OnboardingData } from '@/app/onboarding/page';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export function SkillsStep({ data, updateData }: Props) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    
    const newSkill = skillInput.trim();
    if (!data.skills.includes(newSkill)) {
      updateData({ skills: [...data.skills, newSkill] });
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    updateData({
      skills: data.skills.filter(s => s !== skillToRemove)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Skills</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Add skills you currently possess or are learning.
        </p>
      </div>
      
      <form onSubmit={addSkill} className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Add a Skill"
            placeholder="e.g. Python, Public Speaking"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">Add</Button>
      </form>

      <div className="pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Selected Skills ({data.skills.length})
        </h4>
        
        {data.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <SkillChip
                key={skill}
                name={skill}
                onRemove={() => removeSkill(skill)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No skills added yet"
            description="Add some skills above to help mentors and alumni find you."
            className="py-6"
          />
        )}
      </div>
    </div>
  );
}
