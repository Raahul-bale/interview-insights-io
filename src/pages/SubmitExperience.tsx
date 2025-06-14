import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    date: "",
    outcome: ""
  });
  
  const [rounds, setRounds] = useState<Round[]>([
    { type: "", questions: "", answers: "", experience: "", difficulty: "" }
  ]);

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

    // Check monthly submission limit
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

    setIsSubmitting(true);

    try {
      // Create full text for search/embedding
      const fullText = `${formData.company} ${formData.role} interview experience by ${formData.name}. ${rounds.map(r => `${r.type} round: Questions: ${r.questions} Answers: ${r.answers} Experience: ${r.experience}`).join(' ')}`;
      
      // Prepare rounds data - filter out rounds with no type
      const roundsData = rounds.filter(r => r.type).map(r => ({
        type: r.type,
        questions: [r.questions || ""], // Store as array to match interface
        answers: [r.answers || ""], // Store answers as array too
        difficulty: r.difficulty || 'medium'
      }));

      const { error } = await supabase
        .from('interview_posts')
        .insert({
          user_id: user.id,
          user_name: formData.name,
          company: formData.company,
          role: formData.role,
          date: formData.date || new Date().toISOString().split('T')[0],
          rounds: roundsData,
          full_text: fullText
        });

      if (error) throw error;

      toast({
        title: "Experience Shared!",
        description: "Thank you for sharing your interview experience. It will help other students prepare better!",
      });

      // Reset form
      setFormData({ name: "", company: "", role: "", date: "", outcome: "" });
      setRounds([{ type: "", questions: "", answers: "", experience: "", difficulty: "" }]);
      
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Share Your Interview Experience
            </h1>
            <p className="text-muted-foreground">
              Help fellow students by sharing your interview journey
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
                    />
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
                            <Label>Questions Asked (Optional)</Label>
                            <Textarea
                              value={round.questions}
                              onChange={(e) => updateRound(index, 'questions', e.target.value)}
                              placeholder="What questions were asked in this round?"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Your Answers & Approach (Optional)</Label>
                            <Textarea
                              value={round.answers}
                              onChange={(e) => updateRound(index, 'answers', e.target.value)}
                              placeholder="How did you answer? What was your approach? Any tips..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Overall Experience & Additional Tips (Optional)</Label>
                            <Textarea
                              value={round.experience}
                              onChange={(e) => updateRound(index, 'experience', e.target.value)}
                              placeholder="Share your overall experience for this round, any additional tips, preparation advice, or insights that might help others..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Sharing..." : "Share Experience"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitExperience;