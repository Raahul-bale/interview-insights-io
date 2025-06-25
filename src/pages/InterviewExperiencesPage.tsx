import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  ThumbsUp, 
  Building2, 
  Calendar,
  User,
  TrendingUp,
  Target,
  Eye
} from "lucide-react";
import InterviewExperienceCard from "@/components/InterviewExperienceCard";
import SubmitExperienceForm from "@/components/SubmitExperienceForm";
import FollowButton from "@/components/FollowButton";

interface InterviewPost {
  id: string;
  company: string;
  role: string;
  user_name: string;
  date: string;
  rounds: any;
  full_text: string;
  average_rating: number | null;
  rating_count: number | null;
  upvote_count: number;
  created_at: string;
  user_id?: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    follower_count: number | null;
  } | null;
}

const InterviewExperiencesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<InterviewPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const fetchExperiences = async () => {
    try {
      let query = supabase
        .from('interview_posts')
        .select('*');

      if (searchTerm) {
        query = query.or(`company.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%,full_text.ilike.%${searchTerm}%`);
      }

      if (filterCompany && filterCompany !== "all") {
        query = query.eq('company', filterCompany);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setExperiences((data || []) as InterviewPost[]);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Error",
        description: "Failed to load interview experiences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [searchTerm, filterCompany, filterType, filterLevel]);

  const handleExperienceSubmitted = () => {
    setIsSubmitDialogOpen(false);
    fetchExperiences();
    toast({
      title: "Success!",
      description: "Your interview experience has been shared.",
    });
  };

  // Get unique companies for filter - ensure we have all companies
  const companies = [...new Set(experiences.map(exp => exp.company))].filter(Boolean).sort();

  const interviewTypes = ['coding', 'behavioral', 'system design', 'technical', 'phone screening', 'onsite'];
  const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'principal'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SEO 
        title="Interview Experiences - Interview Insights"
        description="Share and discover real interview experiences from top tech companies. Get insights into coding rounds, behavioral interviews, and more."
        keywords="interview experiences, tech interviews, coding interviews, interview tips, company interviews"
      />
      <Header />
      
      <main className="py-12 md:py-24 safe-area-top">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Hero Section - Mobile Optimized */}
          <div className="text-center mb-8 md:mb-16 animate-fade-in">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 md:px-6 py-2 md:py-3 mb-4 md:mb-8 border border-primary/20">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-primary" />
              <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Real Interview Experiences
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-playfair font-bold gradient-text mb-4 md:mb-6 leading-tight">
              Interview Experiences
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Learn from real interview experiences shared by our amazing community. Get insights 
              into what to expect and how to prepare for your dream job.
            </p>
          </div>

          {/* Action Bar - Mobile Responsive */}
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 md:h-5 md:w-5" />
              <Input
                placeholder="Search by company, position, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 md:pl-12 h-12 md:h-14 text-base mobile-touch-target"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="h-12 md:h-14 mobile-touch-target bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border border-border/50 shadow-lg">
                  <SelectItem value="all" className="hover:bg-accent/50">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company} className="hover:bg-accent/50">
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-12 md:h-14 mobile-touch-target bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border border-border/50 shadow-lg">
                  <SelectItem value="all" className="hover:bg-accent/50">All Types</SelectItem>
                  {interviewTypes.map(type => (
                    <SelectItem key={type} value={type} className="hover:bg-accent/50">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="h-12 md:h-14 mobile-touch-target bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border border-border/50 shadow-lg">
                  <SelectItem value="all" className="hover:bg-accent/50">All Levels</SelectItem>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level} className="hover:bg-accent/50">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {user && (
                <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-12 md:h-14 mobile-touch-target btn-mobile">
                      <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      <span className="hidden sm:inline">Share Experience</span>
                      <span className="sm:hidden">Share</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                      <DialogTitle>Share Your Interview Experience</DialogTitle>
                    </DialogHeader>
                    <SubmitExperienceForm />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Stats Cards - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="mobile-p-4">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <User className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 sm:mb-0 sm:mr-3" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{experiences.length}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Experiences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mobile-p-4">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 sm:mb-0 sm:mr-3" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{companies.length}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Companies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mobile-p-4">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 sm:mb-0 sm:mr-3" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">
                      {experiences.length > 0 
                        ? (experiences.reduce((sum, exp) => sum + (exp.average_rating || 0), 0) / experiences.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mobile-p-4 col-span-2 lg:col-span-1">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2 sm:mb-0 sm:mr-3" />
                  <div>
                    <p className="text-xl md:text-2xl font-bold">
                      {experiences.filter(exp => exp.average_rating && exp.average_rating >= 4).length}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">Top Rated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experiences List - Mobile Optimized */}
          {loading ? (
            <div className="grid gap-4 md:gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="mobile-p-4">
                  <CardContent className="p-4 md:p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : experiences.length > 0 ? (
            <div className="grid gap-4 md:gap-8">
              {experiences.map((experience, index) => (
                <div
                  key={experience.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card 
                    className="modern-card hover-lift cursor-pointer group mobile-p-4"
                    onClick={(e) => {
                      // Don't navigate if clicking on buttons or interactive elements
                      if ((e.target as HTMLElement).closest('button') || 
                          (e.target as HTMLElement).closest('a') ||
                          (e.target as HTMLElement).closest('[role="button"]')) {
                        return;
                      }
                      
                      if (experience.id) {
                        navigate(`/experience/${experience.id}`);
                      }
                    }}
                  >
                    <CardContent className="p-4 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 md:mb-6">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <h3 className="text-lg md:text-xl font-playfair font-semibold gradient-text mobile-text-xl">
                              {experience.company} - {experience.role}
                            </h3>
                            <div className="flex items-center gap-2">
                              {experience.average_rating && (
                                <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 md:px-3 py-1">
                                  <Star className="h-3 w-3 md:h-4 md:w-4 text-primary fill-primary" />
                                  <span className="text-xs md:text-sm font-medium text-primary">
                                    {experience.average_rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="mobile-touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (experience.id) {
                                    navigate(`/experience/${experience.id}`);
                                  }
                                }}
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="text-xs md:text-sm">View</span>
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6 text-sm text-muted-foreground mb-3 md:mb-4">
                            <span className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 md:px-3 py-1">
                              <User className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="text-xs md:text-sm">{experience.user_name}</span>
                            </span>
                            <span className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 md:px-3 py-1">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="text-xs md:text-sm">
                                {new Date(experience.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </span>
                            {experience.user_id && experience.user_id.trim() !== '' && (
                              <FollowButton 
                                targetUserId={experience.user_id} 
                                size="sm"
                                showCount={false}
                                className="mobile-touch-target"
                              />
                            )}
                          </div>
                          
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6 line-clamp-3">
                            {experience.full_text}
                          </p>
                          
                          {experience.rounds && Array.isArray(experience.rounds) && experience.rounds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                              {experience.rounds.slice(0, 3).map((round: any, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="bg-accent/10 border-accent/20 text-accent-foreground text-xs"
                                >
                                  {round.type || 'Round'} - {round.difficulty || 'N/A'}
                                </Badge>
                              ))}
                              {experience.rounds.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{experience.rounds.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover-lift bg-background/50 backdrop-blur-sm mobile-touch-target"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                toast({
                                  title: "Login Required",
                                  description: "Please login to upvote experiences.",
                                  variant: "destructive",
                                  action: (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href="/auth">Login</a>
                                    </Button>
                                  )
                                });
                                return;
                              }
                            }}
                          >
                            <ThumbsUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="text-xs md:text-sm font-medium">{experience.upvote_count}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="mobile-p-4">
              <CardContent className="py-8 md:py-12 text-center px-4">
                <Target className="mx-auto h-12 w-12 md:h-16 md:w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">No Experiences Found</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchTerm || (filterCompany !== "all") || (filterType !== "all") || (filterLevel !== "all")
                    ? "Try adjusting your filters to see more results."
                    : "Be the first to share an interview experience!"
                  }
                </p>
                {user && (
                  <Button 
                    onClick={() => setIsSubmitDialogOpen(true)}
                    className="mobile-touch-target btn-mobile"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Share Your Experience
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InterviewExperiencesPage;
