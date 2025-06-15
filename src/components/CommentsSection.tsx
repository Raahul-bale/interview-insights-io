import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeComments } from "@/hooks/useRealTimeComments";

interface CommentsSectionProps {
  experienceId: string;
}

const CommentsSection = ({ experienceId }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { comments, isLoading: loading } = useRealTimeComments(experienceId);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Get user's profile for name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('experience_comments')
        .insert({
          experience_id: experienceId,
          user_id: user.id,
          user_name: profile?.full_name || 'Anonymous',
          comment: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('experience_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              placeholder="Share your thoughts about this experience..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please log in to add comments</p>
          </div>
        )}

        <Separator />

        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()} at{' '}
                      {new Date(comment.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  {user && user.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;