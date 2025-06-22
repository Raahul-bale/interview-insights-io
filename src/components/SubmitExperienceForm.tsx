
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Linkedin, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const addQuestion = (roundIndex: number) => {
    const currentRound = watch(`rounds.${roundIndex}`);
    setValue(`rounds.${roundIndex}.questions`, [...currentRound.questions, '']);
    setValue(`rounds.${roundIndex}.answers`, [...(currentRound.answers || []), '']);
  };

  const removeQuestion = (roundIndex: number, questionIndex: number) => {
    const currentRound = watch(`rounds.${roundIndex}`);
    const newQuestions = currentRound.questions.filter((_, index) => index !== questionIndex);
    const newAnswers = (currentRound.answers || []).filter((_, index) => index !== questionIndex);
    setValue(`rounds.${roundIndex}.questions`, newQuestions);
    setValue(`rounds.${roundIndex}.answers`, newAnswers);
  };

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
                <Card key={field.id} className="border-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Round {roundIndex + 1}</CardTitle>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(roundIndex)}
                          className="mobile-touch-target"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Round Type *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(`rounds.${roundIndex}.type`, value)
                          }
                        >
                          <SelectTrigger className="mobile-touch-target">
                            <SelectValue placeholder="Select round type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                            <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                            <SelectItem value="System Design">System Design</SelectItem>
                            <SelectItem value="Behavioral Interview">Behavioral Interview</SelectItem>
                            <SelectItem value="Coding Challenge">Coding Challenge</SelectItem>
                            <SelectItem value="Case Study">Case Study</SelectItem>
                            <SelectItem value="Final Interview">Final Interview</SelectItem>
                            <SelectItem value="HR Interview">HR Interview</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.rounds?.[roundIndex]?.type && (
                          <p className="text-sm text-red-500">
                            {String(errors.rounds[roundIndex]?.type?.message)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Difficulty *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(`rounds.${roundIndex}.difficulty`, value as 'Easy' | 'Medium' | 'Hard')
                          }
                          defaultValue="Medium"
                        >
                          <SelectTrigger className="mobile-touch-target">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Questions and Answers */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Questions & Answers</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(roundIndex)}
                          className="mobile-touch-target"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </div>

                      {watch(`rounds.${roundIndex}.questions`).map((_, questionIndex) => (
                        <div key={questionIndex} className="space-y-2 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              Question {questionIndex + 1}
                            </Label>
                            {watch(`rounds.${roundIndex}.questions`).length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(roundIndex, questionIndex)}
                                className="mobile-touch-target"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Textarea
                            {...register(`rounds.${roundIndex}.questions.${questionIndex}`)}
                            placeholder="Enter the interview question..."
                            className="mobile-touch-target"
                          />
                          <Textarea
                            {...register(`rounds.${roundIndex}.answers.${questionIndex}`)}
                            placeholder="Your answer (optional)..."
                            className="mobile-touch-target"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Overall Experience */}
                    <div className="space-y-2">
                      <Label>Overall Experience for this Round *</Label>
                      <Textarea
                        {...register(`rounds.${roundIndex}.experience`)}
                        placeholder="Describe your overall experience for this round..."
                        className="min-h-[120px] mobile-touch-target"
                      />
                      {errors.rounds?.[roundIndex]?.experience && (
                        <p className="text-sm text-red-500">
                          {String(errors.rounds[roundIndex]?.experience?.message)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
