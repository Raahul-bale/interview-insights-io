
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import BasicInfoFields from './forms/BasicInfoFields';
import InterviewRoundCard from './forms/InterviewRoundCard';

const roundSchema = z.object({
  type: z.string().min(1, 'Round type is required'),
  questions: z.array(z.string().min(1, 'Question cannot be empty')),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  experience: z.string().min(10, 'Please provide at least 10 characters for your experience'),
  answers: z.array(z.string().optional()),
});

const formSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  date: z.string().min(1, 'Interview date is required'),
  linkedinUrl: z.string()
    .min(1, 'LinkedIn profile URL is required')
    .url('Please enter a valid LinkedIn URL')
    .refine((url) => url.includes('linkedin.com'), 'Must be a valid LinkedIn URL'),
  rounds: z.array(roundSchema).min(1, 'At least one interview round is required'),
});

type FormData = z.infer<typeof formSchema>;

const SubmitExperienceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLinkedInUrl, setExistingLinkedInUrl] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: '',
      role: '',
      date: '',
      linkedinUrl: '',
      rounds: [
        {
          type: '',
          questions: [''],
          difficulty: 'Medium' as const,
          experience: '',
          answers: [''],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rounds',
  });

  // Fetch existing LinkedIn URL from profile
  useEffect(() => {
    const fetchLinkedInProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('linkedin_url')
          .eq('user_id', user.id)
          .single();
        
        if (data?.linkedin_url) {
          setExistingLinkedInUrl(data.linkedin_url);
          setValue('linkedinUrl', data.linkedin_url);
        }
      } catch (error) {
        console.error('Error fetching LinkedIn profile:', error);
      }
    };

    fetchLinkedInProfile();
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit an experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First, update the user's LinkedIn profile if it's different
      if (data.linkedinUrl !== existingLinkedInUrl) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            linkedin_url: data.linkedinUrl,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error updating LinkedIn profile:', profileError);
          // Don't fail the submission for profile update errors
        }
      }

      // Clean up the rounds data
      const cleanedRounds = data.rounds.map(round => ({
        ...round,
        questions: round.questions.filter(q => q.trim() !== ''),
        answers: round.answers?.filter(a => a && a.trim() !== '') || []
      }));

      // Create full text for search
      const fullText = `${data.company} ${data.role} ${cleanedRounds.map(round => 
        `${round.type} ${round.questions.join(' ')} ${round.experience} ${round.answers?.join(' ') || ''}`
      ).join(' ')}`;

      const { error } = await supabase
        .from('interview_posts')
        .insert({
          company: data.company,
          role: data.role,
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
          user_id: user.id,
          date: data.date,
          rounds: cleanedRounds,
          full_text: fullText,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your interview experience has been submitted successfully.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error submitting experience:', error);
      toast({
        title: "Error",
        description: "Failed to submit your experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Share Your Interview Experience</CardTitle>
          <p className="text-muted-foreground">
            Help others by sharing your interview experience. Your insights can make a difference!
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoFields register={register} errors={errors} />

            {/* Interview Rounds */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Interview Rounds *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      type: '',
                      questions: [''],
                      difficulty: 'Medium',
                      experience: '',
                      answers: [''],
                    })
                  }
                  className="mobile-touch-target"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Round
                </Button>
              </div>

              {fields.map((field, roundIndex) => (
                <InterviewRoundCard
                  key={field.id}
                  roundIndex={roundIndex}
                  onRemove={() => remove(roundIndex)}
                  canRemove={fields.length > 1}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full mobile-touch-target h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Experience'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitExperienceForm;
