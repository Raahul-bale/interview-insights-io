import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import UpvoteButton from "./UpvoteButton";
import { useRealTimeExperiences } from "@/hooks/useRealTimeExperiences";
import { useProfile } from "@/hooks/useProfile";

interface AllExperiencesProps {
  limit?: number;
}

const AllExperiences = ({ limit }: AllExperiencesProps) => {
  const navigate = useNavigate();
  const { experiences, isLoading } = useRealTimeExperiences({
    limit,
    orderBy: 'created_at',
    ascending: false
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">All Experiences</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">All Experiences</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No experiences yet</h3>
              <p className="text-muted-foreground">Be the first to share your interview experience!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">All Experiences</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((experience) => {
          const ExperienceCardWithProfile = () => {
            const { profile } = useProfile(experience.user_id);
            
            return (
              <Card 
                key={experience.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={(e) => {
                  // Don't navigate if clicking on interactive elements
                  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="button"]')) {
                    return;
                  }
                  navigate(`/experience/${experience.id}`);
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
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
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
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
                  {Array.isArray(experience.rounds) && experience.rounds.map((round: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {round.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Shared {new Date(experience.created_at).toLocaleDateString()}
                  </div>
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

export default AllExperiences;