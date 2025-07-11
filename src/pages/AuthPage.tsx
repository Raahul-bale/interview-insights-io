
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      let errorMessage = "Invalid email or password";
      
      // Check for specific error codes
      if (error.message?.includes('invalid_credentials') || error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password";
      } else if (error.message?.includes('email_not_confirmed')) {
        errorMessage = "Please check your email and confirm your account before signing in";
      } else if (error.message?.includes('too_many_requests')) {
        errorMessage = "Too many login attempts. Please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully",
      });
      navigate(from, { replace: true });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !confirmPassword || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

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
      if (error.message?.includes('already registered')) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account",
      });
      // Clear form
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');
      setFullName('');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset Email Sent!",
        description: "Please check your email for password reset instructions",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
    
    setIsLoading(false);
  };

  const authPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Login & Sign Up - Interview Insights",
    "description": "Access your Interview Insights account to get AI-powered interview preparation",
    "url": "https://your-domain.com/auth"
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top">
      <SEO 
        title="Login & Sign Up - Interview Insights"
        description="Access your Interview Insights account to get AI-powered interview preparation, share experiences, and connect with the interview prep community."
        keywords="interview insights login, sign up interview prep, interview preparation account, AI interview coaching access"
        canonicalUrl="/auth"
        schema={authPageSchema}
        noIndex={true}
      />
      
      {/* Mobile Header - Enhanced */}
      <div className="flex items-center justify-between p-4 md:p-6 md:hidden border-b">
        <Link to="/" className="flex items-center gap-2 text-primary mobile-touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">II</span>
          </div>
          <h1 className="text-lg font-bold">Interview Insights</h1>
        </div>
        <div className="w-16"></div> {/* Spacer for center alignment */}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md mx-auto mobile-p-4">
          <CardHeader className="text-center space-y-3 md:space-y-4 pb-4 md:pb-6">
            {/* Logo for larger screens */}
            <div className="hidden md:flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">II</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Interview Insights</h1>
              </div>
            </div>
            
            <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold mobile-text-xl">
              Interview Prep Hub
            </CardTitle>
            <CardDescription className="text-sm md:text-base mobile-text-lg">
              Access AI-powered interview preparation and connect with our community
            </CardDescription>
          </CardHeader>
        
          <CardContent className="pt-0 space-y-4 md:space-y-6">
            {showForgotPassword ? (
              // Forgot Password Form - Mobile Enhanced
              <div className="space-y-4 md:space-y-6">
                <div className="text-center space-y-3">
                  <h3 className="text-lg md:text-xl font-semibold mobile-text-xl">Reset Password</h3>
                  <p className="text-sm md:text-base text-muted-foreground mobile-text-lg">
                    Enter your email address and we'll send you a secure link to reset your password.
                  </p>
                </div>
                
                <form onSubmit={handleForgotPassword} className="space-y-4 md:space-y-6">
                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="reset-email" className="text-sm md:text-base mobile-text-lg">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10 md:pl-12 h-12 md:h-14 text-base mobile-touch-target"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 md:h-14 text-base mobile-touch-target btn-mobile" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        Sending Reset Email...
                      </>
                    ) : (
                      'Send Reset Email'
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full h-12 md:h-14 text-base mobile-touch-target"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </form>
              </div>
            ) : (
              // Login/Signup Tabs - Mobile Enhanced
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 h-12 md:h-14">
                  <TabsTrigger 
                    value="login" 
                    className="h-10 md:h-12 text-sm md:text-base mobile-touch-target"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="h-10 md:h-12 text-sm md:text-base mobile-touch-target"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="login-email" className="text-sm md:text-base mobile-text-lg">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="h-12 md:h-14 text-base mobile-touch-target"
                      />
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="login-password" className="text-sm md:text-base mobile-text-lg">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="h-12 md:h-14 pr-12 md:pr-14 text-base mobile-touch-target"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 md:h-14 w-12 md:w-14 hover:bg-transparent mobile-touch-target"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 md:h-5 md:w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm md:text-base mobile-touch-target"
                        onClick={() => setShowForgotPassword(true)}
                        disabled={isLoading}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 md:h-14 text-base mobile-touch-target btn-mobile" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="full-name" className="text-sm md:text-base mobile-text-lg">
                        Full Name
                      </Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isLoading}
                        required
                        className="h-12 md:h-14 text-base mobile-touch-target"
                      />
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="signup-email" className="text-sm md:text-base mobile-text-lg">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="h-12 md:h-14 text-base mobile-touch-target"
                      />
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="signup-password" className="text-sm md:text-base mobile-text-lg">
                        Password
                      </Label>
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
                          className="h-12 md:h-14 pr-12 md:pr-14 text-base mobile-touch-target"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 md:h-14 w-12 md:w-14 hover:bg-transparent mobile-touch-target"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 md:h-5 md:w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="confirm-password" className="text-sm md:text-base mobile-text-lg">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="h-12 md:h-14 pr-12 md:pr-14 text-base mobile-touch-target"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 md:h-14 w-12 md:w-14 hover:bg-transparent mobile-touch-target"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 md:h-5 md:w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 md:h-14 text-base mobile-touch-target btn-mobile" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
