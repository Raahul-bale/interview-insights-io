import { useState, useCallback, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Target, 
  TrendingUp,
  Lightbulb,
  Download,
  Zap,
  Shield,
  Award,
  Eye
} from "lucide-react";

interface ATSAnalysis {
  overallScore: number;
  keywordMatch: number;
  formatScore: number;
  readabilityScore: number;
  suggestions: string[];
  strengths: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
  jobSpecificFeedback?: string;
}

const ResumeATSPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);
  }, [toast]);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload your resume first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Read the file content
      const fileContent = await readFileContent(selectedFile);
      
      // Call the edge function for local analysis
      const { data, error } = await supabase.functions.invoke('resume-ats-analysis', {
        body: {
          resumeContent: fileContent,
          jobDescription: jobDescription.trim() || null,
          fileName: selectedFile.name
        }
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      toast({
        title: "Analysis Complete!",
        description: jobDescription.trim() 
          ? "Your resume has been analyzed against the job description."
          : "Your resume has been analyzed for general ATS compatibility.",
      });
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to read file content
  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      // For PDF files, we'll get binary data, but for now we'll just read as text
      // In a production app, you'd want to use a PDF parser
      if (file.type === 'application/pdf') {
        // For now, show a message that PDF parsing isn't fully implemented
        resolve(`PDF file: ${file.name}\nNote: PDF text extraction is simplified. For best results, upload a .docx file or copy/paste your resume content.`);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Resume ATS Optimizer - Coming Soon | Interview Insights"
        description="Our comprehensive ATS optimization tool is launching soon. Get ready to optimize your resume for Applicant Tracking Systems with AI-powered analysis and recommendations."
        keywords="resume ATS, applicant tracking system, resume optimization, keyword analysis, resume scanner, ATS friendly resume, coming soon"
      />
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Resume ATS Optimizer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive resume analysis and optimization tool will be launched soon. Get ready to boost your chances of getting past Applicant Tracking Systems.
            </p>
          </div>

          {/* Coming Soon Section */}
          <Card className="mb-12">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Launching Soon!</h3>
                <p className="text-muted-foreground mb-6">
                  We're putting the finishing touches on our comprehensive ATS optimization tool. 
                  It will include advanced keyword analysis, format scoring, and personalized recommendations 
                  to help your resume stand out to both ATS systems and recruiters.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold mb-2">What to expect:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI-powered keyword optimization</li>
                    <li>• ATS compatibility scoring</li>
                    <li>• Job-specific recommendations</li>
                    <li>• Format and readability analysis</li>
                    <li>• Downloadable optimization reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>ATS Optimization Tips</CardTitle>
              <CardDescription>
                Follow these best practices to make your resume ATS-friendly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Use Standard Headings</h4>
                  <p className="text-sm text-muted-foreground">
                    Stick to conventional section titles like "Work Experience," "Education," and "Skills."
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Include Keywords</h4>
                  <p className="text-sm text-muted-foreground">
                    Mirror keywords from the job description throughout your resume naturally.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Simple Formatting</h4>
                  <p className="text-sm text-muted-foreground">
                    Avoid complex layouts, tables, and graphics that ATS systems can't parse.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Quantify Achievements</h4>
                  <p className="text-sm text-muted-foreground">
                    Use numbers and percentages to demonstrate your impact and results.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Standard File Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Submit your resume as a .docx or .pdf file for best compatibility.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Contact Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Include phone number, email, and LinkedIn profile in a clear format.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResumeATSPage;