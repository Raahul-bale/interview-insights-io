import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, Edit, User, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import FollowButton from "@/components/FollowButton";

interface Round {
  type: string;
  questions: string[];
  difficulty: string;
}

interface ExperienceCardProps {
  id?: string;
  userId?: string;
  name: string;
  company: string;
  role: string;
  date: string;
  rounds: Round[];
  outcome: string;
  averageRating?: number;
  ratingCount?: number;
  upvoteCount?: number;
}

const ExperienceCard = ({ 
  id,
  userId,
  name, 
  company, 
  role, 
  date, 
  rounds, 
  outcome,
  averageRating = 0,
  ratingCount = 0,
  upvoteCount = 0
}: ExperienceCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile(userId);
  const canEdit = user && userId && user.id === userId;
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    if (id) {
      navigate(`/experience/${id}`);
    }
  };

  return (
    <Card 
      className="modern-card hover-lift cursor-pointer group"
      onClick={handleCardClick}
      data-tour="experience-card"
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-playfair font-semibold gradient-text mb-3">
              {company} - {role}
            </CardTitle>
            
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={profile?.avatar_url || undefined} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {profile?.full_name || name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {userId && (
                    <FollowButton 
                      targetUserId={userId} 
                      size="sm" 
                      variant="outline"
                      showCount={false}
                      className="ml-4"
                    />
                  )}
                </div>
                
                {profile?.bio && (
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && id && (
              <Link to={`/submit/${id}`}>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 hover-lift">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Badge 
              variant={outcome === "Selected" ? "default" : "secondary"}
              className={`${
                outcome === "Selected" 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {outcome}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              Interview Rounds
              <span className="text-xs text-muted-foreground">({rounds.length})</span>
            </h4>
            <div className="space-y-3">
              {rounds.map((round, index) => (
                <div key={index} className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm text-foreground">
                      {round.type}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-background/50"
                    >
                      {round.difficulty}
                    </Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {round.questions.map((question, qIndex) => (
                      <li key={qIndex} className="list-disc list-inside leading-relaxed">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rating and upvote display */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 transition-colors ${
                      star <= averageRating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating > 0 ? (
                  <>
                    <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span> ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                  </>
                ) : (
                  'Not rated yet'
                )}
              </span>
            </div>
            
            <Button variant="ghost" size="sm" className="hover-lift">
              <ThumbsUp className="w-4 h-4 mr-2" />
              <span className="font-medium">{upvoteCount}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceCard;