import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Users, CheckCircle } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms & Conditions - Interview Insights"
        description="Read our terms of service, privacy policy, and reliable information commitment for Interview Insights platform."
        keywords="terms of service, privacy policy, user agreement, reliable information"
      />
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-muted-foreground">
              Your rights, our commitments, and how we work together
            </p>
          </div>

          <div className="space-y-8">
            {/* Reliable Information Commitment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Our Commitment to Reliable Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  At Interview Insights, we are committed to maintaining the highest standards of information reliability and accuracy:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">All interview experiences are submitted by real users and verified for authenticity</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">We moderate content to ensure it meets quality standards and provides genuine value</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Our AI recommendations are based on aggregated data from thousands of verified experiences</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">We continuously update our platform to reflect current industry trends and practices</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Terms of Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Terms of Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p className="text-sm text-muted-foreground">
                    By accessing and using Interview Insights, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">2. User Responsibilities</h3>
                  <p className="text-sm text-muted-foreground">
                    Users must provide accurate information, respect others' privacy, and not share confidential company information beyond what's appropriate for interview preparation.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">3. Content Guidelines</h3>
                  <p className="text-sm text-muted-foreground">
                    All content must be truthful, helpful, and respectful. We reserve the right to moderate and remove content that violates our community standards.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">4. Data Usage</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is used to improve the platform and provide personalized recommendations. We never sell personal information to third parties.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our community thrives on mutual respect and shared learning:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Respect confidentiality and avoid sharing sensitive company information</li>
                  <li>• Help others by sharing your genuine experiences</li>
                  <li>• Maintain professionalism in all interactions</li>
                  <li>• Report any inappropriate content or behavior</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you have any questions about these terms or our platform, please contact us at{" "}
                  <a 
                    href="mailto:baleraahul@gmail.com?subject=Terms and Conditions Query" 
                    className="text-primary hover:underline"
                  >
                    baleraahul@gmail.com
                  </a>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsPage;