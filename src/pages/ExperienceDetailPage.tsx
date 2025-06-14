import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, ThumbsUp, Calendar, User, Building2, Briefcase, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import UpvoteButton from "@/components/UpvoteButton";

interface Round {
  type: string;
  questions: string[];
  difficulty: string;
  experience: string;
  answers: string[];
}

interface Experience {
  id: string;
  company: string;
  role: string;
  user_name: string;
  date: string;
  rounds: any; // Json type from Supabase
  full_text: string;
  average_rating: number;
  rating_count: number;
  upvote_count: number;
  created_at: string;
}

const ExperienceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [relatedExperiences, setRelatedExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const fetchExperience = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('interview_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setExperience(data);
      
      // Fetch related experiences after getting the main experience
      await fetchRelatedExperiences(data);
    } catch (error) {
      console.error('Error fetching experience:', error);
      toast({
        title: "Error",
        description: "Failed to load experience details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedExperiences = async (currentExperience: Experience) => {
    try {
      // Extract keywords from company, role, and round types
      const rounds = Array.isArray(currentExperience.rounds) ? currentExperience.rounds : [];
      const keywords = [
        currentExperience.company.toLowerCase(),
        currentExperience.role.toLowerCase(),
        ...rounds.map(round => round.type.toLowerCase())
      ];
      
      // Build search query for related experiences
      const searchConditions = keywords.map(keyword => 
        `full_text.ilike.%${keyword}%,company.ilike.%${keyword}%,role.ilike.%${keyword}%`
      ).join(',');
      
      const { data, error } = await supabase
        .from('interview_posts')
        .select('*')
        .neq('id', currentExperience.id) // Exclude current experience
        .or(searchConditions)
        .order('average_rating', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setRelatedExperiences(data || []);
    } catch (error) {
      console.error('Error fetching related experiences:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const refreshExperience = () => {
    fetchExperience();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">Experience not found</h3>
                <p className="text-muted-foreground mb-4">The experience you're looking for doesn't exist.</p>
                <Link to="/">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Experiences
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Experience Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">
                      {experience.company} - {experience.role}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>By {experience.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(experience.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Shared {new Date(experience.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StarRating
                      experienceId={experience.id}
                      averageRating={experience.average_rating}
                      ratingCount={experience.rating_count}
                      onRatingUpdate={refreshExperience}
                    />
                    <UpvoteButton
                      experienceId={experience.id}
                      upvoteCount={experience.upvote_count}
                      onUpvoteUpdate={refreshExperience}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Interview Rounds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Interview Rounds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.isArray(experience.rounds) && experience.rounds.map((round, index) => (
                    <div key={index} className="border-l-4 border-primary pl-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{round.type}</h3>
                        <Badge variant="outline">{round.difficulty}</Badge>
                      </div>
                      
                      {/* Overall Experience */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Overall Experience:</h4>
                        <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                          {round.experience}
                        </p>
                      </div>

                      {/* Questions and Answers */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Questions & Answers:</h4>
                        {round.questions.map((question, qIndex) => (
                          <div key={qIndex} className="bg-muted p-4 rounded-lg">
                            <div className="mb-2">
                              <strong className="text-primary">Q{qIndex + 1}:</strong>
                              <span className="ml-2">{question}</span>
                            </div>
                            {round.answers && round.answers[qIndex] && (
                              <div>
                                <strong className="text-secondary">Answer:</strong>
                                <p className="ml-2 mt-1 text-muted-foreground">{round.answers[qIndex]}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {index < (Array.isArray(experience.rounds) ? experience.rounds.length : 0) - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Related Experiences */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Experiences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Similar experiences based on company, role, and interview types
                </p>
              </CardHeader>
              <CardContent>
                {relatedLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : relatedExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {relatedExperiences.map((relatedExp) => (
                      <Link
                        key={relatedExp.id}
                        to={`/experience/${relatedExp.id}`}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {relatedExp.company} - {relatedExp.role}
                          </h4>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>By {relatedExp.user_name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{relatedExp.average_rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.isArray(relatedExp.rounds) && relatedExp.rounds.slice(0, 2).map((round, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {round.type}
                            </Badge>
                          ))}
                          {Array.isArray(relatedExp.rounds) && relatedExp.rounds.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{relatedExp.rounds.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No related experiences found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetailPage;