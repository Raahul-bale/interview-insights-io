import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StarRatingProps {
  experienceId: string;
  currentRating?: number;
  averageRating?: number;
  ratingCount?: number;
  onRatingUpdate?: () => void;
}

const StarRating = ({ 
  experienceId, 
  currentRating = 0, 
  averageRating = 0, 
  ratingCount = 0,
  onRatingUpdate 
}: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate experiences.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('experience_ratings')
        .upsert({
          user_id: user.id,
          experience_id: experienceId,
          rating: rating
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!"
      });

      onRatingUpdate?.();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Rating Failed",
        description: "There was an error submitting your rating.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            disabled={isSubmitting}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleRating(star)}
          >
            <Star
              className={`w-4 h-4 ${
                star <= (hoveredRating || currentRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {averageRating > 0 ? (
          <>
            {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
          </>
        ) : (
          'No ratings yet'
        )}
      </div>
    </div>
  );
};

export default StarRating;