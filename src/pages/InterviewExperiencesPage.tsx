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

interface InterviewExperience {
  id: string;
  company_name: string;
  position: string;
  interview_type: string;
  experience_level: string;
  overall_rating: number;
  difficulty_rating: number;
  title: string;
  description: string;
  interview_process?: string;
  questions_asked?: string;
  tips?: string;
  outcome?: string;
  interview_date?: string;
  created_at: string;
  author_name: string;
  author_avatar?: string;
  upvote_count: number;
}

const InterviewExperiencesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const fetchExperiences = async () => {
    try {
      let query = supabase
        .from('interview_experiences_with_details')
        .select('*');

      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
      }

      if (filterCompany) {
        query = query.eq('company_name', filterCompany);
      }

      if (filterType) {
        query = query.eq('interview_type', filterType);
      }

      if (filterLevel) {
        query = query.eq('experience_level', filterLevel);
      }

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
  const companies = [...new Set(experiences.map(exp => exp.company_name))].sort();

  const interviewTypes = ['coding', 'behavioral', 'system design', 'technical', 'phone screening', 'onsite'];
  const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'principal'];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Interview Experiences - Interview Insights"
        description="Share and discover real interview experiences from top tech companies. Get insights into coding rounds, behavioral interviews, and more."
        keywords="interview experiences, tech interviews, coding interviews, interview tips, company interviews"
      />
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Real Interview Experiences</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Interview Experiences
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn from real interview experiences shared by the community. Get insights into what to expect and how to prepare.
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
                  <SelectItem value="">All Companies</SelectItem>
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
                  <SelectItem value="">All Types</SelectItem>
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
                  <SelectItem value="">All Levels</SelectItem>
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
                        ? (experiences.reduce((sum, exp) => sum + exp.overall_rating, 0) / experiences.length).toFixed(1)
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
            <div className="grid gap-6">
              {experiences.map(experience => (
                <InterviewExperienceCard
                  key={experience.id}
                  experience={experience}
                  onUpdate={fetchExperiences}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Experiences Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCompany || filterType || filterLevel
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