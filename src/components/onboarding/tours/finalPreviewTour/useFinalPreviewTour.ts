// src/components/onboarding/tours/finalPreviewTour/useFinalPreviewTour.ts

"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useOnboarding } from '../../OnboardingProvider';
import { FinalPreviewTourSteps } from './FinalPreviewTour';

interface UseFinalPreviewTourProps {
  isReady: boolean; // Are the components rendered and ready?
}

export const useFinalPreviewTour = ({ isReady }: UseFinalPreviewTourProps) => {
  const { startTour, isTourActive, currentTour } = useOnboarding();
  const tourInitialized = useRef(false);

  // Check if user needs this tour
  const shouldRunTour = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('❌ [Final Preview Tour] No user in localStorage');
        return false;
      }

      const user = JSON.parse(userStr);
      const needsTour = user.final_preview_status === false;
      
      console.log('🔍 [Final Preview Tour] Checking tour status:', {
        final_preview_status: user.final_preview_status,
        needsTour,
        isReady,
        tourInitialized: tourInitialized.current
      });
      
      return needsTour;
    } catch (error) {
      console.error('❌ [Final Preview Tour] Error checking tour status:', error);
      return false;
    }
  }, [isReady]);

  // Start tour when components are ready
  useEffect(() => {
    console.log('🔍 [Final Preview Tour] Mount effect triggered', {
      isReady,
      tourInitialized: tourInitialized.current,
      isTourActive,
      currentTour
    });

    // Don't run if components aren't ready
    if (!isReady) {
      console.log('⏸️ [Final Preview Tour] Components not ready yet');
      return;
    }

    // Prevent multiple initializations
    if (tourInitialized.current) {
      console.log('⏸️ [Final Preview Tour] Tour already initialized');
      return;
    }

    // Check if we should run the tour
    if (!shouldRunTour()) {
      console.log('✅ [Final Preview Tour] Tour already completed or not needed');
      return;
    }

    // Check if tour is already active
    if (isTourActive && currentTour === 'final_preview') {
      console.log('⏸️ [Final Preview Tour] Tour already active');
      return;
    }

    // Mark as initialized to prevent race conditions
    tourInitialized.current = true;
    
    console.log('🎬 [Final Preview Tour] All conditions met! Starting tour in 800ms...');
    
    const timer = setTimeout(() => {
      console.log('🚀 [Final Preview Tour] Starting tour...');
      startTour('final_preview', FinalPreviewTourSteps);
    }, 800);

    return () => {
      console.log('🧹 [Final Preview Tour] Cleaning up');
      clearTimeout(timer);
    };
  }, [isReady, shouldRunTour, isTourActive, currentTour, startTour]);

  // Restart tour function (for debugging or manual restart)
  const restartTour = useCallback(() => {
    console.log('🔄 [Final Preview Tour] Manually restarting tour...');
    
    // Reset state
    tourInitialized.current = false;
    
    // Start fresh
    setTimeout(() => {
      startTour('final_preview', FinalPreviewTourSteps);
      tourInitialized.current = true;
    }, 500);
  }, [startTour]);

  return {
    restartTour,
    isTourActive: isTourActive && currentTour === 'final_preview',
  };
};