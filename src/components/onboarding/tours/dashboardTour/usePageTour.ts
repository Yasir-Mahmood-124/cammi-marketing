// src/components/onboarding/tours/dashboardTour/usePageTour.ts

"use client";

import { useEffect, useCallback } from 'react';
import { Step } from 'react-joyride';
import { useOnboarding, TourType } from '../../OnboardingProvider';

interface UsePageTourOptions {
  tourType: TourType;
  steps: Step[];
  autoStart?: boolean;
  delay?: number;
  dependencies?: any[];
}

export const usePageTour = ({
  tourType,
  steps,
  autoStart = true,
  delay = 500,
  dependencies = []
}: UsePageTourOptions) => {
  const { startTour, isTourActive, currentTour } = useOnboarding();

  // Check if this specific tour should run
  const shouldRunTour = useCallback(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;

      const user = JSON.parse(userStr);

      // ✅ Check ONLY the specific tour status - don't check overall onboarding_status
      let tourStatus = false;
      
      if (tourType === 'dashboard') {
        tourStatus = user.dashboard_status === false;
      } else if (tourType === 'user_input') {
        tourStatus = user.user_input_status === false;
      } else if (tourType === 'document_preview') {
        tourStatus = user.document_preview_status === false;
      } else if (tourType === 'final_preview') {
        tourStatus = user.final_preview_status === false;
      }

      // ✅ FIXED: Run tour ONLY if the specific tour is incomplete
      // Don't check onboarding_status because that would restart completed tours
      return tourStatus;
    } catch (error) {
      console.error('Error checking tour status:', error);
      return false;
    }
  }, [tourType]);

  // Auto-start tour on component mount
  useEffect(() => {
    if (!autoStart) return;

    if (shouldRunTour()) {
      const timer = setTimeout(() => {
        console.log(`Starting ${tourType} tour...`);
        startTour(tourType, steps);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, shouldRunTour, startTour, tourType, steps, ...dependencies]);

  // Manual restart function
  const restartTour = useCallback(() => {
    startTour(tourType, steps);
  }, [startTour, tourType, steps]);

  // Check if this specific tour is active
  const isCurrentTourActive = isTourActive && currentTour === tourType;

  return {
    restartTour,
    isTourActive: isCurrentTourActive,
    shouldRunTour: shouldRunTour(),
  };
};