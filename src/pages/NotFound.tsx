
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if this is an auth redirect error
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    
    if (error) {
      console.error("Auth redirect error:", error, urlParams.get('error_description'));
      // Redirect to auth page after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 3000);
    } else {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname, location.search]);

  // Check if this is an auth-related error
  const urlParams = new URLSearchParams(location.search);
  const isAuthError = urlParams.has('error');

  if (isAuthError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">
            There was an issue with your authentication. You'll be redirected to the login page shortly.
          </p>
          <Link to="/auth">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
