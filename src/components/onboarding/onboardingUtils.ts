// src/components/onboarding/onboardingUtils.ts

import { TourType } from './OnboardingProvider';
import { getSessionId } from '@/utils/cookieUtils';

/**
 * Utility functions for managing onboarding status in localStorage user object
 */

export interface UserOnboardingData {
  access_token?: string;
  dashboard_status: boolean;
  document_preview_status: boolean;
  email?: string;
  expiry?: string;
  final_preview_status: boolean;
  id?: string;
  locale?: string | null;
  name?: string;
  onboarding_status: boolean;
  picture?: string;
  session_id?: string;
  sub?: string;
  user_input_status: boolean;
}

// Map tour types to user object keys
const TOUR_STATUS_KEYS: Record<TourType, keyof UserOnboardingData> = {
  dashboard: 'dashboard_status',
  user_input: 'user_input_status',
  document_preview: 'document_preview_status',
  final_preview: 'final_preview_status',
};

/**
 * Get user object from localStorage
 */
const getUser = (): Partial<UserOnboardingData> | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Save user object to localStorage
 */
const saveUser = (user: Partial<UserOnboardingData>): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

/**
 * Get the status of a specific tour
 */
export const getTourStatus = (tourType: TourType): boolean => {
  const user = getUser();
  if (!user) return false;
  
  const key = TOUR_STATUS_KEYS[tourType];
  return user[key] === true;
};

/**
 * Set the status of a specific tour
 * @param tourType - The tour to update
 * @param completed - Whether the tour is completed
 * @param syncToBackend - Optional function to sync status to backend
 */
export const setTourStatus = async (
  tourType: TourType, 
  completed: boolean,
  syncToBackend?: (tourType: TourType, status: boolean) => Promise<void>
): Promise<void> => {
  const user = getUser();
  if (!user) return;
  
  const key = TOUR_STATUS_KEYS[tourType];
  (user[key] as boolean) = completed;
  
  // Check if all tours are complete and update overall onboarding status
  updateOverallOnboardingStatus(user);
  
  saveUser(user);

  // ✅ Optionally sync to backend
  if (syncToBackend && completed) {
    try {
      await syncToBackend(tourType, completed);
    } catch (error) {
      console.error('Failed to sync tour status to backend:', error);
    }
  }
};

/**
 * Get overall onboarding status
 */
export const getOnboardingStatus = (): boolean => {
  const user = getUser();
  return user?.onboarding_status === true;
};

/**
 * Update overall onboarding status based on individual tour statuses
 */
export const updateOverallOnboardingStatus = (user?: Partial<UserOnboardingData>): void => {
  const userData = user || getUser();
  if (!userData) return;

  const allToursComplete = 
    userData.dashboard_status === true &&
    userData.user_input_status === true &&
    userData.document_preview_status === true &&
    userData.final_preview_status === true;

  if (allToursComplete) {
    userData.onboarding_status = true;
    if (!user) {
      saveUser(userData);
    }
  }
};

/**
 * Reset all onboarding statuses (useful for testing or re-onboarding)
 */
export const resetOnboardingStatus = (): void => {
  const user = getUser();
  if (!user) return;

  user.dashboard_status = false;
  user.user_input_status = false;
  user.document_preview_status = false;
  user.final_preview_status = false;
  user.onboarding_status = false;

  saveUser(user);
};

/**
 * Reset a specific tour status
 */
export const resetTourStatus = (tourType: TourType): void => {
  const user = getUser();
  if (!user) return;

  const key = TOUR_STATUS_KEYS[tourType];
  (user[key] as boolean) = false;
  user.onboarding_status = false;

  saveUser(user);
};

/**
 * Get all onboarding data from localStorage user object
 */
export const getOnboardingData = (): Partial<UserOnboardingData> => {
  const user = getUser();
  return {
    dashboard_status: user?.dashboard_status ?? false,
    user_input_status: user?.user_input_status ?? false,
    document_preview_status: user?.document_preview_status ?? false,
    final_preview_status: user?.final_preview_status ?? false,
    onboarding_status: user?.onboarding_status ?? false,
    email: user?.email,
    name: user?.name,
    picture: user?.picture,
    id: user?.id,
  };
};

/**
 * Check if user needs any onboarding
 */
export const needsOnboarding = (): boolean => {
  return !getOnboardingStatus();
};

/**
 * Get percentage of completed tours
 */
export const getOnboardingProgress = (): number => {
  const user = getUser();
  if (!user) return 0;

  const totalTours = Object.keys(TOUR_STATUS_KEYS).length;
  const completedTours = Object.keys(TOUR_STATUS_KEYS).filter((tourType) =>
    getTourStatus(tourType as TourType)
  ).length;

  return Math.round((completedTours / totalTours) * 100);
};

/**
 * Get the user object
 */
export const getUserData = (): Partial<UserOnboardingData> | null => {
  return getUser();
};

/**
 * ✅ NEW: Prepare payload for backend sync
 */
export const prepareBackendPayload = (tourType: TourType, completed: boolean = true) => {
  const sessionId = getSessionId();
  
  if (!sessionId) {
    console.warn('No session_id found in cookies');
    return null;
  }

  const statusMap: Record<TourType, string> = {
    dashboard: 'dashboard_status',
    user_input: 'user_input_status',
    document_preview: 'document_preview_status',
    final_preview: 'final_preview_status',
  };

  return {
    session_id: sessionId,
    status: {
      [statusMap[tourType]]: completed,
    },
  };
};