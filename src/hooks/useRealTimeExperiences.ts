import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Experience {
  id: string;
  company: string;
  role: string;
  user_name: string;
  user_id: string;
  date: string;
  rounds: any;
  average_rating: number;
  rating_count: number;
  upvote_count: number;
  created_at: string;
  full_text: string;
}

interface UseRealTimeExperiencesOptions {
  limit?: number;
  orderBy?: 'created_at' | 'average_rating' | 'upvote_count';
  ascending?: boolean;
  filters?: {
    hasRatings?: boolean;
    company?: string;
    role?: string;
  };
}

export const useRealTimeExperiences = (options: UseRealTimeExperiencesOptions = {}) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    limit,
    orderBy = 'created_at',
    ascending = false,
    filters = {}
  } = options;

  const fetchExperiences = async () => {
    try {
      setError(null);
      let query = supabase
        .from('interview_posts')
        .select('*');

      // Apply filters
      if (filters.hasRatings) {
        query = query.gt('rating_count', 0);
      }
      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`);
      }
      if (filters.role) {
        query = query.ilike('role', `%${filters.role}%`);
      }

      // Apply ordering
      query = query.order(orderBy, { ascending });
      
      // Add secondary ordering for better consistency
      if (orderBy === 'average_rating') {
        query = query.order('rating_count', { ascending: false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setExperiences(data || []);
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();

    // Set up real-time subscription
    const channel = supabase
      .channel('experiences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_posts'
        },
        (payload) => {
          console.log('Experience change detected:', payload);
          fetchExperiences();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experience_upvotes'
        },
        () => {
          console.log('Upvote change detected');
          fetchExperiences();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experience_ratings'
        },
        () => {
          console.log('Rating change detected');
          fetchExperiences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit, orderBy, ascending, JSON.stringify(filters)]);

  return {
    experiences,
    isLoading,
    error,
    refetch: fetchExperiences
  };
};