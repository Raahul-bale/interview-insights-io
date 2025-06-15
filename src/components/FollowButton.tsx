import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Users } from "lucide-react";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";

interface FollowButtonProps {
  targetUserId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showCount?: boolean;
  className?: string;
}

const FollowButton = ({ 
  targetUserId, 
  variant = "default", 
  size = "sm",
  showCount = true,
  className = ""
}: FollowButtonProps) => {
  const { user } = useAuth();
  
  // Add error handling for the hook
  let hookResult;
  try {
    hookResult = useFollow(targetUserId);
  } catch (error) {
    console.error('Error in useFollow hook:', error);
    return null; // Return null if there's an error to prevent crash
  }
  
  const { isFollowing, followerCount, loading, toggleFollow } = hookResult;

  // Don't show follow button for own profile, but show follower count
  if (user?.id === targetUserId) {
    return showCount ? (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Users className="h-4 w-4" />
        <span className="font-medium">{followerCount}</span>
        <span>followers</span>
      </div>
    ) : null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        variant={isFollowing ? "outline" : variant}
        size={size}
        onClick={toggleFollow}
        disabled={loading}
        className={`
          transition-all duration-200 hover:scale-105 
          ${isFollowing 
            ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" 
            : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
          }
        `}
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-4 w-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      
      {showCount && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{followerCount}</span>
          <span>followers</span>
        </div>
      )}
    </div>
  );
};

export default FollowButton;