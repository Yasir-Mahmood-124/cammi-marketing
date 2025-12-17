// src/components/onboarding/tours/FinalPreviewTour.tsx

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

export const FinalPreviewTourSteps: Step[] = [
  {
    target: '[data-tour="document-preview"]',
    content: "Review all your questions and answers here before generating the document.",
    placement: "right-start",
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
        maxWidth: "250px",
      },
    },
    data: {
      title: "Document Preview",
      stepNumber: 1,
      totalSteps: 2,
    },
  },

  {
    target: '[data-tour="generate-document-button"]',
    content: "Click here to generate and download your final document when you're ready.",
    placement: "top",
    disableBeacon: true,
    hideCloseButton: true,
    styles: {
      ...commonStepStyles,
      tooltip: {
        ...commonStepStyles.tooltip,
        maxWidth: "350px",
      },
    },
    data: {
      title: "Generate Document",
      stepNumber: 2,
      totalSteps: 2,
    },
  },
];