import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import UpvoteButton from "./UpvoteButton";

interface TopExperience {
  id: string;
  company: string;
  role: string;
  user_name: string;
  date: string;
  rounds: any;
  average_rating: number;
  rating_count: number;
  upvote_count: number;
  created_at: string;
}

interface TopExperiencesProps {
  limit?: number;
}

const TopExperiences = ({ limit = 5 }: TopExperiencesProps) => {
  const [topExperiences, setTopExperiences] = useState<TopExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTopExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_posts')
        .select('*')
        .gt('rating_count', 0)
        .order('average_rating', { ascending: false })
        .order('rating_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTopExperiences(data || []);
    } catch (error) {
      console.error('Error fetching top experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopExperiences();
  }, [limit]);

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
        {topExperiences.map((experience, index) => (
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
                  <p className="text-sm text-muted-foreground">
                    By {experience.user_name} • {new Date(experience.date).toLocaleDateString()}
                  </p>
                </div>
                <StarRating
                  experienceId={experience.id}
                  averageRating={experience.average_rating}
                  ratingCount={experience.rating_count}
                  onRatingUpdate={fetchTopExperiences}
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
                    onUpvoteUpdate={fetchTopExperiences}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopExperiences;