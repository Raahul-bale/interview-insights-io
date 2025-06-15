import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp } from "lucide-react";
import { useRealTimeUpvote } from "@/hooks/useRealTimeUpvote";

interface UpvoteButtonProps {
  experienceId: string;
  upvoteCount?: number;
}

const UpvoteButton = ({ 
  experienceId, 
  upvoteCount: propUpvoteCount = 0
}: UpvoteButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasUpvoted, upvoteCount } = useRealTimeUpvote(experienceId);

  // Use real-time count if available, otherwise fallback to prop
  const displayCount = upvoteCount !== undefined ? upvoteCount : propUpvoteCount;

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upvote experiences.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('experience_upvotes')
          .delete()
          .eq('user_id', user.id)
          .eq('experience_id', experienceId);

        if (error) throw error;
      } else {
        // Add upvote
        const { error } = await supabase
          .from('experience_upvotes')
          .insert({
            user_id: user.id,
            experience_id: experienceId
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
      toast({
        title: "Upvote Failed",
        description: "There was an error updating your upvote.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 ${hasUpvoted ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={handleUpvote}
      disabled={isSubmitting}
      data-tour="upvote-button"
    >
      <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
      <span className="text-sm">{displayCount}</span>
    </Button>
  );
};

export default UpvoteButton;