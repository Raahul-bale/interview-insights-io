import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
  experience_id: string;
}

export const useRealTimeComments = (experienceId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('experience_comments')
        .select('*')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!experienceId) return;

    fetchComments();

    // Set up real-time subscription for comments
    const channel = supabase
      .channel(`comments-${experienceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experience_comments',
          filter: `experience_id=eq.${experienceId}`
        },
        (payload) => {
          console.log('Comment change detected:', payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [experienceId]);

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments
  };
};