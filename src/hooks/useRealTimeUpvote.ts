import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRealTimeUpvote = (experienceId: string) => {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchUpvoteData = async () => {
    try {
      // Fetch upvote count
      const { data: upvoteData, error: upvoteError } = await supabase
        .from('experience_upvotes')
        .select('id')
        .eq('experience_id', experienceId);

      if (upvoteError) throw upvoteError;
      setUpvoteCount(upvoteData?.length || 0);

      // Fetch user's upvote status if logged in
      if (user) {
        const { data: userUpvote, error: userUpvoteError } = await supabase
          .from('experience_upvotes')
          .select('id')
          .eq('experience_id', experienceId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userUpvoteError) throw userUpvoteError;
        setHasUpvoted(!!userUpvote);
      } else {
        setHasUpvoted(false);
      }
    } catch (error) {
      console.error('Error fetching upvote data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!experienceId) return;

    fetchUpvoteData();

    // Set up real-time subscription for upvotes
    const channel = supabase
      .channel(`upvotes-${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experience_upvotes',
          filter: `experience_id=eq.${experienceId}`
        },
        (payload) => {
          console.log('Upvote change detected:', payload);
          fetchUpvoteData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experienceId, user?.id]);

  return {
    hasUpvoted,
    upvoteCount,
    isLoading,
    refetch: fetchUpvoteData
  };
};