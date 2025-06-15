import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { TourProvider } from "./contexts/TourContext";
import HomePage from "./pages/HomePage";
import SubmitExperience from "./pages/SubmitExperience";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import ExperienceDetailPage from "./pages/ExperienceDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import ResumeATSPage from "./pages/ResumeATSPage";
import InterviewExperiencesPage from "./pages/InterviewExperiencesPage";
import ChatConversationPage from "./pages/ChatConversationPage";
import ChatConversationsPage from "./pages/ChatConversationsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TourOverlay from "./components/TourOverlay";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TourProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <TourOverlay />
            <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/submit" 
              element={
                <ProtectedRoute>
                  <SubmitExperience />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit/:id" 
              element={
                <ProtectedRoute>
                  <SubmitExperience />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:conversationId" 
              element={
                <ProtectedRoute>
                  <ChatConversationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/conversations" 
              element={
                <ProtectedRoute>
                  <ChatConversationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/experience/:id" 
              element={
                <ProtectedRoute>
                  <ExperienceDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-ats" 
              element={
                <ProtectedRoute>
                  <ResumeATSPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/interview-experiences" element={<InterviewExperiencesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            {/* Redirect old routes to new auth page */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </TourProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
