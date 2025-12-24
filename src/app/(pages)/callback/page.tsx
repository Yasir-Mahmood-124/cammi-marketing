"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Box, CircularProgress, Typography } from "@mui/material";

const GoogleCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const session_id = params.get("session_id");
    const id = params.get("id");

    const onboarding_status = params.get("onboarding_status") === "true";

    // ✅ FIXED: Extract status fields from URL
    const dashboard_status = params.get("dashboard_status");
    const user_input_status = params.get("user_input_status");
    const final_preview_status = params.get("final_preview_status");
    const document_preview_status = params.get("document_preview_status");

    // 🐛 DEBUG: Log what we extracted
    console.log("🔍 [CALLBACK] Extracted status fields:", {
      dashboard_status,
      user_input_status,
      final_preview_status,
      document_preview_status
    });

    const user = {
      name: params.get("name"),
      email: params.get("email"),
      picture: params.get("picture"),
      sub: params.get("sub"),
      session_id,
      onboarding_status,
      locale: params.get("locale") === "None" ? null : params.get("locale"),
      access_token: params.get("access_token"),
      expiry: params.get("expiry"),
      id,
      // ✅ CRITICAL: Add status fields to user object
      dashboard_status: dashboard_status === "True" || dashboard_status === "true",
      user_input_status: user_input_status === "True" || user_input_status === "true",
      final_preview_status: final_preview_status === "True" || final_preview_status === "true",
      document_preview_status: document_preview_status === "True" || document_preview_status === "true",
    };

    // 🐛 DEBUG: Log what we're saving
    console.log("💾 [CALLBACK] Saving user object:", user);

    if (token && user.email) {
      Cookies.set("token", session_id ?? "", { expires: 7 });

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("id", id ?? "");
      localStorage.setItem(
        "onboarding_status",
        JSON.stringify(onboarding_status)
      );

      // 🐛 DEBUG: Verify what was saved
      const savedUser = localStorage.getItem("user");
      console.log("✅ [CALLBACK] Verified localStorage:", JSON.parse(savedUser || "{}"));

      router.replace(onboarding_status ? "/onboarding" : "/dashboard");
    } else {
      console.error("Token or user data missing", { token, user });
    }
  }, [router]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF3C80, #3EA2FF)",
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            position: "absolute",
            "& div": {
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#4285F4",
              animation: "bounce 1s infinite alternate",
            },
            "& div:nth-of-type(2)": {
              animationDelay: "0.2s",
              backgroundColor: "#0F9D58",
            },
            "& div:nth-of-type(3)": {
              animationDelay: "0.4s",
              backgroundColor: "#F4B400",
            },
            "& div:nth-of-type(4)": {
              animationDelay: "0.6s",
              backgroundColor: "#DB4437",
            },
          }}
        >
          <div />
          <div />
          <div />
          <div />
        </Box>
      </Box>

      <Typography
        variant="h5"
        sx={{ color: "#fff", fontWeight: 500, mb: 1, textAlign: "center" }}
      >
        Logging in with Google...
      </Typography>
      <CircularProgress sx={{ color: "#fff" }} />

      <style jsx global>{`
        @keyframes bounce {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default GoogleCallbackPage;