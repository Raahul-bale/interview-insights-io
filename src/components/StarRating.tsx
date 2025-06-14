import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [userRating, setUserRating] = useState(currentRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('experience_ratings')
          .select('rating')
          .eq('user_id', user.id)
          .eq('experience_id', experienceId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setUserRating(data.rating);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    fetchUserRating();
  }, [user, experienceId]);

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
        }, {
          onConflict: 'user_id, experience_id'
        });

      if (error) throw error;

      const isUpdate = userRating > 0;
      setUserRating(rating);
      console.log('Rating submitted successfully, calling onRatingUpdate');
      
      toast({
        title: isUpdate ? "Rating Updated" : "Rating Submitted",
        description: isUpdate ? "Your rating has been updated!" : "Thank you for your feedback!"
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
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
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
                      star <= (hoveredRating || userRating || (user ? 0 : averageRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              ))}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {user 
                ? userRating > 0 
                  ? "Click to update your rating" 
                  : "Rate this experience (you can only rate once)"
                : "Login to rate this experience"
              }
            </p>
          </TooltipContent>
        </Tooltip>
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
    </TooltipProvider>
  );
};

export default StarRating;