import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            InterviewHub
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/submit" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Share Experience
            </Link>
            <Link 
              to="/chat" 
              className="text-foreground hover:text-primary transition-colors"
            >
              AI Prep Chat
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;