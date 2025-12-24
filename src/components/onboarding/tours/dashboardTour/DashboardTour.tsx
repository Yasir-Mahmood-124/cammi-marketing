// src/components/onboarding/tours/DashboardTour.tsx

"use client";

import { SplashScreen } from "@/assests/icons";
import { Step, TooltipRenderProps } from "react-joyride";
import { Box, Typography, Button } from "@mui/material";

// src/components/onboarding/tours/DashboardTour.tsx

export const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  // Extract custom data from step
  const customData = step.data as any;
  const title = customData?.title || "";
  const description = step.content as string;
  const stepNumber = customData?.stepNumber || index + 1;
  const totalSteps = customData?.totalSteps || 12;

  return (
    <Box
      {...tooltipProps}
      sx={{
        backgroundColor: "#3EA2FF",
        borderRadius: "10px",
        padding: "20px",
        minWidth: "350px",
        maxWidth: "450px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header with title and step counter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#fff",
          }}
        >
          {stepNumber}/{totalSteps}
        </Typography>
      </Box>

      {/* Description */}
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 400,
          color: "#fff",
          lineHeight: 1.6,
          mb: 2.5,
        }}
      >
        {description}
      </Typography>

      {/* Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Back button */}
        {index > 0 && (
          <Button
            {...backProps}
            sx={{
              border: "1px solid #F5F5F5",
              color: "#F5F5F5",
              fontWeight: 400,
              fontSize: "14px",
              textTransform: "none",
              padding: "6px 20px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(245, 245, 245, 0.1)",
                border: "1px solid #F5F5F5",
                color: "#F5F5F5", // Keep text color same on hover
              },
            }}
          >
            Back
          </Button>
        )}

        {index === 0 && <Box />}

        <Box sx={{ display: "flex", gap: 1.5 }}>
          {/* Skip button */}
          {!isLastStep && (
            <Button
              {...skipProps}
              sx={{
                border: "1px solid #F5F5F5",
                color: "#F5F5F5",
                fontWeight: 400,
                fontSize: "14px",
                textTransform: "none",
                padding: "6px 20px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(245, 245, 245, 0.1)",
                  border: "1px solid #F5F5F5",
                  color: "#F5F5F5", // Keep text color same on hover
                },
              }}
            >
              Skip
            </Button>
          )}

          {/* Next/Finish button */}
          <Button
            {...primaryProps}
            sx={{
              backgroundColor: "#F5F5F5",
              color: "#3EA2FF",
              fontWeight: 400,
              fontSize: "14px",
              textTransform: "none",
              padding: "6px 20px",
              borderRadius: "6px",
              border: "none",
              "&:hover": {
                backgroundColor: "#fff",
                color: "#3EA2FF", // Keep text color same on hover
              },
            }}
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
// Styles for all tooltips
const commonStepStyles = {
  options: {
    arrowColor: "#3EA2FF",
    backgroundColor: "#3EA2FF",
    overlayColor: "rgba(0, 0, 0, 0.5)",
    primaryColor: "#3EA2FF",
    textColor: "#fff",
    zIndex: 10000,
    spotlightPadding: -4, // Negative padding to make it tighter
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
    borderRadius: "6px", // Match your sidebar item border radius
  },
};

export const DashboardTourSteps: Step[] = [
  // Step 1: Welcome Splash Screen
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    hideFooter: true,
    hideCloseButton: true,
    disableOverlayClose: false,
    styles: {
      options: {
        width: "auto",
        zIndex: 1400,
      },
      tooltip: {
        padding: 0,
        backgroundColor: "transparent",
        boxShadow: "none",
        border: "none",
      },
      tooltipContainer: {
        padding: 0,
        margin: 0,
        textAlign: "center",
      },
      tooltipContent: {
        padding: 0,
      },
    },
    content: (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: 800,
            height: 280,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              width: 280,
              minWidth: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              "& svg, & img": {
                width: "100%",
                height: "100%",
                display: "block",
              },
            }}
          >
            <SplashScreen />
          </Box>

          <Box
            sx={{
              flex: 1,
              px: 3.5,
              py: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              backgroundColor: "#fff",
            }}
          >
            <Typography
              sx={{
                fontSize: "22px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "#000000", // black shade you were using
                lineHeight: 1.2,
                textAlign: "left",
                mb: 1.5,
              }}
            >
              Hi, I'm Cammi.
            </Typography>

            <Typography
              sx={{
                fontSize: "13px",
                color: "#000",
                fontWeight: 400,
                mb: 1.5,
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              I'm here to make marketing feel simple, not stressful.
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "#858C94",
                fontWeight: 400,
                mb: 1.2,
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              You don't need a big team or endless hours to build something
              great - just a clear plan, a consistent voice, and a little help
              along the way.
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "#858C94",
                fontWeight: 400,
                mb: 1.2,
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              Think of me as your marketing partner, the one who helps you turn
              ideas into action.
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "#858C94",
                fontWeight: 400,
                mb: 1.2,
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              I'll help you stay on message, keep things organized, and give you
              the confidence to move your business forward with clarity and
              ease.
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: 1.5,
                background: "#000000",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textAlign: "left",
              }}
            >
              Let's start by getting to know you a bit better. I have some
              questions then I could put together your go-to-market strategy
              together for you!
            </Typography>
          </Box>
        </Box>
        <Typography
          textAlign="center"
          fontSize={13}
          color="#fff"
          sx={{ mt: 2 }}
        >
          click anywhere to continue
        </Typography>
      </Box>
    ),
  },

  // Step 2: Dashboard
  {
    target: '[data-tour="sidebar-dashboard"]',
    content:
      "Your central hub with recent activity and quick stats right at your fingertips.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Dashboard",
      stepNumber: 1,
      totalSteps: 12,
    },
  },

  // Step 3: Clarify
  {
    target: '[data-tour="sidebar-clarify"]',
    content:
      "Map your business priorities, resources and budget for your upcoming year.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Clarify",
      stepNumber: 2,
      totalSteps: 12,
    },
  },

  // Step 4: Align
  {
    target: '[data-tour="sidebar-align"]',
    content:
      "Break your plan into quarterly chunks and define the key activities for each.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Align",
      stepNumber: 3,
      totalSteps: 12,
    },
  },

  // Step 5: Mobilize
  {
    target: '[data-tour="sidebar-mobilize"]',
    content:
      "Put your plans into action!",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Mobilize",
      stepNumber: 4,
      totalSteps: 12,
    },
  },

  // Step 6: Monitor
  {
    target: '[data-tour="sidebar-monitor"]',
    content: "Monitor your progress and performance.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Monitor",
      stepNumber: 5,
      totalSteps: 12,
    },
  },

  // Step 7: Iterate
  {
    target: '[data-tour="sidebar-iterate"]',
    content: "Get advice and implement improvements",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Iterate",
      stepNumber: 6,
      totalSteps: 12,
    },
  },

  // Step 8: Scheduler
  {
    target: '[data-tour="sidebar-scheduler"]',
    content:
      "Schedule LinkedIn posts or view your content calendar at a glance.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Scheduler",
      stepNumber: 7,
      totalSteps: 12,
    },
  },

  // Step 9: Brand Setup
  {
    target: '[data-tour="sidebar-brand-setup"]',
    content:
      "Add all your existing brand information here to keep everything aligned.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Brand Setup",
      stepNumber: 8,
      totalSteps: 12,
    },
  },

  // Step 10: Feedback
  {
    target: '[data-tour="sidebar-feedback"]',
    content: "Tell us what you think—your feedback helps us get better.",
    placement: "right",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "Feedback",
      stepNumber: 9,
      totalSteps: 12,
    },
  },

  // Step 11: Create Project - CHANGED TO TOP PLACEMENT
  {
    target: '[data-tour="sidebar-create-project"]',
    content:
      "Manage your organizations—switch between them or create a new one anytime.",
    placement: "top", // Changed from "right" to "top"
    disableBeacon: true,
    hideCloseButton: true,
    spotlightClicks: false,
    styles: commonStepStyles,
    data: {
      title: "Create Project",
      stepNumber: 10,
      totalSteps: 12,
    },
  },

  // Step 12: My Documents
  {
    target: '[data-tour="my-documents-section"]',
    content: "Here you can see your created documents.",
    placement: "bottom",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "My Documents",
      stepNumber: 11,
      totalSteps: 12,
    },
  },

  // Step 13: CAMMI Expert Review
  {
    target: '[data-tour="expert-review-section"]',
    content: "Here you can see expert reviewed documents status.",
    placement: "top",
    disableBeacon: true,
    hideCloseButton: true,
    styles: commonStepStyles,
    data: {
      title: "CAMMI Expert Review",
      stepNumber: 12,
      totalSteps: 12,
    },
  },
];
