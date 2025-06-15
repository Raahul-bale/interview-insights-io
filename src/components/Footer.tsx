import { Link } from "react-router-dom";
import { BookOpen, Shield, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Interview Insights</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Empowering candidates with real interview experiences and AI-powered preparation tools to land their dream jobs.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Reliable Information</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign Up / Login
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:baleraahul@gmail.com?subject=Query from Interview Experience App" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Reliable Information Commitment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Interview Insights. All rights reserved.
            </p>
            <p className="mt-2 md:mt-0">
              Built with ❤️ to help candidates succeed in their career journey.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;