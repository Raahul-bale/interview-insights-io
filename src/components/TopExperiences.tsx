import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import UpvoteButton from "./UpvoteButton";
import { useRealTimeExperiences } from "@/hooks/useRealTimeExperiences";
import { useProfile } from "@/hooks/useProfile";

interface TopExperiencesProps {
  limit?: number;
}

const TopExperiences = ({ limit = 5 }: TopExperiencesProps) => {
  const navigate = useNavigate();
  const { experiences: topExperiences, isLoading } = useRealTimeExperiences({
    limit,
    orderBy: 'average_rating',
    ascending: false,
    filters: { hasRatings: true }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Top Rated Experiences</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (topExperiences.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Top Rated Experiences</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No rated experiences yet. Be the first to rate an experience!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold">Top Rated Experiences</h2>
      </div>
      <div className="space-y-4">
        {topExperiences.map((experience, index) => {
          const ExperienceCardWithProfile = () => {
            const { profile } = useProfile(experience.user_id);
            
            return (
              <Card 
                key={experience.id} 
                className="relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={(e) => {
                  // Don't navigate if clicking on interactive elements
                  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="button"]')) {
                    return;
                  }
                  navigate(`/experience/${experience.id}`);
                }}
              >
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {experience.company} - {experience.role}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={profile?.avatar_url || undefined} alt={experience.user_name} />
                          <AvatarFallback className="text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">
                          By {profile?.full_name || experience.user_name} • {new Date(experience.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                <StarRating
                  experienceId={experience.id}
                  averageRating={experience.average_rating}
                  ratingCount={experience.rating_count}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(experience.rounds) && experience.rounds.map((round: any, roundIndex: number) => (
                    <Badge key={roundIndex} variant="secondary">
                      {round.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-end">
                  <UpvoteButton
                    experienceId={experience.id}
                    upvoteCount={experience.upvote_count}
                  />
                </div>
              </div>
            </CardContent>
              </Card>
            );
          };
          
          return <ExperienceCardWithProfile key={experience.id} />;
        })}
      </div>
    </div>
  );
};

export default TopExperiences;