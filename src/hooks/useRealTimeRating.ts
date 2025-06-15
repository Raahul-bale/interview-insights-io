import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealTimeRating = (experienceId: string) => {
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRatingData = async () => {
    try {
      // Fetch all ratings for this experience
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('experience_ratings')
        .select('rating')
        .eq('experience_id', experienceId);

      if (ratingsError) throw ratingsError;

      const ratings = ratingsData || [];
      setRatingCount(ratings.length);

      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        setAverageRating(avgRating);
      } else {
        setAverageRating(0);
      }

      // Fetch user's rating if logged in
      if (user) {
        const { data: userRatingData, error: userRatingError } = await supabase
          .from('experience_ratings')
          .select('rating')
          .eq('experience_id', experienceId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userRatingError) throw userRatingError;
        setUserRating(userRatingData?.rating || 0);
      } else {
        setUserRating(0);
      }
    } catch (error) {
      console.error('Error fetching rating data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!experienceId) return;

    fetchRatingData();

    // Set up real-time subscription for ratings
    const channel = supabase
      .channel(`ratings-${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experience_ratings',
          filter: `experience_id=eq.${experienceId}`
        },
        (payload) => {
          console.log('Rating change detected:', payload);
          fetchRatingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experienceId, user?.id]);

  return {
    userRating,
    averageRating,
    ratingCount,
    isLoading,
    refetch: fetchRatingData
  };
};