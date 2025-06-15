import { Link } from "react-router-dom";
import SkipLink from "@/components/SkipLink";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Mail, Edit, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
import TourButton from "./TourButton";

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{
    full_name?: string;
    avatar_url?: string;
  }>({});

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const getUserInitials = (email: string, fullName?: string) => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return userProfile.full_name || user?.email || 'User';
  };

  return (
    <>
      <SkipLink />
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary" data-tour="header-logo">
              <BookOpen className="h-8 w-8" />
              <span>Interview Insights</span>
            </Link>
          
           <nav className="hidden md:flex items-center space-x-6">
             <Link 
               to="/" 
               className="text-foreground hover:text-primary transition-colors"
               data-tour="nav-home"
             >
               Home
             </Link>
             <Link 
               to="/interview-experiences" 
               className="text-foreground hover:text-primary transition-colors"
               data-tour="nav-experiences"
             >
               Experiences
             </Link>
            {user && (
              <>
                <Link 
                  to="/submit" 
                  className="text-foreground hover:text-primary transition-colors"
                  data-tour="nav-submit"
                >
                  Share Experience
                </Link>
                 <Link 
                   to="/chat" 
                   className="text-foreground hover:text-primary transition-colors"
                   data-tour="nav-chat"
                 >
                   AI Prep Chat
                 </Link>
                 <Link 
                   to="/resume-ats" 
                   className="text-foreground hover:text-primary transition-colors"
                   data-tour="nav-ats"
                 >
                   Resume ATS
                 </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <TourButton />
            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>
            {user ? (
              <div data-tour="user-menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {userProfile.avatar_url && (
                        <AvatarImage src={userProfile.avatar_url} alt="Profile picture" />
                      )}
                      <AvatarFallback>
                        {getUserInitials(user.email || '', userProfile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getDisplayName()}</p>
                      {userProfile.full_name && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=experiences" className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      <span>My Experiences</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = 'mailto:baleraahul@gmail.com?subject=Query from Interview Experience App'}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contact Us</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;