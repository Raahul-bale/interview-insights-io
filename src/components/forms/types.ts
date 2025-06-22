
import { z } from 'zod';

const roundSchema = z.object({
  type: z.string().min(1, 'Round type is required'),
  questions: z.array(z.string().min(1, 'Question cannot be empty')),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  experience: z.string().min(10, 'Please provide at least 10 characters for your experience'),
  answers: z.array(z.string().optional()),
});

export const formSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  date: z.string().min(1, 'Interview date is required'),
  linkedinUrl: z.string()
    .min(1, 'LinkedIn profile URL is required')
    .url('Please enter a valid LinkedIn URL')
    .refine((url) => url.includes('linkedin.com'), 'Must be a valid LinkedIn URL'),
  rounds: z.array(roundSchema).min(1, 'At least one interview round is required'),
});

export type FormData = z.infer<typeof formSchema>;
