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
    content: "Tell me a bit about your business, and I’ll help shape the document as we go.",
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
    content: "All the questions are here. We’ll go through them together, one by one",
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
    content: "Type your response here. We’ll use it to move forward and build the document together.",
    placement: "top",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Your turn",
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
  content: "If this doesn't feel right, you can regenerate to try a new version - or confirm to move forward with this one.",
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