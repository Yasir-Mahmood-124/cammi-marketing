// src/components/onboarding/tours/DashboardTour.tsx

"use client";

import { SplashScreen } from "@/assests/icons";
import { Step } from "react-joyride";
import { Box, Typography } from "@mui/material";

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
            width: 900,
            height: 300,
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <SplashScreen />
          <Box
            sx={{
              flex: 1,
              px: 3,
              py: 2.5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={600} 
                mb={0.8}
                sx={{ 
                  fontSize: "18px",
                  color: "#000"
                }}
              >
                Hi, I'm{" "}
                <Box component="span" sx={{ color: "#FF2E8E" }}>
                  Cammi.
                </Box>
              </Typography>
              <Typography fontSize={12} color="#555" mb={0.6} lineHeight={1.5}>
                I'm here to make marketing feel simple, not stressful.
              </Typography>
              <Typography fontSize={12} color="#555" mb={0.6} lineHeight={1.5}>
                You don't need a big team or endless hours to build something great - just a clear plan, a consistent voice, and a little help along the way.
              </Typography>
              <Typography fontSize={12} color="#555" mb={0.6} lineHeight={1.5}>
                Think of me as your marketing partner, the one who helps you turn ideas into action.
              </Typography>
              <Typography fontSize={12} color="#555" mb={0.8} lineHeight={1.5}>
                I'll help you stay on message, keep things organized, and give you the confidence to move your business forward with clarity and ease.
              </Typography>
              <Typography fontSize={12} fontWeight={500} color="#FF2E8E" lineHeight={1.5}>
                Let's start by getting to know you a bit better. I have ten questions then I could put together your go-to-market strategy together for you!
              </Typography>
            </Box>
          </Box>
        </Box>
        <Typography 
          textAlign="center" 
          fontSize={13} 
          color="#ffffffff"
          sx={{ mt: 2 }}
        >
          click anywhere to continue
        </Typography>
      </Box>
    ),
  },

  // Step 2: Dashboard Side Panel
  {
    target: '[data-tour="sidebar-dashboard"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Dashboard 📊
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Your central hub with recent activity and quick stats right at your fingertips.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 3: Clarify Side Panel
  {
    target: '[data-tour="sidebar-clarify"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Clarify 🎯
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Map your business priorities, resources and budget for your upcoming year.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 4: Align Side Panel
  {
    target: '[data-tour="sidebar-align"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Align 📋
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Break your plan into quarterly chunks and define the key activities for each.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 5: Mobilize Side Panel
  {
    target: '[data-tour="sidebar-mobilize"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Mobilize 🚀
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Break your plan into quarterly chunks and define the key activities for each.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 6: Monitor Side Panel
  {
    target: '[data-tour="sidebar-monitor"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Monitor 📈
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Monitor your progress and performance.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 7: Iterate Side Panel
  {
    target: '[data-tour="sidebar-iterate"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Iterate 🔄
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Coming Soon: Implement improvements.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 8: Scheduler Side Panel
  {
    target: '[data-tour="sidebar-scheduler"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Scheduler 📅
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Schedule LinkedIn posts or view your content calendar at a glance.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 9: Brand Setup Side Panel
  {
    target: '[data-tour="sidebar-brand-setup"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Brand Setup 🎨
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Add all your existing brand information here to keep everything aligned.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 10: Feedback Side Panel
  {
    target: '[data-tour="sidebar-feedback"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Feedback 💬
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Tell us what you think—your feedback helps us get better.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 11: Create Project Side Panel
  {
    target: '[data-tour="sidebar-create-project"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          Create Project 🏢
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Manage your organizations—switch between them or create a new one anytime.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },

  // Step 12: My Documents
  {
    target: '[data-tour="my-documents-section"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          My Documents 📁
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Here you can see your created documents.
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },

  // Step 13: CAMMI Expert Review
  {
    target: '[data-tour="expert-review-section"]',
    content: (
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "12px", color: "#000", fontSize: "18px", fontWeight: 600 }}>
          CAMMI Expert Review 🎯
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
          Here you can see expert reviewed documents status.
        </p>
      </div>
    ),
    placement: "top",
    disableBeacon: true,
  },

  // Final Step: Completion
  {
    target: "body",
    content: (
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#000", fontSize: "24px", fontWeight: 600 }}>
          You're All Set! 🎉
        </h2>
        <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "15px", lineHeight: "1.6" }}>
          You now know the basics of navigating CAMMI. Feel free to explore and start creating amazing marketing content!
        </p>
        <div style={{ padding: "16px", backgroundColor: "#E8F5E9", borderRadius: "8px", marginTop: "16px" }}>
          <p style={{ margin: 0, color: "#2E7D32", fontSize: "14px", fontWeight: 500 }}>
            ✨ Ready to get started? Click "Finish" to begin your journey!
          </p>
        </div>
      </div>
    ),
    placement: "center",
  },
];