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
        title="Resume ATS Optimizer - Interview Insights"
        description="Optimize your resume for Applicant Tracking Systems (ATS). Get detailed analysis, keyword suggestions, and formatting recommendations to increase your chances of getting noticed by recruiters."
        keywords="resume ATS, applicant tracking system, resume optimization, keyword analysis, resume scanner, ATS friendly resume"
      />
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Free ATS Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Resume ATS Optimizer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Boost your chances of getting past Applicant Tracking Systems with our free, comprehensive resume analysis and optimization tool.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Your Resume
                  </CardTitle>
                  <CardDescription>
                    Upload your resume in PDF, DOC, or DOCX format (max 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="mb-2"
                      onClick={handleChooseFile}
                      type="button"
                    >
                      Choose File
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "No file selected"}
                    </p>
                  </div>
                  
                  {selectedFile && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        File uploaded successfully: {selectedFile.name}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Job Description Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Job Description (Optional)
                  </CardTitle>
                  <CardDescription>
                    Paste the job description to get targeted keyword analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste the job description here to get targeted analysis based on specific job requirements, skills, and qualifications..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                  />
                  {jobDescription.trim() && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Job description provided - analysis will be tailored to this role
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={analyzeResume} 
                disabled={!selectedFile || isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {analysis ? (
                <>
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="mr-2 h-5 w-5" />
                        ATS Compatibility Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}%
                        </div>
                        <p className="text-muted-foreground">Overall ATS Compatibility</p>
                      </div>
                      <Progress 
                        value={analysis.overallScore} 
                        className="h-2 mb-4" 
                      />
                      
                      {/* Detailed Scores */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(analysis.keywordMatch)}`}>
                            {analysis.keywordMatch}%
                          </div>
                          <p className="text-xs text-muted-foreground">Keyword Match</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(analysis.formatScore)}`}>
                            {analysis.formatScore}%
                          </div>
                          <p className="text-xs text-muted-foreground">Format Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Keyword Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-green-600 mb-2 block">
                          Found Keywords ({analysis.keywords.found.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.found.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-red-600 mb-2 block">
                          Missing Keywords ({analysis.keywords.missing.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.missing.map((keyword, index) => (
                            <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5" />
                        Optimization Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Resume Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Download Report */}
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Detailed Report
                  </Button>

                  {/* Job-Specific Feedback */}
                  {analysis.jobSpecificFeedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Target className="mr-2 h-5 w-5" />
                          Job-Specific Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {analysis.jobSpecificFeedback}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
                    <p className="text-muted-foreground">
                      Upload your resume and optionally add a job description for targeted analysis.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

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