
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface BasicInfoFieldsProps {
  register: any;
  errors: any;
  isAnonymous?: boolean;
  onAnonymousChange?: (checked: boolean) => void;
}

const BasicInfoFields = ({ register, errors, isAnonymous, onAnonymousChange }: BasicInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            {...register('company')}
            placeholder="e.g., Google, Microsoft"
            className={errors.company ? 'border-destructive' : ''}
          />
          {errors.company && (
            <p className="text-sm text-destructive mt-1">{errors.company.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            {...register('role')}
            placeholder="e.g., Software Engineer"
            className={errors.role ? 'border-destructive' : ''}
          />
          {errors.role && (
            <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Interview Date</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            className={errors.date ? 'border-destructive' : ''}
          />
          {errors.date && (
            <p className="text-sm text-descriptive mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
          <Input
            id="linkedinUrl"
            {...register('linkedinUrl')}
            placeholder="https://linkedin.com/in/yourprofile"
            className={errors.linkedinUrl ? 'border-destructive' : ''}
            disabled={isAnonymous}
          />
          {errors.linkedinUrl && (
            <p className="text-sm text-destructive mt-1">{errors.linkedinUrl.message}</p>
          )}
          {isAnonymous && (
            <p className="text-xs text-muted-foreground mt-1">
              LinkedIn profile is disabled for anonymous posts
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={onAnonymousChange}
        />
        <Label 
          htmlFor="anonymous" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Post anonymously
        </Label>
        <div className="text-xs text-muted-foreground ml-2">
          Your identity will be hidden from other users, but you can still receive ratings and messages
        </div>
      </div>
    </div>
  );
};

export default BasicInfoFields;
