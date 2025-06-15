import { useState, useEffect } from 'react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showNext?: boolean;
  showPrev?: boolean;
  showSkip?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="header-logo"]',
    title: 'Welcome to Interview Insights! 🎉',
    content: 'Your one-stop platform for interview preparation. Click here anytime to return to the homepage.',
    placement: 'bottom',
    showNext: true,
    showSkip: true
  },
  {
    target: '[data-tour="nav-home"]',
    title: 'Navigation Menu',
    content: 'Navigate between different sections of the platform. The Home page shows all interview experiences.',
    placement: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="nav-submit"]',
    title: 'Share Your Experience 📝',
    content: 'Share your own interview experience to help other candidates. This builds our community knowledge base.',
    placement: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="nav-chat"]',
    title: 'AI Prep Chat 🤖',
    content: 'Get personalized interview advice and practice with our AI assistant. Perfect for last-minute prep!',
    placement: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Theme Toggle 🌓',
    content: 'Switch between light and dark themes to match your preference and reduce eye strain.',
    placement: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="user-menu"]',
    title: 'User Menu 👤',
    content: 'Access your profile, settings, and logout options. Manage your account and preferences here.',
    placement: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="experience-tabs"]',
    title: 'Experience Categories 📊',
    content: 'Browse experiences by Top Rated (highest quality), All Experiences, Search specific companies/roles, or use Advanced filters.',
    placement: 'top',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="experience-card"]',
    title: 'Experience Cards 📋',
    content: 'Each card shows a real interview experience with company, role, rating, and key details. Click to read the full experience.',
    placement: 'top',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="upvote-button"]',
    title: 'Upvote System 👍',
    content: 'Upvote helpful experiences to help others find the most valuable content. Your upvotes improve the community.',
    placement: 'top',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="star-rating"]',
    title: 'Rating System ⭐',
    content: 'Rate experiences from 1-5 stars based on how helpful they were for your preparation.',
    placement: 'top',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="search-box"]',
    title: 'Smart Search 🔍',
    content: 'Search by company name, job role, interview type, or keywords. Find exactly what you need to prepare.',
    placement: 'bottom',
    showNext: true,
    showPrev: true,
    showSkip: true
  },
  {
    target: '[data-tour="advanced-filters"]',
    title: 'Advanced Filters 🔧',
    content: 'Filter experiences by company, role, experience level, interview difficulty, and more for targeted preparation.',
    placement: 'top',
    showNext: true,
    showPrev: true,
    showSkip: true
  }
];

export const useTour = (user?: any) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('interview-insights-tour-completed');
    const seenTour = tourCompleted === 'true';
    setHasSeenTour(seenTour);
    
    // Auto-start tour for authenticated new users only
    if (!seenTour && user) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [user]);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setHasSeenTour(true);
    localStorage.setItem('interview-insights-tour-completed', 'true');
  };

  const resetTour = () => {
    localStorage.removeItem('interview-insights-tour-completed');
    setHasSeenTour(false);
    startTour();
  };

  return {
    isActive,
    currentStep,
    currentStepData: TOUR_STEPS[currentStep],
    totalSteps: TOUR_STEPS.length,
    hasSeenTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour
  };
};