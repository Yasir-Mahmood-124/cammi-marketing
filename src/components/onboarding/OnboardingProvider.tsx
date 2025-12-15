// src/components/onboarding/OnboardingProvider.tsx

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { usePathname } from 'next/navigation';

export type TourType = 'dashboard' | 'user_input' | 'document_preview' | 'final_preview';

interface OnboardingContextType {
  startTour: (tourType: TourType, steps: Step[]) => void;
  stopTour: () => void;
  isTourActive: boolean;
  currentTour: TourType | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const joyrideStyles: Styles = {
  options: {
    primaryColor: '#1976d2',
    textColor: '#333',
    backgroundColor: '#fff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    arrowColor: '#fff',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: 8,
    fontSize: 16,
  },
  tooltipContainer: {
    textAlign: 'left',
  },
  buttonNext: {
    backgroundColor: '#1976d2',
    borderRadius: 4,
    fontSize: 14,
    padding: '8px 16px',
  },
  buttonBack: {
    color: '#666',
    marginRight: 10,
  },
  buttonSkip: {
    color: '#999',
  },
} as Styles;

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentTour, setCurrentTour] = useState<TourType | null>(null);
  const pathname = usePathname();

  // Check if user needs onboarding on mount
  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const user = JSON.parse(userStr);
        
        // If user hasn't completed overall onboarding, check page-specific tours
        if (user.onboarding_status === false) {
          // Map routes to tour types
          const tourMapping: Record<string, TourType> = {
            '/dashboard': 'dashboard',
            '/views/ICP': 'user_input',
            '/views/data-upload': 'document_preview',
            '/views/final-preview': 'final_preview',
          };

          const tourType = tourMapping[pathname];
          if (tourType) {
            // Check the specific tour status in user object
            let tourCompleted = false;
            
            if (tourType === 'dashboard') {
              tourCompleted = user.dashboard_status === true;
            } else if (tourType === 'user_input') {
              tourCompleted = user.user_input_status === true;
            } else if (tourType === 'document_preview') {
              tourCompleted = user.document_preview_status === true;
            } else if (tourType === 'final_preview') {
              tourCompleted = user.final_preview_status === true;
            }
            
            // Auto-start tour if not completed for this page
            if (!tourCompleted) {
              setTimeout(() => {
                console.log(`Ready to start ${tourType} tour`);
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [pathname]);

  const startTour = useCallback((tourType: TourType, tourSteps: Step[]) => {
    setCurrentTour(tourType);
    setSteps(tourSteps);
    setRun(true);
  }, []);

  const stopTour = useCallback(() => {
    setRun(false);
    setCurrentTour(null);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Update tour status in user object
      if (currentTour) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            
            // ✅ Explicitly update the specific status based on tour type
            if (currentTour === 'dashboard') {
              user.dashboard_status = true;
            } else if (currentTour === 'user_input') {
              user.user_input_status = true;
            } else if (currentTour === 'document_preview') {
              user.document_preview_status = true;
            } else if (currentTour === 'final_preview') {
              user.final_preview_status = true;
            }
            
            // Check if all tours are completed
            const allToursCompleted = 
              user.dashboard_status === true &&
              user.user_input_status === true &&
              user.document_preview_status === true &&
              user.final_preview_status === true;

            // Update overall onboarding status if all tours complete
            if (allToursCompleted) {
              user.onboarding_status = true;
            }

            // ✅ Save the updated user object back to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            
            console.log(`✅ ${currentTour} tour completed!`);
            console.log('Updated user object:', user);
          }
        } catch (error) {
          console.error('Error updating tour status:', error);
        }
      }
      
      setCurrentTour(null);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        startTour,
        stopTour,
        isTourActive: run,
        currentTour,
      }}
    >
      {children}
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        styles={joyrideStyles}
        callback={handleJoyrideCallback}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};