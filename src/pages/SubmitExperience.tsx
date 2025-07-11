import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppFeedbackForm from "@/components/AppFeedbackForm";
import AboutUs from "@/components/AboutUs";

interface Round {
  type: string;
  questions: string;
  answers: string;
  experience: string;
  difficulty: string;
}

const SubmitExperience = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { id: experienceId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const isEditing = Boolean(experienceId);
  
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    date: "",
    outcome: "",
    linkedinUrl: ""
  });
  
  const [rounds, setRounds] = useState<Round[]>([
    { type: "", questions: "", answers: "", experience: "", difficulty: "" }
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Load user profile to auto-populate name and LinkedIn URL
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, linkedin_url')
          .eq('user_id', user.id)
          .single();

        if (profile?.full_name) {
          setFormData(prev => ({ 
            ...prev, 
            name: profile.full_name,
            linkedinUrl: profile.linkedin_url || ""
          }));
        }

        // If editing, load experience data
        if (isEditing && experienceId) {
          const { data: experience, error } = await supabase
            .from('interview_posts')
            .select('*')
            .eq('id', experienceId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            toast({
              title: "Error",
              description: "Experience not found or you don't have permission to edit it.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }

          if (experience) {
            setFormData({
              name: experience.user_name,
              company: experience.company,
              role: experience.role,
              date: experience.date,
              outcome: "",
              linkedinUrl: profile?.linkedin_url || ""
            });

            // Transform database rounds format to component format
            const roundsArray = Array.isArray(experience.rounds) ? experience.rounds : [];
            const transformedRounds = roundsArray.map((round: any) => ({
              type: round.type,
              questions: Array.isArray(round.questions) ? round.questions.join('\n') : round.questions,
              answers: Array.isArray(round.answers) ? round.answers.join('\n') : round.answers,
              experience: round.experience || "", // This field wasn't stored separately before
              difficulty: round.difficulty || 'medium'
            }));

            setRounds(transformedRounds);
            setIsAnonymous(experience.is_anonymous || false);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, isEditing, experienceId, navigate, toast]);

  const addRound = () => {
    setRounds([...rounds, { type: "", questions: "", answers: "", experience: "", difficulty: "" }]);
  };

  const removeRound = (index: number) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter((_, i) => i !== index));
    }
  };

  const updateRound = (index: number, field: keyof Round, value: string) => {
    const updatedRounds = rounds.map((round, i) => 
      i === index ? { ...round, [field]: value } : round
    );
    setRounds(updatedRounds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to share your experience.",
        variant: "destructive"
      });
      return;
    }
    
    // Basic validation
    if (!formData.name || !formData.company || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate rounds - at least one round must have all required fields
    const validRounds = rounds.filter(r => r.type && r.questions.trim() && r.answers.trim() && r.experience.trim());
    if (validRounds.length === 0) {
      toast({
        title: "Incomplete Round Information",
        description: "Please fill in at least one complete round with questions, answers, and overall experience.",
        variant: "destructive"
      });
      return;
    }

    // Check monthly submission limit (only for new submissions, not edits)
    if (!isEditing) {
      const { data: canSubmit, error: limitError } = await supabase.rpc('check_monthly_submission_limit', {
        user_uuid: user.id
      });

      if (limitError) {
        console.error('Error checking submission limit:', limitError);
        toast({
          title: "Error",
          description: "There was an error checking your submission limit.",
          variant: "destructive"
        });
        return;
      }

      if (!canSubmit) {
        toast({
          title: "Monthly Limit Reached",
          description: "You can only submit one experience per month. Please wait until next month to submit another experience.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Determine display name based on anonymity
      const displayName = isAnonymous ? 'Anonymous User' : formData.name;
      
      // Create full text for search/embedding
      const fullText = `${formData.company} ${formData.role} interview experience by ${displayName}. ${validRounds.map(r => `${r.type} round: Questions: ${r.questions} Answers: ${r.answers} Experience: ${r.experience}`).join(' ')}`;
      
      // Prepare rounds data - use only valid rounds
      const roundsData = validRounds.map(r => ({
        type: r.type,
        questions: [r.questions], // Store as array to match interface
        answers: [r.answers], // Store answers as array too
        difficulty: r.difficulty || 'medium'
      }));

      if (isEditing && experienceId) {
        // Update existing experience
        const { error } = await supabase
          .from('interview_posts')
          .update({
            user_name: displayName,
            company: formData.company,
            role: formData.role,
            date: formData.date || new Date().toISOString().split('T')[0],
            rounds: roundsData,
            full_text: fullText,
            is_anonymous: isAnonymous
          })
          .eq('id', experienceId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Experience Updated!",
          description: `Your interview experience has been updated successfully ${isAnonymous ? 'as anonymous' : ''}.`,
        });

        navigate('/');
      } else {
        // Update LinkedIn profile if not anonymous and different
        if (!isAnonymous && formData.linkedinUrl) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              linkedin_url: formData.linkedinUrl,
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('Error updating LinkedIn profile:', profileError);
          }
        }

        // Create new experience
        const { error } = await supabase
          .from('interview_posts')
          .insert({
            user_id: user.id,
            user_name: displayName,
            company: formData.company,
            role: formData.role,
            date: formData.date || new Date().toISOString().split('T')[0],
            rounds: roundsData,
            full_text: fullText,
            is_anonymous: isAnonymous
          });

        if (error) throw error;

        toast({
          title: "Experience Shared!",
          description: `Thank you for sharing your interview experience ${isAnonymous ? 'anonymously' : ''}. It will help other students prepare better!`,
        });

        // Show feedback form after successful submission
        setShowFeedbackForm(true);

        // Reset form
        setFormData({ name: "", company: "", role: "", date: "", outcome: "", linkedinUrl: "" });
        setRounds([{ type: "", questions: "", answers: "", experience: "", difficulty: "" }]);
        setIsAnonymous(false);
      }
      
    } catch (error) {
      console.error('Error submitting experience:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error sharing your experience. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFeedbackForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Thank You for Sharing!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your experience has been successfully shared. Now, help us improve the platform by rating your experience.
              </p>
            </div>

            <AppFeedbackForm onSubmitted={() => {
              toast({
                title: "Thank you for your feedback!",
                description: "Your feedback helps us improve the platform for everyone.",
              });
              navigate('/');
            }} />

            <div className="text-center mt-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip and go to homepage
              </Button>
            </div>
          </div>
        </div>

        <AboutUs />
      </div>
    );
  }

  const submitPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Share Interview Experience",
    "description": "Help fellow students by sharing your interview journey and experiences",
    "url": "https://your-domain.com/submit",
    "mainEntity": {
      "@type": "Organization",
      "name": "Interview Insights",
      "url": "https://your-domain.com"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${isEditing ? "Edit Interview Experience" : "Share Your Interview Experience"} - Interview Insights`}
        description={isEditing ? "Update your interview experience details and help other candidates prepare better." : "Help fellow students by sharing your interview journey and experiences. Share questions, answers, and valuable tips."}
        keywords="submit interview experience, share interview questions, interview tips, help students, interview preparation community"
        canonicalUrl={isEditing ? `/submit/${experienceId}` : "/submit"}
        schema={submitPageSchema}
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? "Edit Your Interview Experience" : "Share Your Interview Experience"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update your interview experience details" : "Help fellow students by sharing your interview journey"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name"
                      required
                      disabled={isAnonymous}
                    />
                    {isAnonymous && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Name is disabled for anonymous posts
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="e.g., Google, Microsoft"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      placeholder="e.g., Software Engineer Intern"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Interview Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outcome">Outcome</Label>
                    <Select value={formData.outcome} onValueChange={(value) => setFormData({...formData, outcome: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="not-selected">Not Selected</SelectItem>
                        <SelectItem value="waiting">Waiting for Result</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                      placeholder="https://linkedin.com/in/yourprofile"
                      disabled={isAnonymous}
                    />
                    {isAnonymous && (
                      <p className="text-xs text-muted-foreground mt-1">
                        LinkedIn profile is disabled for anonymous posts
                      </p>
                    )}
                  </div>
                </div>

                {/* Anonymous checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
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

                {/* Interview Rounds */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">Interview Rounds</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addRound}>
                      Add Round
                    </Button>
                  </div>

                  {rounds.map((round, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Round {index + 1}</h4>
                          {rounds.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRound(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Round Type</Label>
                              <Select 
                                value={round.type} 
                                onValueChange={(value) => updateRound(index, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="online-assessment">Online Assessment</SelectItem>
                                  <SelectItem value="coding-round">Coding Round</SelectItem>
                                  <SelectItem value="technical-interview">Technical Interview</SelectItem>
                                  <SelectItem value="hr-round">HR Round</SelectItem>
                                  <SelectItem value="group-discussion">Group Discussion</SelectItem>
                                  <SelectItem value="system-design">System Design</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Difficulty</Label>
                              <Select 
                                value={round.difficulty} 
                                onValueChange={(value) => updateRound(index, 'difficulty', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Questions Asked *</Label>
                            <Textarea
                              value={round.questions}
                              onChange={(e) => updateRound(index, 'questions', e.target.value)}
                              placeholder="What questions were asked in this round?"
                              rows={3}
                              required
                            />
                          </div>
                          <div>
                            <Label>Your Answers & Approach *</Label>
                            <Textarea
                              value={round.answers}
                              onChange={(e) => updateRound(index, 'answers', e.target.value)}
                              placeholder="How did you answer? What was your approach? Any tips..."
                              rows={3}
                              required
                            />
                          </div>
                          <div>
                            <Label>Overall Experience & Additional Tips *</Label>
                            <Textarea
                              value={round.experience}
                              onChange={(e) => updateRound(index, 'experience', e.target.value)}
                              placeholder="Share your overall experience for this round, any additional tips, preparation advice, or insights that might help others..."
                              rows={3}
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (isEditing ? "Updating..." : "Sharing...") : (isEditing ? "Update Experience" : `Share Experience${isAnonymous ? ' Anonymously' : ''}`)}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <AboutUs />
    </div>
  );
};

export default SubmitExperience;
