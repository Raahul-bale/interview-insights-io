import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFollow = (targetUserId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkFollowStatus = async () => {
    if (!user || !targetUserId) return;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // Expected error when not following
      setIsFollowing(false);
    }
  };

  const fetchFollowerCount = async () => {
    if (!targetUserId) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('follower_count')
        .eq('user_id', targetUserId)
        .single();

      setFollowerCount(data?.follower_count || 0);
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to follow users.",
        variant: "destructive",
      });
      return;
    }

    if (!targetUserId || user.id === targetUserId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user.",
        });
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        
        toast({
          title: "Following",
          description: "You are now following this user.",
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFollowStatus();
    fetchFollowerCount();
  }, [user, targetUserId]);

  // Set up real-time subscription for follower count
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`profile-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${targetUserId}`
        },
        (payload) => {
          if (payload.new.follower_count !== undefined) {
            setFollowerCount(payload.new.follower_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  return {
    isFollowing,
    followerCount,
    loading,
    toggleFollow
  };
};