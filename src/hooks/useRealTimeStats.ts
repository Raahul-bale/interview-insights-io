import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalExperiences: number;
  successRate: number;
  companiesCovered: number;
  happyUsers: number;
  loading: boolean;
}

export const useRealTimeStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalExperiences: 0,
    successRate: 0,
    companiesCovered: 0,
    happyUsers: 0,
    loading: true
  });

  const fetchStats = async () => {
    try {
      // Fetch basic counts
      const { data: basicStats } = await supabase
        .from('interview_posts')
        .select('id, company, user_id, rounds');

      if (basicStats) {
        const totalExperiences = basicStats.length;
        const uniqueCompanies = new Set(basicStats.map(exp => exp.company.toLowerCase())).size;
        const uniqueUsers = new Set(basicStats.map(exp => exp.user_id)).size;

        // Calculate success rate based on positive outcomes
        const { data: successData } = await supabase
          .from('interview_posts')
          .select('rounds');

        let successfulInterviews = 0;
        if (successData) {
          successfulInterviews = successData.filter(exp => {
            try {
              if (Array.isArray(exp.rounds)) {
                // Check if any round indicates success (contains positive keywords)
                return exp.rounds.some((round: any) => 
                  round && typeof round === 'object' && round.experience && 
                  typeof round.experience === 'string' && (
                    round.experience.toLowerCase().includes('selected') ||
                    round.experience.toLowerCase().includes('offered') ||
                    round.experience.toLowerCase().includes('hired') ||
                    round.experience.toLowerCase().includes('passed') ||
                    round.experience.toLowerCase().includes('successful')
                  )
                );
              }
              return false;
            } catch (error) {
              console.error('Error processing round data:', error);
              return false;
            }
          }).length;
        }

        const successRate = totalExperiences > 0 ? Math.round((successfulInterviews / totalExperiences) * 100) : 0;

        // Get user count from profiles table (more accurate for happy users)
        const { count: profileCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const happyUsers = profileCount || uniqueUsers;

        setStats({
          totalExperiences,
          successRate,
          companiesCovered: uniqueCompanies,
          happyUsers,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions
    const experiencesChannel = supabase
      .channel('stats-experiences')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_posts'
        },
        () => {
          console.log('Experience change detected, updating stats');
          fetchStats();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('stats-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile change detected, updating stats');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(experiencesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    } else if (num >= 100) {
      return Math.floor(num / 100) * 100 + '+';
    } else if (num >= 50) {
      return '50+';
    } else if (num >= 10) {
      return '10+';
    }
    return num.toString();
  };

  const formattedStats = {
    experiences: formatNumber(stats.totalExperiences),
    successRate: `${stats.successRate}%`,
    companies: formatNumber(stats.companiesCovered),
    users: formatNumber(stats.happyUsers)
  };

  return {
    stats: formattedStats,
    rawStats: stats,
    loading: stats.loading,
    refetch: fetchStats
  };
};