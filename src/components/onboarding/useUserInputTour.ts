// src/components/onboarding/useUserInputTour.ts

"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { useOnboarding } from './OnboardingProvider';
import { UserInputTourSteps, UserInputRegenerateStep } from './tours/UserInputTour';

interface UseUserInputTourProps {
  isReady: boolean;  // Are the components rendered and ready?
  hasAnswer: boolean; // Does the current question have an answer?
}

export const useUserInputTour = (isReady: boolean, hasAnswer: boolean = false) => {
  const { startTour, isTourActive, currentTour } = useOnboarding();
  const [hasStartedInitialTour, setHasStartedInitialTour] = useState(false);
  const [hasShownRegenerateStep, setHasShownRegenerateStep] = useState(false);
  const tourInitialized = useRef(false);

  // Check if user needs this tour
  const shouldRunTour = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('❌ [User Input Tour] No user in localStorage');
        return false;
      }

      const user = JSON.parse(userStr);
      const needsTour = user.user_input_status === false;
      
      console.log('🔍 [User Input Tour] Checking tour status:', {
        user_input_status: user.user_input_status,
        needsTour,
        isReady,
        hasAnswer,
        tourInitialized: tourInitialized.current
      });
      
      return needsTour;
    } catch (error) {
      console.error('❌ [User Input Tour] Error checking tour status:', error);
      return false;
    }
  }, [isReady, hasAnswer]);

  // STEP 1-3: Start initial tour when components are ready
  useEffect(() => {
    console.log('🔍 [User Input Tour] Mount effect triggered', {
      isReady,
      tourInitialized: tourInitialized.current,
      hasStartedInitialTour,
      isTourActive,
      currentTour
    });

    // Don't run if components aren't ready
    if (!isReady) {
      console.log('⏸️ [User Input Tour] Components not ready yet');
      return;
    }

    // Prevent multiple initializations
    if (tourInitialized.current) {
      console.log('⏸️ [User Input Tour] Tour already initialized');
      return;
    }

    // Check if we should run the tour
    if (!shouldRunTour()) {
      console.log('✅ [User Input Tour] Tour already completed or not needed');
      return;
    }

    // Check if tour is already active
    if (isTourActive && currentTour === 'user_input') {
      console.log('⏸️ [User Input Tour] Tour already active');
      return;
    }

    // Mark as initialized immediately to prevent race conditions
    tourInitialized.current = true;
    
    console.log('🎬 [User Input Tour] All conditions met! Starting tour in 800ms...');
    
    const timer = setTimeout(() => {
      console.log('🚀 [User Input Tour] Starting initial tour (steps 1-3)...');
      startTour('user_input', UserInputTourSteps);
      setHasStartedInitialTour(true);
    }, 800);

    return () => {
      console.log('🧹 [User Input Tour] Cleaning up mount effect');
      clearTimeout(timer);
    };
  }, [isReady, shouldRunTour, isTourActive, currentTour, startTour, hasStartedInitialTour]);

  // STEP 4: Add regenerate step when answer appears
  useEffect(() => {
    console.log('🔍 [User Input Tour] Regenerate effect triggered', {
      hasAnswer,
      hasStartedInitialTour,
      hasShownRegenerateStep,
      isTourActive,
      shouldRunTour: shouldRunTour()
    });

    // Don't show step 4 if we've already shown it
    if (hasShownRegenerateStep) {
      console.log('⏸️ [User Input Tour] Regenerate step already shown');
      return;
    }

    // Don't show if initial tour hasn't started
    if (!hasStartedInitialTour) {
      console.log('⏸️ [User Input Tour] Initial tour not started yet');
      return;
    }

    // Don't show if user doesn't need tour anymore
    if (!shouldRunTour()) {
      console.log('✅ [User Input Tour] Tour completed, not showing regenerate step');
      return;
    }

    // Don't show if tour is currently active (wait for it to finish)
    if (isTourActive) {
      console.log('⏸️ [User Input Tour] Tour is active, waiting to show regenerate step');
      return;
    }

    // Don't show if no answer yet
    if (!hasAnswer) {
      console.log('⏸️ [User Input Tour] No answer yet, waiting for user to generate one');
      return;
    }

    // All conditions met - show step 4
    console.log('🔄 [User Input Tour] All conditions met for regenerate step!');
    
    const timer = setTimeout(() => {
      console.log('🚀 [User Input Tour] Starting regenerate step (step 4/4)...');
      startTour('user_input', [UserInputRegenerateStep]);
      setHasShownRegenerateStep(true);
    }, 1500); // Give time for regenerate button to render

    return () => {
      console.log('🧹 [User Input Tour] Cleaning up regenerate effect');
      clearTimeout(timer);
    };
  }, [
    hasAnswer,
    hasStartedInitialTour,
    hasShownRegenerateStep,
    isTourActive,
    shouldRunTour,
    startTour
  ]);

  // Restart tour function (for debugging or manual restart)
  const restartTour = useCallback(() => {
    console.log('🔄 [User Input Tour] Manually restarting tour...');
    
    // Reset all states
    tourInitialized.current = false;
    setHasStartedInitialTour(false);
    setHasShownRegenerateStep(false);
    
    // Start fresh
    setTimeout(() => {
      startTour('user_input', UserInputTourSteps);
      setHasStartedInitialTour(true);
      tourInitialized.current = true;
    }, 500);
  }, [startTour]);

  return {
    restartTour,
    isTourActive: isTourActive && currentTour === 'user_input',
  };
};