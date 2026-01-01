"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import toast from "react-hot-toast";
import { useSendEmailSupportMutation } from "@/redux/services/help/helpApi";
import Cookies from "js-cookie";

// Country codes data
const countryCodes = [
  { code: "+1", country: "US", name: "United States", flag: "🇺🇸" },
  { code: "+1", country: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "+44", country: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳" },
  { code: "+92", country: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳" },
  { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "FR", name: "France", flag: "🇫🇷" },
  { code: "+39", country: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "+7", country: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "+55", country: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "+27", country: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "+234", country: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "+20", country: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "+82", country: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "+65", country: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "+62", country: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "+66", country: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "+971", country: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+90", country: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "+31", country: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "+46", country: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "+41", country: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "+48", country: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "+351", country: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "+353", country: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "+45", country: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "+47", country: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "+358", country: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "+30", country: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "+43", country: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "+32", country: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "+64", country: "NZ", name: "New Zealand", flag: "🇳🇿" },
];

interface FormData {
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
}

const Help: React.FC = () => {
  const [sendEmailSupport] = useSendEmailSupportMutation();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    countryCode: "+1",
    phoneNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{7,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid phone number (7-15 digits)";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCountryCodeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const sessionId = Cookies.get("token");

    if (!sessionId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendEmailSupport({
        session_id: sessionId,
        name: formData.fullName,
        email: formData.email,
        phone: `${formData.countryCode}-${formData.phoneNumber}`,
        message: formData.message,
      }).unwrap();

      toast.success("Your message has been sent successfully!");

      setFormData({
        fullName: "",
        email: "",
        countryCode: "+1",
        phoneNumber: "",
        message: "",
      });
      setErrors({});
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        p: { xs: 2, md: 3, lg: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          width: "100%",
          display: "flex",
          gap: { xs: 3, md: 4, lg: 5 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
        }}
      >
        {/* Left Side - Text Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: "#A1A2A5",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            HELP & SUPPORT
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "26px", md: "34px", lg: "38px" },
              fontWeight: 500,
              color: "#070708",
              lineHeight: 1.1,
              maxWidth: "330px",
            }}
          >
            Contact with cammi Expert Team.
          </Typography>

          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#070708",
              lineHeight: 1.4,
              maxWidth: "420px",
            }}
          >
            Connect with Cammi specialists for fast, reliable support tailored
            to your business needs
          </Typography>
        </Box>

        {/* Right Side - Form */}
        <Box
          sx={{
            flex: 1.2,
            width: "100%",
            maxWidth: { xs: "100%", md: "500px" },
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Full Name */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#070708",
                    mb: 0.5,
                  }}
                >
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  placeholder="Full Name"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      "& input": {
                        padding: "8px 12px",
                      },
                      "& fieldset": {
                        borderColor: "#E9EAEC",
                      },
                      "&:hover fieldset": {
                        borderColor: "#D0D1D3",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#070708",
                      },
                      "& input::placeholder": {
                        color: "#E9EAEC",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Email */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#070708",
                    mb: 0.5,
                  }}
                >
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="Email"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      "& input": {
                        padding: "8px 12px",
                      },
                      "& fieldset": {
                        borderColor: "#E9EAEC",
                      },
                      "&:hover fieldset": {
                        borderColor: "#D0D1D3",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#070708",
                      },
                      "& input::placeholder": {
                        color: "#E9EAEC",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Phone Number */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#070708",
                    mb: 0.5,
                  }}
                >
                  Phone Number
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FormControl
                    sx={{
                      width: "110px",
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#FFFFFF",
                        borderRadius: "8px",
                        "& .MuiSelect-select": {
                          padding: "8px 12px",
                        },
                        "& fieldset": {
                          borderColor: "#E9EAEC",
                        },
                        "&:hover fieldset": {
                          borderColor: "#D0D1D3",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#070708",
                        },
                      },
                    }}
                  >
                    <Select
                      value={formData.countryCode}
                      onChange={(e) => handleCountryCodeChange(e.target.value)}
                      displayEmpty
                      renderValue={(selected) => {
                        const country = countryCodes.find(
                          (c) => c.code === selected
                        );
                        return (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography sx={{ fontSize: "16px" }}>
                              {country?.flag}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                              {selected}
                            </Typography>
                          </Box>
                        );
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                          },
                        },
                      }}
                    >
                      {countryCodes.map((country, index) => (
                        <MenuItem
                          key={`${country.code}-${country.country}-${index}`}
                          value={country.code}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography>{country.flag}</Typography>
                            <Typography sx={{ flexGrow: 1, fontSize: "14px" }}>
                              {country.name}
                            </Typography>
                            <Typography
                              sx={{
                                color: "#757575",
                                fontSize: "13px",
                              }}
                            >
                              {country.code}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    placeholder="Phone Number"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#FFFFFF",
                        borderRadius: "8px",
                        "& input": {
                          padding: "8px 12px",
                        },
                        "& fieldset": {
                          borderColor: "#E9EAEC",
                        },
                        "&:hover fieldset": {
                          borderColor: "#D0D1D3",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#070708",
                        },
                        "& input::placeholder": {
                          color: "#E9EAEC",
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Message */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#070708",
                    mb: 0.5,
                  }}
                >
                  Stuck on something? Tell us here
                </Typography>
                <TextField
                  fullWidth
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                  placeholder="Stuck on something? Tell us here"
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      "& textarea": {
                        padding: "8px 12px",
                      },
                      "& fieldset": {
                        borderColor: "#E9EAEC",
                      },
                      "&:hover fieldset": {
                        borderColor: "#D0D1D3",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#070708",
                      },
                      "& textarea::placeholder": {
                        color: "#E9EAEC",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    py: 1,
                    borderRadius: "80px",
                    backgroundColor: "#070708",
                    fontSize: "14px",
                    fontWeight: 500,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#1a1a1a",
                      boxShadow: "none",
                    },
                    "&:disabled": {
                      backgroundColor: "#A1A2A5",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Help;