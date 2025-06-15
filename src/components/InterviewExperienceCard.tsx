import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, 
  ThumbsUp, 
  Building2, 
  Calendar,
  User,
  MapPin,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";

interface InterviewExperience {
  id: string;
  company_name: string;
  position: string;
  interview_type: string;
  experience_level: string;
  overall_rating: number;
  difficulty_rating: number;
  title: string;
  description: string;
  interview_process?: string;
  questions_asked?: string;
  tips?: string;
  outcome?: string;
  interview_date?: string;
  created_at: string;
  author_name: string;
  author_avatar?: string;
  upvote_count: number;
}

interface Props {
  experience: InterviewExperience;
  onUpdate: () => void;
}

const InterviewExperienceCard = ({ experience, onUpdate }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(experience.upvote_count);
  const [loading, setLoading] = useState(false);

  // Check if user has upvoted this experience
  React.useEffect(() => {
    const checkUpvoteStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('interview_experience_upvotes')
        .select('id')
        .eq('user_id', user.id)
        .eq('experience_id', experience.id)
        .single();
      
      setIsUpvoted(!!data);
    };
    
    checkUpvoteStatus();
  }, [user, experience.id]);

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to upvote experiences.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isUpvoted) {
        // Remove upvote
        await supabase
          .from('interview_experience_upvotes')
          .delete()
          .eq('user_id', user.id)
          .eq('experience_id', experience.id);
        
        setIsUpvoted(false);
        setUpvoteCount(prev => prev - 1);
      } else {
        // Add upvote
        await supabase
          .from('interview_experience_upvotes')
          .insert({
            user_id: user.id,
            experience_id: experience.id
          });
        
        setIsUpvoted(true);
        setUpvoteCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast({
        title: "Error",
        description: "Failed to update upvote",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyColor = (rating: number) => {
    if (rating >= 4) return "text-red-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-green-600";
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome?.toLowerCase()) {
      case 'offered': return "bg-green-100 text-green-800";
      case 'rejected': return "bg-red-100 text-red-800";
      case 'pending': return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src={experience.author_avatar} />
              <AvatarFallback>
                {experience.author_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{experience.title}</h3>
                {experience.outcome && (
                  <Badge className={getOutcomeColor(experience.outcome)} variant="secondary">
                    {experience.outcome}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {experience.company_name} • {experience.position}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {experience.author_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(experience.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{experience.interview_type}</Badge>
                <Badge variant="outline">{experience.experience_level}</Badge>
                <div className="flex items-center gap-1">
                  <Star className={`h-4 w-4 ${getRatingColor(experience.overall_rating)}`} />
                  <span className={`text-sm font-medium ${getRatingColor(experience.overall_rating)}`}>
                    {experience.overall_rating}/5
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`h-4 w-4 ${getDifficultyColor(experience.difficulty_rating)}`} />
                  <span className={`text-sm font-medium ${getDifficultyColor(experience.difficulty_rating)}`}>
                    Difficulty: {experience.difficulty_rating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpvote}
              disabled={loading}
              className={isUpvoted ? "bg-primary/10 text-primary" : ""}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${isUpvoted ? "fill-current" : ""}`} />
              {upvoteCount}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {experience.description}
          </p>

          {(experience.interview_process || experience.questions_asked || experience.tips) && (
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 p-0 h-auto text-primary"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View Details
                  </>
                )}
              </Button>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {experience.interview_process && (
                    <div>
                      <h4 className="font-medium mb-2">Interview Process</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {experience.interview_process}
                      </p>
                    </div>
                  )}

                  {experience.questions_asked && (
                    <div>
                      <h4 className="font-medium mb-2">Questions Asked</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {experience.questions_asked}
                      </p>
                    </div>
                  )}

                  {experience.tips && (
                    <div>
                      <h4 className="font-medium mb-2">Tips & Advice</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {experience.tips}
                      </p>
                    </div>
                  )}

                  {experience.interview_date && (
                    <div>
                      <h4 className="font-medium mb-2">Interview Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(experience.interview_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewExperienceCard;