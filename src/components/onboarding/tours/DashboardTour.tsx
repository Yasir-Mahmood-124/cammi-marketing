// src/components/onboarding/tours/DashboardTour.tsx

"use client"; // ✅ Required for App Router

import { SplashScreen } from "@/assests/icons";
import { Step } from "react-joyride";
import { Dialog, Box, Avatar, Typography } from "@mui/material";

export const DashboardTourSteps: Step[] = [
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
  {
    target: '[data-tour="dashboard-main-area"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Dashboard 📊
        </h3>
        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Your central hub where you can view recent quarterly and monthly
          reports from all your important projects.
        </p>
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#F0F8FF",
            borderRadius: "8px",
            borderLeft: "3px solid #3EA3FF",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#3EA3FF",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            💡 Quick Tip: Use the search bar to quickly find specific documents!
          </p>
        </div>
      </div>
    ),
    placement: "right",
    spotlightClicks: true,
  },
  {
    target: '[data-tour="welcome-section"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Welcome Header 👋
        </h3>
        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Your personalized welcome message and quick search access. Use the
          search bar to instantly find any document in your workspace.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="my-documents-section"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          My Documents 📁
        </h3>
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          All your generated documents are displayed here. Each document card
          shows:
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.8",
          }}
        >
          <li>Document name and creation date</li>
          <li>Quick preview by clicking the card</li>
          <li>Rename or delete options via the three-dot menu</li>
        </ul>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="first-document-card"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Document Card 📄
        </h3>
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Click on any document card to:
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.8",
          }}
        >
          <li>
            <strong>Preview</strong> the full document
          </li>
          <li>
            <strong>Download</strong> as DOCX
          </li>
          <li>
            <strong>Edit</strong> the document name
          </li>
        </ul>
        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            backgroundColor: "#FFF9E6",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#856404",
          }}
        >
          ⚡ Pro Tip: Click the three-dot menu for quick actions!
        </div>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="search-bar-container"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Search Documents 🔍
        </h3>
        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Quickly find any document by typing its name. The search is real-time
          and will filter your documents as you type.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="expert-review-section"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          CAMMI Expert Review 🎯
        </h3>
        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Track the status of your documents that are under expert review.
          You'll see:
        </p>
        <ul
          style={{
            margin: "8px 0 0 0",
            paddingLeft: "20px",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.8",
          }}
        >
          <li>Document name and organization</li>
          <li>Review date and project</li>
          <li>Current status (Completed/Pending)</li>
        </ul>
      </div>
    ),
    placement: "top",
  },
  {
    target: '[data-tour="sidebar"]',
    content: (
      <div>
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#000",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Navigation Sidebar 🗂️
        </h3>
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Use the sidebar to navigate between different sections:
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.8",
          }}
        >
          <li>
            <strong>Clarify</strong> - Strategic planning documents
          </li>
          <li>
            <strong>Align</strong> - Marketing alignment tools
          </li>
          <li>
            <strong>Mobilize</strong> - Content creation
          </li>
          <li>
            <strong>Monitor</strong> - Performance tracking
          </li>
          <li>
            <strong>Iterate</strong> - Optimization tools
          </li>
        </ul>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "body",
    content: (
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "16px",
            color: "#000",
            fontSize: "24px",
            fontWeight: 600,
          }}
        >
          You're All Set! 🎉
        </h2>
        <p
          style={{
            margin: "0 0 16px 0",
            color: "#666",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          You now know the basics of your dashboard. Feel free to explore and
          start creating amazing marketing content!
        </p>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#E8F5E9",
            borderRadius: "8px",
            marginTop: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#2E7D32",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            ✨ Need help? Click the help icon in the top-right corner anytime!
          </p>
        </div>
      </div>
    ),
    placement: "center",
  },
];