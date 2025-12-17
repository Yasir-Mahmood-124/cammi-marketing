// src/components/onboarding/tours/UserInputTour.tsx

"use client";

import { Step } from "react-joyride";

const commonStepStyles = {
  options: {
    arrowColor: "#3EA2FF",
    backgroundColor: "#3EA2FF",
    overlayColor: "rgba(0, 0, 0, 0.5)",
    primaryColor: "#3EA2FF",
    textColor: "#fff",
    zIndex: 10000,
    spotlightPadding: -4,
  },
  tooltip: {
    padding: 0,
    backgroundColor: "transparent",
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  tooltipContent: {
    padding: 0,
  },
  spotlight: {
    borderRadius: "6px",
  },
};

export const UserInputTourSteps: Step[] = [
  // Step 1: Question Asked
  {
    target: '[data-tour="question-box"]',
    content: "Here you can see the question asked from you. Answer accurately for better results.",
    placement: "bottom",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Question asked",
      stepNumber: 1,
      totalSteps: 4,
      // ✅ NO isPartialCompletion flag - if user skips here, tour completes
    },
  },

  // Step 2: Question List
  {
    target: '[data-tour="question-list"]',
    content: "Here you can see the list of question that are going to be asked from you.",
    placement: "left",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Question List",
      stepNumber: 2,
      totalSteps: 4,
      // ✅ NO isPartialCompletion flag - if user skips here, tour completes
    },
  },

  // Step 3: Your Input
  {
    target: '[data-tour="user-input-field"]',
    content: "Here you can give the answer of the question have been asked from you.",
    placement: "top",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Your Input",
      stepNumber: 3,
      totalSteps: 4,
      // ✅ ONLY THIS STEP has isPartialCompletion
      // This tells the provider to PAUSE here and wait for user to generate answer
      // But if user SKIPS, it will still complete the tour
      isPartialCompletion: true,
    },
  },
];

// Step 4: Regenerate - THIS IS THE FINAL STEP
export const UserInputRegenerateStep: Step = {
  target: '[data-tour="regenerate-button"]',
  content: "Not happy? Regenerate. Want it cleaner? Refine. Easy.",
  placement: "top",
  disableBeacon: true,
  hideCloseButton: true,
  styles: commonStepStyles,
  data: {
    title: "Regenerate",
    stepNumber: 4,
    totalSteps: 4,
    // ✅ NO isPartialCompletion flag - this is the final step
    // When this completes (or is skipped), tour marks complete
  },
};