import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Shield, User, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useProfile } from '@/hooks/useProfile';

interface BlockedUsersProps {
  experienceId: string;
  experienceTitle: string;
}

const BlockedUsers = ({ experienceId, experienceTitle }: BlockedUsersProps) => {
  const { user } = useAuth();
  const { getBlockedUsers, unblockUser } = useChat();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBlockedUsers();
  }, [experienceId]);

  const loadBlockedUsers = async () => {
    if (!experienceId) return;
    
    setLoading(true);
    const blocked = await getBlockedUsers(experienceId);
    setBlockedUsers(blocked);
    setLoading(false);
  };

  const handleUnblock = async (conversationId: string) => {
    await unblockUser(conversationId);
    loadBlockedUsers(); // Refresh the list
  };

  const BlockedUserItem = ({ blockedUser }: { blockedUser: any }) => {
    const { profile } = useProfile(blockedUser.requester_id);

    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h4 className="font-semibold">{profile?.full_name || 'Unknown User'}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Blocked on {new Date(blockedUser.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnblock(blockedUser.id)}
              disabled={loading}
            >
              Unblock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading blocked users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Blocked Users</h3>
        <Badge variant="secondary">{blockedUsers.length}</Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Users blocked from sending chat requests for: <strong>{experienceTitle}</strong>
      </p>

      {blockedUsers.length > 0 ? (
        <div className="space-y-2">
          {blockedUsers.map((blockedUser) => (
            <BlockedUserItem key={blockedUser.id} blockedUser={blockedUser} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No blocked users for this experience</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlockedUsers;