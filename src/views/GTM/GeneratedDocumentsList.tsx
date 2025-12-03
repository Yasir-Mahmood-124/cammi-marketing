"use client";

import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import { useDispatch } from "react-redux";
import { resetForNewDocument } from "@/redux/services/gtm/gtmSlice";
import { AppDispatch } from "@/redux/store";
import toast from "react-hot-toast";

interface GeneratedDocumentsListProps {
  selectedDocumentTypes: string[];
  onDocumentClick: (documentType: string) => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  "gtm-gotomarket": "Go-to-Market Strategy",
  "gtm-marketresearch": "Market Research",
  "gtm-brand": "Brand",
  "gtm-brandkeymessaging": "Brand Key Messaging",
  "gtm-solution": "Solution",
  "gtm-contentpillars": "Content Pillars",
  "gtm-sales": "Sales",
  "gtm-advice": "Advice",
  "gtm-reporting": "Reporting",
};

const DOCUMENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  "gtm-gotomarket": "Comprehensive strategy for product launch and market entry",
  "gtm-marketresearch": "In-depth analysis of market trends and opportunities",
  "gtm-brand": "Brand identity and positioning guidelines",
  "gtm-brandkeymessaging": "Core messaging framework and value propositions",
  "gtm-solution": "Solution architecture and implementation details",
  "gtm-contentpillars": "Strategic content themes and messaging pillars",
  "gtm-sales": "Sales strategies, processes, and enablement materials",
  "gtm-advice": "Strategic recommendations and best practices",
  "gtm-reporting": "Analytics, metrics, and performance reports",
};

const GeneratedDocumentsList: React.FC<GeneratedDocumentsListProps> = ({
  selectedDocumentTypes,
  onDocumentClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // 🔥 NEW: Handle Save All - Reset state and return to selection
  const handleSaveAll = () => {
    console.log("💾 [GeneratedDocumentsList] Save All clicked - resetting state");
    
    toast.success("All documents saved successfully!");
    
    // Reset the entire GTM state (returns to selection view)
    dispatch(resetForNewDocument());
    
    console.log("✅ [GeneratedDocumentsList] State reset complete - returned to selection");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "40px 20px",
      }}
    >
      <Box
        sx={{
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", marginBottom: "40px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: "48px",
                color: "#4CAF50",
                marginRight: "12px",
              }}
            />
          </Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "32px",
              fontWeight: 700,
              color: "#1A1A1A",
              marginBottom: "12px",
            }}
          >
            Documents Generated Successfully!
          </Typography>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              color: "#666",
              fontWeight: 400,
            }}
          >
            Click on any document below to view or download
          </Typography>
        </Box>

        {/* Documents Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: "20px",
          }}
        >
          {selectedDocumentTypes.map((docType) => (
            <Paper
              key={docType}
              onClick={() => onDocumentClick(docType)}
              sx={{
                padding: "24px",
                borderRadius: "12px",
                cursor: "pointer",
                border: "2px solid #E0E0E0",
                backgroundColor: "#FFFFFF",
                transition: "all 0.3s ease",
                position: "relative",
                "&:hover": {
                  borderColor: "#3EA3FF",
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(62, 163, 255, 0.25)",
                },
              }}
            >
              {/* Document Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #3EA3FF, #FF3C80)",
                  marginBottom: "16px",
                }}
              >
                <InsertDriveFileIcon
                  sx={{
                    fontSize: "28px",
                    color: "#FFFFFF",
                  }}
                />
              </Box>

              {/* Document Title */}
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {DOCUMENT_TYPE_LABELS[docType] || docType}
              </Typography>

              {/* Document Description */}
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontSize: "13px",
                  color: "#666",
                  lineHeight: 1.5,
                  marginBottom: "12px",
                }}
              >
                {DOCUMENT_TYPE_DESCRIPTIONS[docType] || "Click to view document"}
              </Typography>

              {/* Ready Badge */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  backgroundColor: "#E8F5E9",
                  border: "1px solid #4CAF50",
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: "14px",
                    color: "#4CAF50",
                    marginRight: "4px",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#4CAF50",
                  }}
                >
                  Ready
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* 🔥 NEW: Save All Button */}
        <Box
          sx={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveAll}
            sx={{
              fontFamily: "Poppins",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3EA3FF, #FF3C80)",
              color: "#FFF",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(62, 163, 255, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #2E8FE6, #E6356D)",
                boxShadow: "0 6px 16px rgba(62, 163, 255, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Save All
          </Button>
        </Box>

        {/* Footer Note */}
        <Box
          sx={{
            marginTop: "24px",
            padding: "20px",
            backgroundColor: "#F5F7FA",
            borderRadius: "12px",
            border: "1px solid #E0E0E0",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
            }}
          >
            💡 <strong>Tip:</strong> You can view, edit, and download each document individually, or click "Save All" to finish
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GeneratedDocumentsList;