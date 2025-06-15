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
import { Star } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

const SubmitExperienceForm = ({ onSuccess }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    position: "",
    interview_type: "",
    experience_level: "",
    overall_rating: 0,
    difficulty_rating: 0,
    title: "",
    description: "",
    interview_process: "",
    questions_asked: "",
    tips: "",
    outcome: "",
    interview_date: ""
  });

  const interviewTypes = [
    { value: "coding", label: "Coding Round" },
    { value: "behavioral", label: "Behavioral Interview" },
    { value: "system design", label: "System Design" },
    { value: "technical", label: "Technical Interview" },
    { value: "phone screening", label: "Phone Screening" },
    { value: "onsite", label: "Onsite Interview" }
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "lead", label: "Lead Level" },
    { value: "principal", label: "Principal Level" }
  ];

  const outcomes = [
    { value: "offered", label: "Offered" },
    { value: "rejected", label: "Rejected" },
    { value: "pending", label: "Pending" }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    if (!formData.company_name || !formData.position || !formData.interview_type || 
        !formData.experience_level || !formData.title || !formData.description ||
        formData.overall_rating === 0 || formData.difficulty_rating === 0) {
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
        .from('interview_experiences')
        .insert({
          user_id: user.id,
          company_name: formData.company_name.trim(),
          position: formData.position.trim(),
          interview_type: formData.interview_type,
          experience_level: formData.experience_level,
          overall_rating: formData.overall_rating,
          difficulty_rating: formData.difficulty_rating,
          title: formData.title.trim(),
          description: formData.description.trim(),
          interview_process: formData.interview_process.trim() || null,
          questions_asked: formData.questions_asked.trim() || null,
          tips: formData.tips.trim() || null,
          outcome: formData.outcome || null,
          interview_date: formData.interview_date || null
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

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded ${star <= value ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
          >
            <Star className={`h-6 w-6 ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {value > 0 ? `${value}/5` : 'Select rating'}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            placeholder="e.g., Google, Microsoft, Apple"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position *</Label>
          <Input
            id="position"
            placeholder="e.g., Software Engineer, Product Manager"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Interview Type *</Label>
          <Select value={formData.interview_type} onValueChange={(value) => handleInputChange('interview_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select interview type" />
            </SelectTrigger>
            <SelectContent>
              {interviewTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Experience Level *</Label>
          <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Experience Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Google Software Engineer Coding Round Experience"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StarRating
          value={formData.overall_rating}
          onChange={(rating) => handleInputChange('overall_rating', rating)}
          label="Overall Experience Rating"
        />

        <StarRating
          value={formData.difficulty_rating}
          onChange={(rating) => handleInputChange('difficulty_rating', rating)}
          label="Difficulty Rating"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Experience Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your overall interview experience, what went well, what was challenging..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interview_process">Interview Process (Optional)</Label>
        <Textarea
          id="interview_process"
          placeholder="Describe the overall interview process, timeline, number of rounds..."
          value={formData.interview_process}
          onChange={(e) => handleInputChange('interview_process', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="questions_asked">Questions Asked (Optional)</Label>
        <Textarea
          id="questions_asked"
          placeholder="Share the specific questions or types of questions you encountered..."
          value={formData.questions_asked}
          onChange={(e) => handleInputChange('questions_asked', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tips">Tips & Advice (Optional)</Label>
        <Textarea
          id="tips"
          placeholder="Share any tips or advice for future candidates..."
          value={formData.tips}
          onChange={(e) => handleInputChange('tips', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Outcome (Optional)</Label>
          <Select value={formData.outcome} onValueChange={(value) => handleInputChange('outcome', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              {outcomes.map(outcome => (
                <SelectItem key={outcome.value} value={outcome.value}>
                  {outcome.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interview_date">Interview Date (Optional)</Label>
          <Input
            id="interview_date"
            type="date"
            value={formData.interview_date}
            onChange={(e) => handleInputChange('interview_date', e.target.value)}
          />
        </div>
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