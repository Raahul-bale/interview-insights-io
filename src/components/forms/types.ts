
import { z } from 'zod';

const roundSchema = z.object({
  type: z.string().min(1, 'Round type is required'),
  questions: z.array(z.string()).min(1, 'At least one question is required'),
  answers: z.array(z.string()).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  experience: z.string().min(10, 'Please provide detailed experience (minimum 10 characters)'),
});

export const formSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  date: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  rounds: z.array(roundSchema).min(1, 'At least one interview round is required'),
  isAnonymous: z.boolean().optional(),
});

export type FormData = z.infer<typeof formSchema>;
export type Round = z.infer<typeof roundSchema>;
