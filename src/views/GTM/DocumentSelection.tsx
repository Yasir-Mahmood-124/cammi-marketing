"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Checkbox, FormControlLabel, Paper } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

interface DocumentSelectionProps {
  onConfirm: (selectedTypes: string[]) => void;
}

const DOCUMENT_TYPES = [
  {
    id: "gtm-gotomarket",
    label: "Go-to-Market Strategy",
    description: "Comprehensive strategy for product launch and market entry",
  },
  {
    id: "gtm-marketresearch",
    label: "Market Research",
    description: "In-depth analysis of market trends and opportunities",
  },
  {
    id: "gtm-brand",
    label: "Brand",
    description: "Brand identity and positioning guidelines",
  },
  {
    id: "gtm-brandkeymessaging",
    label: "Brand Key Messaging",
    description: "Core messaging framework and value propositions",
  },
  {
    id: "gtm-solution",
    label: "Solution",
    description: "Solution architecture and implementation details",
  },
  {
    id: "gtm-contentpillars",
    label: "Content Pillars",
    description: "Strategic content themes and messaging pillars",
  },
  {
    id: "gtm-sales",
    label: "Sales",
    description: "Sales strategies, processes, and enablement materials",
  },
  {
    id: "gtm-advice",
    label: "Advice",
    description: "Strategic recommendations and best practices",
  },
  {
    id: "gtm-reporting",
    label: "Reporting",
    description: "Analytics, metrics, and performance reports",
  },
];

const DocumentSelection: React.FC<DocumentSelectionProps> = ({ onConfirm }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (selectedTypes.length > 0) {
      onConfirm(selectedTypes);
    }
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
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", marginBottom: "40px" }}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "32px",
              fontWeight: 700,
              color: "#1A1A1A",
              marginBottom: "12px",
              background: "linear-gradient(135deg, #3EA3FF, #FF3C80)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Select Documents to Create
          </Typography>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              color: "#666",
              fontWeight: 400,
            }}
          >
            Choose one or more document types you'd like to generate
          </Typography>
        </Box>

        {/* Document Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {DOCUMENT_TYPES.map((doc) => {
            const isSelected = selectedTypes.includes(doc.id);
            return (
              <Paper
                key={doc.id}
                onClick={() => handleToggle(doc.id)}
                sx={{
                  padding: "20px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: isSelected ? "2px solid #3EA3FF" : "2px solid #E0E0E0",
                  backgroundColor: isSelected ? "#F0F8FF" : "#FFFFFF",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    borderColor: isSelected ? "#3EA3FF" : "#BDBDBD",
                    transform: "translateY(-2px)",
                    boxShadow: isSelected
                      ? "0 6px 16px rgba(62, 163, 255, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                {/* Checkbox Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                  }}
                >
                  {isSelected ? (
                    <CheckCircleIcon
                      sx={{
                        color: "#3EA3FF",
                        fontSize: "24px",
                      }}
                    />
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{
                        color: "#BDBDBD",
                        fontSize: "24px",
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: isSelected ? "#1A1A1A" : "#333",
                    marginBottom: "8px",
                    paddingRight: "30px",
                  }}
                >
                  {doc.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "13px",
                    color: "#666",
                    lineHeight: 1.5,
                  }}
                >
                  {doc.description}
                </Typography>
              </Paper>
            );
          })}
        </Box>

        {/* Selected Count and Confirm Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "2px solid #E0E0E0",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontSize: "14px",
                color: "#666",
                marginBottom: "4px",
              }}
            >
              Selected Documents
            </Typography>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontSize: "20px",
                fontWeight: 600,
                color: selectedTypes.length > 0 ? "#3EA3FF" : "#999",
              }}
            >
              {selectedTypes.length} of {DOCUMENT_TYPES.length}
            </Typography>
          </Box>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: "18px" }} />}
            onClick={handleConfirm}
            disabled={selectedTypes.length === 0}
            sx={{
              background:
                selectedTypes.length > 0
                  ? "linear-gradient(135deg, #3EA3FF, #FF3C80)"
                  : "#E0E0E0",
              color: selectedTypes.length > 0 ? "#fff" : "#999",
              textTransform: "none",
              fontFamily: "Poppins",
              fontSize: "15px",
              fontWeight: 600,
              padding: "12px 32px",
              borderRadius: "10px",
              boxShadow:
                selectedTypes.length > 0
                  ? "0 4px 12px rgba(62, 163, 255, 0.4)"
                  : "none",
              "&:hover": {
                background:
                  selectedTypes.length > 0
                    ? "linear-gradient(135deg, #2E8FE6, #E6356D)"
                    : "#E0E0E0",
              },
              "&:disabled": {
                background: "#E0E0E0",
                color: "#999",
              },
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentSelection;