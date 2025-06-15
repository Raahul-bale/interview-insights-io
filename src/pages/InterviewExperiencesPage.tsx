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
  Target
} from "lucide-react";
import InterviewExperienceCard from "@/components/InterviewExperienceCard";
import SubmitExperienceForm from "@/components/SubmitExperienceForm";

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
}

const InterviewExperiencesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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

      // Remove filters that don't exist on interview_posts table
      // if (filterType && filterType !== "all") {
      //   query = query.eq('interview_type', filterType);
      // }

      // if (filterLevel && filterLevel !== "all") {
      //   query = query.eq('experience_level', filterLevel);
      // }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
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

  // Get unique companies for filter
  const companies = [...new Set(experiences.map(exp => exp.company))].sort();

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
      
      <main className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-8 border border-primary/20">
              <TrendingUp className="h-5 w-5 mr-3 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Real Interview Experiences
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-playfair font-bold gradient-text mb-6">
              Interview Experiences
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Learn from real interview experiences shared by our amazing community. Get insights into what to expect and how to prepare for your dream job.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by company, position, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {interviewTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user && (
              <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Share Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Share Your Interview Experience</DialogTitle>
                  </DialogHeader>
                  <SubmitExperienceForm onSuccess={handleExperienceSubmitted} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{experiences.length}</p>
                    <p className="text-sm text-muted-foreground">Total Experiences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{companies.length}</p>
                    <p className="text-sm text-muted-foreground">Companies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {experiences.length > 0 
                        ? (experiences.reduce((sum, exp) => sum + (exp.average_rating || 0), 0) / experiences.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experiences List */}
          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
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
            <div className="grid gap-8">
              {experiences.map((experience, index) => (
                <div
                  key={experience.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card 
                    className="modern-card hover-lift cursor-pointer group"
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "Login Required",
                          description: "Please login to view detailed interview experiences.",
                          variant: "destructive",
                          action: (
                            <Button variant="outline" size="sm" asChild>
                              <a href="/auth">Login</a>
                            </Button>
                          )
                        });
                        return;
                      }
                      // Handle navigation to experience detail if needed
                    }}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-playfair font-semibold gradient-text">
                              {experience.company} - {experience.role}
                            </h3>
                            <div className="flex items-center gap-2">
                              {experience.average_rating && (
                                <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
                                  <Star className="h-4 w-4 text-primary fill-primary" />
                                  <span className="text-sm font-medium text-primary">
                                    {experience.average_rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
                              <User className="h-4 w-4" />
                              {experience.user_name}
                            </span>
                            <span className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(experience.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed mb-6">
                            {experience.full_text}
                          </p>
                          
                          {experience.rounds && Array.isArray(experience.rounds) && experience.rounds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {experience.rounds.map((round: any, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="bg-accent/10 border-accent/20 text-accent-foreground"
                                >
                                  {round.type || 'Round'} - {round.difficulty || 'N/A'}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 ml-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover-lift bg-background/50 backdrop-blur-sm"
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
                              // Handle upvote logic here if needed
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {experience.upvote_count}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Experiences Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || (filterCompany !== "all") || (filterType !== "all") || (filterLevel !== "all")
                    ? "Try adjusting your filters to see more results."
                    : "Be the first to share an interview experience!"
                  }
                </p>
                {user && (
                  <Button onClick={() => setIsSubmitDialogOpen(true)}>
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