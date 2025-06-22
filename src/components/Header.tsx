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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User, LogOut, Mail, Edit, BookOpen, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./ThemeToggle";
import TourButton from "./TourButton";
import ChatNotifications from "./ChatNotifications";

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{
    full_name?: string;
    avatar_url?: string;
  }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link to="/" className="flex items-center space-x-2 text-2xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-primary mobile-text-lg" data-tour="header-logo">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
              <span className="text-lg md:text-2xl">Interview Insights</span>
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
                  <Link 
                    to="/conversations" 
                    className="text-foreground hover:text-primary transition-colors"
                    data-tour="nav-conversations"
                  >
                    My Chats
                  </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Desktop navigation actions */}
            <div className="hidden md:flex items-center space-x-3">
              <TourButton />
              <div data-tour="theme-toggle">
                <ThemeToggle />
              </div>
              <ChatNotifications />
              {user ? (
                <div data-tour="user-menu">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        {userProfile.avatar_url && (
                          <AvatarImage src={userProfile.avatar_url} alt="Profile picture" />
                        )}
                        <AvatarFallback className="text-sm font-semibold">
                          {getUserInitials(user.email || '', userProfile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center justify-start gap-3 p-3">
                      <Avatar className="h-12 w-12">
                        {userProfile.avatar_url && (
                          <AvatarImage src={userProfile.avatar_url} alt="Profile picture" />
                        )}
                        <AvatarFallback className="text-sm font-semibold">
                          {getUserInitials(user.email || '', userProfile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{getDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
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

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 pt-4">
                  {user && (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-4">
                      <Avatar className="h-14 w-14">
                        {userProfile.avatar_url && (
                          <AvatarImage src={userProfile.avatar_url} alt="Profile picture" />
                        )}
                        <AvatarFallback className="text-base font-semibold">
                          {getUserInitials(user.email || '', userProfile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none flex-1 min-w-0">
                        <p className="font-semibold text-base">{getDisplayName()}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <Link 
                    to="/" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/interview-experiences" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Experiences
                  </Link>
                  {user && (
                    <>
                      <Link 
                        to="/submit" 
                        className="text-lg font-medium hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Share Experience
                      </Link>
                      <Link 
                        to="/chat" 
                        className="text-lg font-medium hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        AI Prep Chat
                      </Link>
                      <Link 
                        to="/resume-ats" 
                        className="text-lg font-medium hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Resume ATS
                      </Link>
                      <Link 
                        to="/conversations" 
                        className="text-lg font-medium hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Chats
                      </Link>
                      <div className="border-t pt-4 space-y-4">
                        <Link 
                          to="/profile" 
                          className="flex items-center text-lg font-medium hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="mr-3 h-5 w-5" />
                          Profile
                        </Link>
                        <Link 
                          to="/profile?tab=experiences" 
                          className="flex items-center text-lg font-medium hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Edit className="mr-3 h-5 w-5" />
                          My Experiences
                        </Link>
                        <button 
                          onClick={() => {
                            window.location.href = 'mailto:baleraahul@gmail.com?subject=Query from Interview Experience App';
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center text-lg font-medium hover:text-primary transition-colors w-full text-left"
                        >
                          <Mail className="mr-3 h-5 w-5" />
                          Contact Us
                        </button>
                        <button 
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center text-lg font-medium hover:text-primary transition-colors w-full text-left"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                  {!user && (
                    <div className="border-t pt-4 space-y-3">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          Login
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full text-lg">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                  <div className="border-t pt-4 flex justify-center space-x-4">
                    <TourButton />
                    <ThemeToggle />
                    <ChatNotifications />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
