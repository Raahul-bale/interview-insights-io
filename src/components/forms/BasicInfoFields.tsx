
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Linkedin, AlertCircle } from 'lucide-react';

type FormData = {
  company: string;
  role: string;
  date: string;
  linkedinUrl: string;
  rounds: any[];
};

interface BasicInfoFieldsProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ register, errors }) => {
  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company Name *</Label>
          <Input
            id="company"
            {...register('company')}
            placeholder="e.g., Google, Microsoft, Amazon"
            className="mobile-touch-target"
          />
          {errors.company && (
            <p className="text-sm text-red-500">{errors.company.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            {...register('role')}
            placeholder="e.g., Software Engineer, Product Manager"
            className="mobile-touch-target"
          />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Interview Date *</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            className="mobile-touch-target"
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-[#0077B5]" />
            LinkedIn Profile URL *
          </Label>
          <Input
            id="linkedinUrl"
            {...register('linkedinUrl')}
            placeholder="https://www.linkedin.com/in/yourprofile"
            className="mobile-touch-target"
          />
          {errors.linkedinUrl && (
            <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
          )}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              LinkedIn profile is required to help others connect with you and verify authenticity.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </>
  );
};

export default BasicInfoFields;
