import React, { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

export function ResumeStep({ data, updateData }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Resume</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Add your resume to get better matches and feedback.
        </p>
      </div>
      
      <div className="mt-8">
        {!selectedFile ? (
          <div className="flex justify-center rounded-xl border border-dashed border-gray-300 px-6 py-12 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-500 mt-1">PDF, DOC up to 5MB</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 p-6 flex items-start gap-4 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedFile.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="mt-3 flex items-center text-sm font-medium text-green-600 dark:text-green-500">
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Ready to upload
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
              Remove
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-col items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
          Resume parsing and storage will be fully enabled soon. You can upload a file now to keep it ready, or just skip this step.
        </p>
      </div>
    </div>
  );
}
