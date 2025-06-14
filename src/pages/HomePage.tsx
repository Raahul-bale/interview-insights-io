import Header from "@/components/Header";
import ExperienceCard from "@/components/ExperienceCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { user } = useAuth();
  
  // Dummy data for interview experiences
  const experiences = [
    {
      name: "Priya Sharma",
      company: "Google",
      role: "Software Engineer Intern",
      date: "Dec 2024",
      outcome: "Selected",
      rounds: [
        {
          type: "Online Assessment",
          difficulty: "Medium",
          questions: [
            "Two Sum problem with follow-up optimizations",
            "Design a simple cache system"
          ]
        },
        {
          type: "Technical Interview",
          difficulty: "Hard",
          questions: [
            "Implement LRU Cache",
            "System design: Design a URL shortener",
            "Behavioral: Tell me about a challenging project"
          ]
        }
      ]
    },
    {
      name: "Rahul Verma",
      company: "Microsoft",
      role: "SDE Intern",
      date: "Nov 2024",
      outcome: "Not Selected",
      rounds: [
        {
          type: "Coding Round",
          difficulty: "Medium",
          questions: [
            "Binary Tree Level Order Traversal",
            "Find missing number in array"
          ]
        },
        {
          type: "Technical Interview",
          difficulty: "Hard",
          questions: [
            "Design a parking lot system",
            "Optimize database queries for large datasets"
          ]
        }
      ]
    },
    {
      name: "Sneha Gupta",
      company: "Amazon",
      role: "Software Development Engineer",
      date: "Oct 2024",
      outcome: "Selected",
      rounds: [
        {
          type: "Online Test",
          difficulty: "Easy",
          questions: [
            "Array rotation problems",
            "String manipulation tasks"
          ]
        },
        {
          type: "Technical Round 1",
          difficulty: "Medium",
          questions: [
            "Design a recommendation system",
            "Implement merge sort algorithm"
          ]
        },
        {
          type: "Technical Round 2",
          difficulty: "Hard",
          questions: [
            "Leadership principles discussion",
            "Scale a web application architecture"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {user ? `Welcome back, ${user.email?.split('@')[0]}!` : 'Share & Learn from Interview Experiences'}
          </h1>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            {user ? 
              'Access your personalized interview prep dashboard with AI-powered assistance and real candidate experiences.' :
              'Connect with fellow freshers, share your interview journeys, and get AI-powered preparation help'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link to="/submit">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Share Your Experience
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Get AI Interview Help
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Join the Community
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Start Your Prep Journey
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {!user && (
            <div className="mt-6 text-sm text-primary-foreground/80">
              Sign up to access AI-powered interview prep and share experiences
            </div>
          )}
        </div>
      </section>

      {/* Experience Feed */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Recent Interview Experiences
            </h2>
            {user && (
              <Link to="/submit">
                <Button variant="outline">
                  Add Your Story
                </Button>
              </Link>
            )}
          </div>
          
          <div className="grid gap-6 md:gap-8">
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={index}
                {...experience}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          {user ? (
            <>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Share Your Interview Experience?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Help fellow students by sharing your interview journey. Every experience shared helps someone prepare better!
              </p>
              <Link to="/submit">
                <Button size="lg">
                  Share Your Experience
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Join Our Interview Prep Community
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Sign up to access thousands of real interview experiences, AI-powered prep assistance, and connect with fellow candidates.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Get Started - It's Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;