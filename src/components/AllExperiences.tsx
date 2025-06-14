import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StarRating from "./StarRating";
import UpvoteButton from "./UpvoteButton";

interface Experience {
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

interface AllExperiencesProps {
  limit?: number;
}

const AllExperiences = ({ limit }: AllExperiencesProps) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllExperiences = async () => {
    try {
      let query = supabase
        .from('interview_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching all experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllExperiences();
  }, [limit]);

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
        {experiences.map((experience) => (
          <Card key={experience.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {experience.company} - {experience.role}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    By {experience.user_name} • {new Date(experience.date).toLocaleDateString()}
                  </p>
                </div>
                <StarRating
                  experienceId={experience.id}
                  averageRating={experience.average_rating}
                  ratingCount={experience.rating_count}
                  onRatingUpdate={fetchAllExperiences}
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
                    onUpvoteUpdate={fetchAllExperiences}
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

export default AllExperiences;