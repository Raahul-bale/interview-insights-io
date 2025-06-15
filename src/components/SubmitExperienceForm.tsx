import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Plus } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

const SubmitExperienceForm = ({ onSuccess }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    user_name: "",
    date: "",
    rounds: [
      {
        type: "",
        difficulty: "",
        questions: "",
        approach: "",
        experience: ""
      }
    ],
    full_text: ""
  });

  const roundTypes = [
    { value: "coding-round", label: "Coding Round" },
    { value: "behavioral", label: "Behavioral Interview" },
    { value: "system-design", label: "System Design" },
    { value: "technical", label: "Technical Interview" },
    { value: "phone-screening", label: "Phone Screening" },
    { value: "onsite", label: "Onsite Interview" }
  ];

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" }
  ];

  const handleInputChange = (field: string, value: string | any[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRound = () => {
    setFormData(prev => ({
      ...prev,
      rounds: [...prev.rounds, {
        type: "",
        difficulty: "",
        questions: "",
        approach: "",
        experience: ""
      }]
    }));
  };

  const updateRound = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, i) => 
        i === index ? { ...round, [field]: value } : round
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit an experience.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.company || !formData.role || !formData.user_name || 
        !formData.date || !formData.full_text) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('interview_posts')
        .insert({
          user_id: user.id,
          company: formData.company.trim(),
          role: formData.role.trim(),
          user_name: formData.user_name.trim(),
          date: formData.date,
          rounds: formData.rounds.filter(round => round.type && round.questions),
          full_text: formData.full_text.trim()
        });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error submitting experience:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="user_name">Your Name *</Label>
          <Input
            id="user_name"
            placeholder="e.g., John Doe"
            value={formData.user_name}
            onChange={(e) => handleInputChange('user_name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            placeholder="e.g., Google, Microsoft, Apple"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            placeholder="e.g., Software Engineer, Product Manager"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Interview Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Interview Rounds</Label>
          <Button type="button" onClick={addRound} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Round
          </Button>
        </div>

        {formData.rounds.map((round, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Round {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Round Type</Label>
                  <Select 
                    value={round.type} 
                    onValueChange={(value) => updateRound(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roundTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select 
                    value={round.difficulty} 
                    onValueChange={(value) => updateRound(index, 'difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Questions Asked *</Label>
                <Textarea
                  placeholder="What questions were asked in this round?"
                  value={round.questions}
                  onChange={(e) => updateRound(index, 'questions', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Your Answers & Approach *</Label>
                <Textarea
                  placeholder="How did you answer? What was your approach? Any tips..."
                  value={round.approach}
                  onChange={(e) => updateRound(index, 'approach', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Overall Experience & Additional Tips *</Label>
                <Textarea
                  placeholder="Share your overall experience for this round, any additional tips, preparation advice, or insights that might help others..."
                  value={round.experience}
                  onChange={(e) => updateRound(index, 'experience', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_text">Overall Experience Summary *</Label>
        <Textarea
          id="full_text"
          placeholder="Provide a comprehensive summary of your entire interview experience..."
          value={formData.full_text}
          onChange={(e) => handleInputChange('full_text', e.target.value)}
          rows={4}
          required
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Your experience will be visible to all users. Please avoid sharing any confidential information and be respectful in your feedback.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Share Experience"}
        </Button>
      </div>
    </form>
  );
};

export default SubmitExperienceForm;