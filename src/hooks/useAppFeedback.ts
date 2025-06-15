import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppFeedback {
  id: string;
  user_name: string;
  feedback: string;
  rating: number;
  created_at: string;
}

export const useAppFeedback = () => {
  const [topFeedback, setTopFeedback] = useState<AppFeedback[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      // Fetch top feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .rpc('get_top_app_feedback', { limit_count: 5 });

      if (feedbackError) throw feedbackError;

      // Fetch average rating
      const { data: ratingData, error: ratingError } = await supabase
        .rpc('get_app_average_rating');

      if (ratingError) throw ratingError;

      setTopFeedback(feedbackData || []);
      setAverageRating(Number(ratingData) || 0);
    } catch (error) {
      console.error('Error fetching app feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();

    // Set up real-time subscription for app feedback
    const channel = supabase
      .channel('app-feedback-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_feedback'
        },
        () => {
          console.log('App feedback change detected, refetching data');
          fetchFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    topFeedback,
    averageRating,
    loading,
    refetch: fetchFeedback
  };
};