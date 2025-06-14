import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp } from "lucide-react";

interface UpvoteButtonProps {
  experienceId: string;
  upvoteCount?: number;
  onUpvoteUpdate?: () => void;
}

const UpvoteButton = ({ 
  experienceId, 
  upvoteCount = 0,
  onUpvoteUpdate 
}: UpvoteButtonProps) => {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserUpvote = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('experience_upvotes')
          .select('id')
          .eq('user_id', user.id)
          .eq('experience_id', experienceId)
          .maybeSingle();

        if (error) throw error;
        setHasUpvoted(!!data);
      } catch (error) {
        console.error('Error fetching user upvote:', error);
      }
    };

    fetchUserUpvote();
  }, [user, experienceId]);

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
        setHasUpvoted(false);
      } else {
        // Add upvote
        const { error } = await supabase
          .from('experience_upvotes')
          .insert({
            user_id: user.id,
            experience_id: experienceId
          });

        if (error) throw error;
        setHasUpvoted(true);
      }

      console.log('Upvote action completed, calling onUpvoteUpdate');
      onUpvoteUpdate?.();
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
    >
      <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
      <span className="text-sm">{upvoteCount}</span>
    </Button>
  );
};

export default UpvoteButton;