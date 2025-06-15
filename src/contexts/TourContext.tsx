import React, { createContext, useContext } from 'react';
import { useTour } from '@/hooks/useTour';
import { useAuth } from '@/contexts/AuthContext';

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  currentStepData: any;
  totalSteps: number;
  hasSeenTour: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const tourData = useTour(user);

  return (
    <TourContext.Provider value={tourData}>
      {children}
    </TourContext.Provider>
  );
};

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};