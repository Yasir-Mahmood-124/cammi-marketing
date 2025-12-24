// src/components/onboarding/tours/DocumentPreviewTour.tsx

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

export const DocumentPreviewTourSteps: Step[] = [
  {
    target: '[data-tour="submit-for-review"]',
    content: "Want expert eyes on your document? Click here to submit it for professional review.",
    placement: "top",
    disableBeacon: true,
    hideCloseButton: true,
    disableScrolling: true,
    floaterProps: {
      disableFlip: true,
    },
    styles: {
      ...commonStepStyles,
      tooltip: {
        ...commonStepStyles.tooltip,
        maxWidth: "320px",
      },
    },
    data: {
      title: "Submit for Review",
      stepNumber: 1,
      totalSteps: 1,
    },
  },
];