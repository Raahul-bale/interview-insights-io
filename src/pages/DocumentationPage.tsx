import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Users, MessageSquare, Star, Database, Code, Shield, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const DocumentationPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Welcome to Interview Insights",
      subtitle: "Master Your Dream Interview",
      content: (
        <div className="text-center space-y-6">
          <div className="relative w-full h-64 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
            <div className="text-6xl">🎯</div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful candidates who've used real interview experiences and AI insights to land their dream jobs. 
            Share and discover interview experiences to ace your next job interview.
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="text-sm">10K+ Experiences</Badge>
            <Badge variant="secondary" className="text-sm">AI-Powered</Badge>
            <Badge variant="secondary" className="text-sm">Real-Time</Badge>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Key Benefits",
      subtitle: "Why Choose Interview Insights?",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-200/50">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Real Success Stories</h3>
              <p className="text-sm text-muted-foreground">Access authentic interview experiences from candidates who got hired</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-200/50">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">Get personalized interview preparation with AI-driven recommendations</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-200/50">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">Connect with fellow job seekers and share valuable insights</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-200/50">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Direct Communication</h3>
              <p className="text-sm text-muted-foreground">Chat directly with experience sharers for detailed insights</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 3,
      title: "Application Features",
      subtitle: "Comprehensive Interview Preparation Platform",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-semibold">Experience Sharing</h4>
              <p className="text-sm text-muted-foreground mt-2">Share detailed interview rounds, questions, and outcomes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-semibold">AI Chat Assistant</h4>
              <p className="text-sm text-muted-foreground mt-2">Get personalized interview prep with AI guidance</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="text-3xl mb-2">⭐</div>
              <h4 className="font-semibold">Rating System</h4>
              <p className="text-sm text-muted-foreground mt-2">Rate and review interview experiences for quality</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <h4 className="font-semibold mb-2">🔍 Advanced Search & Filtering</h4>
              <p className="text-sm text-muted-foreground">Filter by company, role, difficulty, and experience level</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
              <h4 className="font-semibold mb-2">📄 Resume ATS Analysis</h4>
              <p className="text-sm text-muted-foreground">AI-powered resume optimization for better job matching</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Technology Stack",
      subtitle: "Built with Modern Technologies",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <CardContent className="p-4 text-center">
                <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold">Frontend</h4>
                <div className="space-y-1 mt-2">
                  <Badge variant="outline">React 18</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Vite</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10">
              <CardContent className="p-4 text-center">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold">Backend</h4>
                <div className="space-y-1 mt-2">
                  <Badge variant="outline">Supabase</Badge>
                  <Badge variant="outline">PostgreSQL</Badge>
                  <Badge variant="outline">Row Level Security</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold">AI & Security</h4>
                <div className="space-y-1 mt-2">
                  <Badge variant="outline">OpenAI API</Badge>
                  <Badge variant="outline">Vector Search</Badge>
                  <Badge variant="outline">JWT Auth</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <h5 className="font-medium">UI Framework</h5>
              <p className="text-sm text-muted-foreground">Shadcn/ui + Tailwind CSS</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <h5 className="font-medium">State Management</h5>
              <p className="text-sm text-muted-foreground">React Query + Context</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <h5 className="font-medium">Routing</h5>
              <p className="text-sm text-muted-foreground">React Router v6</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <h5 className="font-medium">Forms</h5>
              <p className="text-sm text-muted-foreground">React Hook Form + Zod</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Database Architecture",
      subtitle: "Supabase PostgreSQL with Advanced Features",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Core Tables
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>interview_posts</span>
                    <Badge variant="secondary">Main Content</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>profiles</span>
                    <Badge variant="secondary">User Data</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>experience_ratings</span>
                    <Badge variant="secondary">Reviews</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>chat_conversations</span>
                    <Badge variant="secondary">Messaging</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Advanced Features
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vector Embeddings</span>
                    <Badge variant="outline">AI Search</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Row Level Security</span>
                    <Badge variant="outline">Security</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Real-time Subscriptions</span>
                    <Badge variant="outline">Live Updates</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Edge Functions</span>
                    <Badge variant="outline">Serverless</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Database Highlights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Vector Search:</strong> AI-powered semantic search using pgvector extension for intelligent content discovery
              </div>
              <div>
                <strong>Real-time:</strong> Live updates for chat, ratings, and new experiences using Supabase Realtime
              </div>
              <div>
                <strong>Security:</strong> Comprehensive RLS policies ensuring data privacy and user-specific access control
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "AI Integration",
      subtitle: "Powered by OpenAI and Vector Search",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="relative w-full h-48 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <div className="text-6xl">🤖</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Smart Chat Assistant</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Personalized interview preparation guidance</li>
                  <li>• Context-aware responses based on user queries</li>
                  <li>• Access to relevant interview experiences</li>
                  <li>• Real-time conversation management</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">Vector-Powered Search</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Semantic similarity matching</li>
                  <li>• 1536-dimensional embeddings</li>
                  <li>• Context-aware content discovery</li>
                  <li>• Enhanced search relevance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">AI Features in Action</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Our AI system processes user queries, generates embeddings, and matches them with relevant interview experiences. 
              The chat assistant provides contextual advice while the vector search ensures users find the most relevant content for their specific needs.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "User Experience Flow",
      subtitle: "From Registration to Success",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
              <h4 className="font-semibold mb-2">Sign Up</h4>
              <p className="text-xs text-muted-foreground">Create account with email verification</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
              <h4 className="font-semibold mb-2">Explore</h4>
              <p className="text-xs text-muted-foreground">Browse interview experiences and insights</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
              <h4 className="font-semibold mb-2">Interact</h4>
              <p className="text-xs text-muted-foreground">Chat with AI and connect with users</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">4</div>
              <h4 className="font-semibold mb-2">Succeed</h4>
              <p className="text-xs text-muted-foreground">Ace interviews and share your success</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-center">Key User Journeys</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h5 className="font-medium mb-2">👤 Job Seeker Journey</h5>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Search for specific company/role experiences</li>
                  <li>2. Read detailed interview rounds and questions</li>
                  <li>3. Chat with experience sharers for tips</li>
                  <li>4. Use AI assistant for personalized prep</li>
                  <li>5. Rate helpful experiences</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h5 className="font-medium mb-2">✍️ Contributor Journey</h5>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Share detailed interview experience</li>
                  <li>2. Include questions, difficulty, outcomes</li>
                  <li>3. Respond to chats from interested candidates</li>
                  <li>4. Build reputation through ratings</li>
                  <li>5. Help others succeed in their careers</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: "Security & Privacy",
      subtitle: "Built with Security-First Approach",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-200/50">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground">Secure JWT-based auth with email verification</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50">
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Data Protection</h4>
                <p className="text-sm text-muted-foreground">Row Level Security ensures user data privacy</p>
              </CardContent>
            </Card>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200/50 rounded-lg">
              <div className="p-6 text-center">
                <Code className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">API Security</h4>
                <p className="text-sm text-muted-foreground">Secure API endpoints with rate limiting</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Security Implementation Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 className="font-medium mb-2">🔐 Authentication & Authorization</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• JWT token-based authentication</li>
                  <li>• Email verification required</li>
                  <li>• Role-based access control</li>
                  <li>• Secure password hashing</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">🛡️ Data Security</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Row Level Security (RLS) policies</li>
                  <li>• Encrypted data transmission</li>
                  <li>• Personal data anonymization</li>
                  <li>• GDPR compliant data handling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      title: "Future Roadmap",
      subtitle: "What's Coming Next",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="relative w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg flex items-center justify-center mb-6">
              <div className="text-4xl">🚀</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">🎯 Near Term (Q1-Q2)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mobile app development (React Native)</li>
                  <li>• Advanced AI interview mock sessions</li>
                  <li>• Video interview experience sharing</li>
                  <li>• Company-specific interview guides</li>
                  <li>• Enhanced search filters and sorting</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">🌟 Long Term (Q3-Q4)</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Career path recommendations</li>
                  <li>• Salary negotiation insights</li>
                  <li>• Industry-specific prep modules</li>
                  <li>• Mentor matching system</li>
                  <li>• Integration with job boards</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">💡 Innovation Focus</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              We're committed to continuous improvement and innovation in the interview preparation space.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>AI Enhancement:</strong> More sophisticated AI models for better personalization
              </div>
              <div>
                <strong>Community Growth:</strong> Building a stronger, more engaged user community
              </div>
              <div>
                <strong>Platform Expansion:</strong> Multi-platform availability and accessibility
              </div>
            </div>
          </div>
          <div className="text-center pt-4">
            <p className="text-muted-foreground mb-4">Ready to start your interview preparation journey?</p>
            <Link to="/auth">
              <Button size="lg" className="mr-4">Get Started Now</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">Explore Platform</Button>
            </Link>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <>
      <SEO 
        title="Documentation - Interview Insights"
        description="Comprehensive documentation for Interview Insights application - technology stack, features, and benefits"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                <Home className="h-6 w-6" />
                Interview Insights
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Documentation
                </span>
                <Badge variant="outline">
                  {currentSlide + 1} / {slides.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Slide Content */}
            <Card className="mb-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-white/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold mb-2">{slides[currentSlide].title}</h1>
                  <p className="text-xl text-muted-foreground">{slides[currentSlide].subtitle}</p>
                </div>
                
                <div className="min-h-[400px]">
                  {slides[currentSlide].content}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={prevSlide} 
                variant="outline" 
                disabled={currentSlide === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-primary'
                        : 'bg-muted hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                onClick={nextSlide} 
                variant="outline" 
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Navigation */}
            <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Navigation</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                  {slides.map((slide, index) => (
                    <Button
                      key={slide.id}
                      onClick={() => goToSlide(index)}
                      variant={index === currentSlide ? "default" : "ghost"}
                      size="sm"
                      className="text-xs h-auto p-2 flex flex-col items-center gap-1"
                    >
                      <span className="font-bold">{slide.id}</span>
                      <span className="truncate w-full">{slide.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentationPage;
