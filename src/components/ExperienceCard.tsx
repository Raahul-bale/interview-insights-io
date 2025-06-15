import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, Edit, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

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
      className="hover:shadow-lg transition-shadow duration-300 border border-border cursor-pointer" 
      onClick={handleCardClick}
      data-tour="experience-card"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {company} - {role}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={profile?.avatar_url || undefined} alt={name} />
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  By {profile?.full_name || name} • {date}
                </span>
                {profile?.bio && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {profile.bio}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && id && (
              <Link to={`/submit/${id}`}>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              </Link>
            )}
            <Badge 
              variant={outcome === "Selected" ? "default" : "secondary"}
              className="ml-2"
            >
              {outcome}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground mb-2">Interview Rounds:</h4>
            <div className="space-y-2">
              {rounds.map((round, index) => (
                <div key={index} className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">
                      {round.type}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {round.difficulty}
                    </Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {round.questions.map((question, qIndex) => (
                      <li key={qIndex} className="list-disc list-inside">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rating and upvote display */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= averageRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {averageRating > 0 ? (
                  <>
                    {averageRating.toFixed(1)} ({ratingCount})
                  </>
                ) : (
                  'Not rated'
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <ThumbsUp className="w-3 h-3" />
              <span className="text-xs">{upvoteCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceCard;