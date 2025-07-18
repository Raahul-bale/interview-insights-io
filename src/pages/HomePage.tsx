import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import TopExperiences from "@/components/TopExperiences";
import SearchExperiences from "@/components/SearchExperiences";
import AllExperiences from "@/components/AllExperiences";
import AdvancedFilters, { type FilterOptions } from "@/components/AdvancedFilters";
import FilteredExperiences from "@/components/FilteredExperiences";
import ExperienceCard from "@/components/ExperienceCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeStats } from "@/hooks/useRealTimeStats";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Shield, 
  Star, 
  ArrowRight,
  CheckCircle,
  MessageSquare,
  FileText,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Target,
  Award,
  BookOpen,
  ChevronRight,
  Search,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import AboutUs from "@/components/AboutUs";
import Footer from "@/components/Footer";

const HomePage = () => {
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { stats: realTimeStats, loading: statsLoading } = useRealTimeStats();
  
  // User profile state
  const [userProfile, setUserProfile] = useState<{
    full_name?: string;
    avatar_url?: string;
  }>({});
  
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Experiences state
  const [experiences, setExperiences] = useState<any[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<'rating' | 'recent' | 'upvotes'>('recent');
  
  // Auth form states
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch experiences
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data, error } = await supabase
          .from('interview_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) throw error;
        setExperiences(data || []);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setExperiencesLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully",
      });
      // Reset form
      setLoginEmail('');
      setLoginPassword('');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(signupEmail, signupPassword, fullName);
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } else {
      // Reset form on success
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');
      setFullName('');
      
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    setIsLoading(false);
  };

  const getDisplayName = () => {
    return userProfile.full_name || user?.email?.split('@')[0] || 'User';
  };

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Preparation",
      description: "Get personalized interview advice based on thousands of real candidate experiences.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Resume ATS Optimizer",
      description: "Optimize your resume for Applicant Tracking Systems with AI-powered analysis and suggestions.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Learn from real interview experiences shared by candidates from top companies.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy controls.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer at Google",
      content: "InterviewHub helped me prepare for my Google interview. The AI suggestions were spot-on and the community experiences were incredibly valuable!",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Rahul Verma",
      role: "SDE at Microsoft",
      content: "The real interview experiences shared by other candidates gave me the confidence I needed. Got my dream job at Microsoft!",
      rating: 5,
      avatar: "RV"
    },
    {
      name: "Sneha Gupta",
      role: "Developer at Amazon",
      content: "Amazing platform! The AI-powered preparation helped me understand exactly what to expect in my Amazon interviews.",
      rating: 5,
      avatar: "SG"
    }
  ];

  const stats = [
    { number: statsLoading ? "..." : realTimeStats.experiences, label: "Interview Experiences" },
    { number: statsLoading ? "..." : realTimeStats.successRate, label: "Success Rate" },
    { number: statsLoading ? "..." : realTimeStats.companies, label: "Companies Covered" },
    { number: statsLoading ? "..." : realTimeStats.users, label: "Happy Users" }
  ];

  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Interview Insights",
    "description": "Join thousands of successful candidates who've used real interview experiences and AI insights to land their dream jobs",
    "url": "https://your-domain.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": realTimeStats.experiences || "1000",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Interview Prep Dashboard - Interview Insights"
          description="Continue your journey to interview success with AI-powered insights and community experiences. Access your personalized interview preparation dashboard."
          keywords="interview dashboard, personalized interview prep, AI interview coaching, interview preparation platform, job interview help"
          schema={homePageSchema}
        />
        <Header />
        
        {/* Welcome Back Hero */}
        <main id="main-content">
        <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary/80 text-primary-foreground py-20">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="container mx-auto px-4 relative">
            <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm">Welcome back, {getDisplayName()}!</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Your Interview Prep Dashboard
              </h1>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Continue your journey to interview success with AI-powered insights and community experiences.
              </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link to="/chat">
                   <Button size="lg" variant="secondary" className="hover-scale">
                     <MessageSquare className="mr-2 h-5 w-5" />
                     AI Prep Chat
                   </Button>
                 </Link>
                 <Link to="/resume-ats">
                   <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary hover-scale">
                     <FileText className="mr-2 h-5 w-5" />
                     Resume ATS Optimizer
                   </Button>
                 </Link>
                 <Link to="/submit">
                   <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary hover-scale">
                     <FileText className="mr-2 h-5 w-5" />
                     Share Experience
                   </Button>
                 </Link>
               </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Experiences and Search */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Explore Interview Experiences
              </h2>
              <p className="text-xl text-muted-foreground mb-4">
                Discover top-rated experiences and search by company, role, or keywords
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">Help Fellow Candidates Succeed!</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Experienced professionals - your interview insights can make a huge difference for freshers starting their career journey. 
                  Share your experiences to help the next generation of candidates prepare better and land their dream jobs.
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="top-experiences" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8" data-tour="experience-tabs">
                <TabsTrigger value="top-experiences" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Top Rated
                </TabsTrigger>
                <TabsTrigger value="all-experiences" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  All Experiences
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>
              <TabsContent value="top-experiences">
                <TopExperiences limit={5} />
              </TabsContent>
              <TabsContent value="all-experiences">
                <AllExperiences limit={5} />
              </TabsContent>
              <TabsContent value="search">
                <SearchExperiences />
              </TabsContent>
              <TabsContent value="advanced" className="space-y-6">
                <AdvancedFilters 
                  onFiltersChange={setFilters}
                />
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value: 'rating' | 'recent' | 'upvotes') => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="upvotes">Most Upvoted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FilteredExperiences 
                  filters={filters}
                  sortBy={sortBy}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* About Us Section */}
        <AboutUs />
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Interview Insights - Master Your Dream Interview"
        description="Join thousands of successful candidates who've used real interview experiences and AI insights to land their dream jobs. Share and discover interview experiences to ace your next job interview."
        keywords="interview preparation, job interview, interview questions, interview experiences, AI interview prep, interview tips, career advice, job search"
        schema={homePageSchema}
      />
      <Header />
      
      {/* Hero Section */}
      <main id="main-content">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-sm">AI-Powered Interview Preparation</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Master Your
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dream Interview
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
              Join thousands of successful candidates who've used real interview experiences and AI insights to land their dream jobs.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400">{stat.number}</div>
                  <div className="text-sm text-primary-foreground/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
               Why Choose Interview Insights?
             </h2>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
               Everything you need to ace your next interview - from resume optimization to AI-powered preparation and real candidate experiences.
             </p>
           </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`relative overflow-hidden border-0 bg-gradient-to-br ${feature.gradient} p-[1px] hover-scale animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bg-background rounded-lg p-6 h-full">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Experiences Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real Interview Experiences
            </h2>
              <p className="text-xl text-muted-foreground mb-4">
                See what top-rated experiences look like from candidates at leading companies
              </p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-lg font-semibold text-foreground">Experienced Professionals - Share Your Journey!</h3>
                </div>
                <p className="text-muted-foreground text-center">
                  Your interview experiences are invaluable to freshers and junior professionals. Help them by sharing your stories, 
                  tips, and insights. Every experience you share can guide someone toward their career breakthrough.
                </p>
              </div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="top-experiences" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="top-experiences" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Top Rated
                </TabsTrigger>
                <TabsTrigger value="all-experiences" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  All Experiences
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>
              <TabsContent value="top-experiences">
                <TopExperiences limit={5} />
              </TabsContent>
              <TabsContent value="all-experiences">
                <AllExperiences limit={5} />
              </TabsContent>
              <TabsContent value="search">
                <SearchExperiences />
              </TabsContent>
              <TabsContent value="advanced" className="space-y-6">
                <AdvancedFilters 
                  onFiltersChange={setFilters}
                />
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value: 'rating' | 'recent' | 'upvotes') => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="upvotes">Most Upvoted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FilteredExperiences 
                  filters={filters}
                  sortBy={sortBy}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join the Community
              </h2>
              <p className="text-xl text-muted-foreground">
                Get started with your free account to access all features
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card className="hover-scale">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="flex bg-muted rounded-lg p-1">
                      <Button
                        variant={authMode === 'login' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setAuthMode('login')}
                        className="rounded-md"
                      >
                        Login
                      </Button>
                      <Button
                        variant={authMode === 'signup' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setAuthMode('signup')}
                        className="rounded-md"
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-center">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {authMode === 'login' 
                      ? 'Sign in to continue your journey' 
                      : 'Join thousands of successful candidates'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            disabled={isLoading}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input
                          id="full-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min 6 characters)"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Free Account'
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground">
              Here's what our community members say about their experience
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6 italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{testimonials[currentTestimonial].name}</div>
                      <div className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of successful candidates who've transformed their interview game with InterviewHub.
          </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/auth">
               <Button size="lg" variant="secondary" className="hover-scale">
                 <Award className="mr-2 h-5 w-5" />
                 Start Free Today
               </Button>
             </Link>
             <Link to="/resume-ats">
               <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary hover-scale">
                 <FileText className="mr-2 h-5 w-5" />
                 Try Resume ATS
               </Button>
             </Link>
           </div>
        </div>
      </section>

      {/* About Us Section */}
      <AboutUs />
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
