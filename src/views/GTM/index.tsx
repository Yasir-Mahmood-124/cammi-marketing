"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UserInput from "../ICP/UserInput";
import InputTakerUpdated from "../ICP/InputTakerUpdated";
import FinalPreview from "../ICP/FinalPreview";
import Generating from "../ICP/Generating";
import DocumentPreview from "../ICP/DocumentPreview";
import { useGet_unanswered_questionsQuery } from "@/redux/services/common/getUnansweredQuestionsApi";
import { useGetQuestionsQuery } from "@/redux/services/common/getQuestionsApi";
import { useRefineMutation } from "@/redux/services/common/refineApi";
import { useUploadTextFileMutation } from "@/redux/services/common/uploadApiSlice";
import { useGetDocxFileMutation } from "@/redux/services/document/downloadApi";
import { RootState, AppDispatch } from "@/redux/store";
import {
  setView,
  setQuestions,
  updateQuestionAnswer,
  updateCurrentQuestionAnswer,
  nextQuestion,
  goToQuestion,
  addAnsweredId,
  setProjectId,
  setSessionId,
  setIsGenerating,
  setWsUrl,
  setDocumentData,
  setShouldFetchUnanswered,
  setShouldFetchAll,
  setShowDocumentPreview,
  setCompletionMessageReceived,
  setCurrentQuestionIndex,
  setAnsweredIds,
  resetGTMState,
} from "@/redux/services/gtm/gtmSlice";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { useUserInputTour } from "@/components/onboarding/tours/userInputTour/useUserInputTour";
import { useFinalPreviewTour } from "@/components/onboarding/tours/finalPreviewTour/useFinalPreviewTour";
import { useDocumentPreviewTour } from "@/components/onboarding/tours/documentPreview/useDocumentPreviewTour";

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface CurrentProject {
  organization_id: string;
  organization_name: string;
  project_id: string;
  project_name: string;
}

const GTMPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mountRecoveryTriggered = useRef(false);
  const initialMountFetchDone = useRef(false);
  const documentDownloadTriggered = useRef(false);
  const isRefetchingQuestions = useRef(false);

  const [isRehydrated, setIsRehydrated] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isFinalPreviewReady, setIsFinalPreviewReady] = useState(false);
  const [isDocumentPreviewReady, setIsDocumentPreviewReady] = useState(false);

  // Get state from Redux (🆕 Added resetTimestamp)
  const {
    view,
    questions,
    currentQuestionIndex,
    answeredIds,
    projectId,
    sessionId,
    isGenerating,
    wsUrl,
    showDocumentPreview,
    docxBase64,
    fileName,
    shouldFetchUnanswered,
    shouldFetchAll,
    generatingProgress,
    hasReceivedCompletionMessage,
    resetTimestamp, // 🆕 Added this
  } = useSelector((state: RootState) => state.gtm);

  // Redux mutation hooks
  const [refine, { isLoading: isRefining }] = useRefineMutation();
  const [uploadTextFile, { isLoading: isUploading }] =
    useUploadTextFileMutation();
  const [getDocxFile, { isLoading: isDownloadingDoc }] =
    useGetDocxFileMutation();

  // Get current question and check if it has an answer
  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswer = !!(
    currentQuestion?.answer && currentQuestion.answer.trim() !== ""
  );

  // Check if components are actually rendered and ready for User Input Tour
  const componentsReady =
    view === "questions" &&
    questions.length > 0 &&
    currentQuestion !== undefined &&
    !isGenerating &&
    !showDocumentPreview &&
    isRehydrated;

  const readyForRegenerateStep = hasAnswer && isTypingComplete;

  console.log("🎯 [GTM Page] Tour conditions:", {
    view,
    questionsLength: questions.length,
    hasCurrentQuestion: !!currentQuestion,
    isGenerating,
    showDocumentPreview,
    isRehydrated,
    componentsReady,
    hasAnswer,
    isTypingComplete,
    readyForRegenerateStep,
  });

  // Tour hooks
  useUserInputTour(componentsReady, readyForRegenerateStep);
  useFinalPreviewTour({ isReady: isFinalPreviewReady });
  useDocumentPreviewTour({ isReady: isDocumentPreviewReady });

  // Set Final Preview ready when view changes to preview
  useEffect(() => {
    if (view === "preview" && questions.length > 0 && isRehydrated && !isGenerating) {
      console.log("✅ [Final Preview] Setting ready state after delay");
      const timer = setTimeout(() => {
        setIsFinalPreviewReady(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsFinalPreviewReady(false);
    }
  }, [view, questions.length, isRehydrated, isGenerating]);

  // Set Document Preview ready when document is shown
  useEffect(() => {
    if (showDocumentPreview && docxBase64 && isRehydrated) {
      console.log("✅ [Document Preview] Setting ready state after delay");
      const timer = setTimeout(() => {
        setIsDocumentPreviewReady(true);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setIsDocumentPreviewReady(false);
    }
  }, [showDocumentPreview, docxBase64, isRehydrated]);

  // Reset typing state when answer changes or question changes
  useEffect(() => {
    console.log('🔄 [GTM] Answer changed, resetting typing state');
    setIsTypingComplete(false);
  }, [currentQuestion?.answer, currentQuestionIndex]);

  // Debug logging for tour conditions
  useEffect(() => {
    console.log('🎯 [Tour Debug]', {
      hasAnswer,
      isTypingComplete,
      readyForRegenerateStep,
      regenerateButtonExists: !!document.querySelector('[data-tour="regenerate-button"]'),
      userInputStatus: (() => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user.user_input_status;
        } catch {
          return 'error';
        }
      })()
    });
  }, [hasAnswer, isTypingComplete, readyForRegenerateStep]);

  // Wait for redux-persist to finish rehydrating
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("✅ [GTM] Redux rehydration complete");
      setIsRehydrated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // RTK Query with FORCED REFETCH - No caching
  const {
    data: unansweredData,
    isLoading: isLoadingUnanswered,
    isError: isErrorUnanswered,
    isFetching: isFetchingUnanswered,
    refetch: refetchUnanswered,
  } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "gtm",
    },
    {
      skip: !shouldFetchUnanswered || !projectId || !isRehydrated,
      refetchOnMountOrArgChange: 0.001,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }
  );

  // RTK Query for all questions with FORCED REFETCH - No caching
  const {
    data: allQuestionsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    isFetching: isFetchingAll,
    refetch: refetchAllQuestions,
  } = useGetQuestionsQuery(
    {
      project_id: projectId,
      document_type: "gtm",
    },
    {
      skip: !shouldFetchAll || !projectId || !isRehydrated,
      refetchOnMountOrArgChange: 0.001,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }
  );

  // Get project_id from localStorage on component mount
  useEffect(() => {
    const currentProjectStr = localStorage.getItem("currentProject");
    if (currentProjectStr) {
      try {
        const currentProject: CurrentProject = JSON.parse(currentProjectStr);
        if (currentProject.project_id !== projectId) {
          dispatch(setProjectId(currentProject.project_id));
        }
      } catch (error) {
        console.error("❌ [GTM Project] Error parsing currentProject:", error);
      }
    }
  }, [dispatch, projectId]);

  // 🆕 NEW EFFECT: Watch for state reset and re-initialize
  useEffect(() => {
    if (resetTimestamp > 0 && isRehydrated && projectId) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║          🔄 GTM STATE RESET DETECTED                      ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log(`📅 [GTM Reset] Reset timestamp: ${new Date(resetTimestamp).toISOString()}`);
      console.log(`📦 [GTM Reset] Project ID: ${projectId}`);
      
      // Reset all ref flags
      console.log("🧹 [GTM Reset] Resetting all ref flags...");
      initialMountFetchDone.current = false;
      mountRecoveryTriggered.current = false;
      documentDownloadTriggered.current = false;
      isRefetchingQuestions.current = false;
      
      // Reset to initial view and state
      console.log("🔄 [GTM Reset] Resetting view and indices...");
      dispatch(setView("questions"));
      dispatch(setCurrentQuestionIndex(0));
      dispatch(setAnsweredIds([]));
      
      // Trigger fresh data fetch after a small delay
      setTimeout(() => {
        console.log("🚀 [GTM Reset] Triggering fresh data fetch");
        dispatch(setShouldFetchUnanswered(true));
      }, 200);
      
      console.log("✅ [GTM Reset] Re-initialization complete");
    }
  }, [resetTimestamp, isRehydrated, projectId, dispatch]);

  // Refetch unanswered questions when returning to questions view
  const refetchQuestionsOnReturn = useCallback(() => {
    if (isRefetchingQuestions.current) {
      console.log("⏸️ [GTM Refetch] Already refetching, skipping");
      return;
    }

    console.log(
      "🔄 [GTM Refetch] User returned to questions view - refetching unanswered questions"
    );
    isRefetchingQuestions.current = true;

    // Reset to prevent stale state
    dispatch(setCurrentQuestionIndex(0));
    dispatch(setAnsweredIds([]));

    // Trigger refetch
    setTimeout(() => {
      dispatch(setShouldFetchUnanswered(true));
      isRefetchingQuestions.current = false;
    }, 100);
  }, [dispatch]);

  // Detect when user returns to the page (tab visibility)
  useEffect(() => {
    if (!isRehydrated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && view === "questions" && questions.length > 0) {
        console.log(
          "👁️ [GTM Visibility] User returned to tab - refetching questions"
        );
        refetchQuestionsOnReturn();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRehydrated, view, questions.length, refetchQuestionsOnReturn]);

  // Detect when component remounts on questions view
  useEffect(() => {
    if (!isRehydrated || !projectId) return;

    if (view === "questions" && questions.length > 0) {
      const hasNavigatedBack = !initialMountFetchDone.current;

      if (hasNavigatedBack) {
        console.log(
          "🔄 [GTM Mount] Detected return to questions view - refetching"
        );
        refetchQuestionsOnReturn();
        initialMountFetchDone.current = true;
      }
    }
  }, [isRehydrated, projectId, view, questions.length, refetchQuestionsOnReturn]);

  // Cleanup state when unmounting
  useEffect(() => {
    return () => {
      console.log("🧹 [GTM Unmount] Resetting fetch flag");
      if (!isGenerating && !showDocumentPreview) {
        initialMountFetchDone.current = false;
        dispatch(setShouldFetchUnanswered(false));
        dispatch(setShouldFetchAll(false));
      }
    };
  }, [dispatch, isGenerating, showDocumentPreview]);

  // Mount fetch - only runs ONCE on mount after rehydration
  useEffect(() => {
    if (!isRehydrated || !projectId) {
      return;
    }

    if (initialMountFetchDone.current) {
      console.log("↩️ [Mount Fetch] Already done, skipping");
      return;
    }

    if (isGenerating) {
      console.log(`⏸️ [Mount Fetch] Skipping - generating in progress`);
      return;
    }

    console.log("🚀 [GTM Mount] Running ONE-TIME mount fetch");
    console.log(`  ├─ View: ${view}`);
    console.log(`  └─ Questions count: ${questions.length}`);

    initialMountFetchDone.current = true;

    // Always start by fetching unanswered questions
    console.log("🔄 [Mount Fetch] Fetching unanswered questions");

    // Reset state before fetching
    dispatch(setCurrentQuestionIndex(0));
    dispatch(setAnsweredIds([]));

    setTimeout(() => {
      dispatch(setShouldFetchUnanswered(true));
    }, 100);
  }, [isRehydrated, projectId, dispatch, isGenerating, view, questions.length]);

  // Force manual refetch when shouldFetchUnanswered changes
  useEffect(() => {
    if (shouldFetchUnanswered && projectId && isRehydrated) {
      console.log("🔄 [GTM] Manually triggering unanswered questions refetch");
      refetchUnanswered();
    }
  }, [shouldFetchUnanswered, projectId, refetchUnanswered, isRehydrated]);

  // Force manual refetch when shouldFetchAll changes
  useEffect(() => {
    if (shouldFetchAll && projectId && isRehydrated) {
      console.log("🔄 [GTM] Manually triggering all questions refetch");
      refetchAllQuestions();
    }
  }, [shouldFetchAll, projectId, refetchAllQuestions, isRehydrated]);

  // Safety check - Reset currentQuestionIndex if out of bounds
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      console.log(
        "⚠️ [GTM Safety] currentQuestionIndex out of bounds, resetting to 0"
      );
      dispatch(setCurrentQuestionIndex(0));
    }
  }, [questions.length, currentQuestionIndex, dispatch]);

  // Handle document download after generation completion
  const handleDocumentDownload = useCallback(async () => {
    if (documentDownloadTriggered.current) {
      console.log("⏸️ [Download] Already triggered, skipping");
      return;
    }

    documentDownloadTriggered.current = true;

    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      if (!savedToken || !project_id) {
        toast.error("Missing authentication or project information");
        return;
      }

      console.log("📥 [GTM] Downloading generated document...");
      toast.loading("Downloading document...", { id: "download-doc" });

      const response = await getDocxFile({
        session_id: savedToken,
        project_id: project_id,
        document_type: "gtm",
      }).unwrap();

      if (!response.docxBase64) {
        throw new Error("Document content not found in response");
      }

      dispatch(
        setDocumentData({
          docxBase64: response.docxBase64,
          fileName: response.fileName || "gtm_document.docx",
        })
      );

      toast.dismiss("download-doc");
      toast.success("Document ready for preview!");

      console.log("✅ [GTM] Document downloaded successfully");
    } catch (error: any) {
      console.error("❌ [GTM Document] Download failed:", error);
      toast.dismiss("download-doc");

      let errorMessage = "Failed to download document. Please try again.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      documentDownloadTriggered.current = false;
    }
  }, [dispatch, getDocxFile]);

  // Mount recovery - only for edge cases
  useEffect(() => {
    if (!isRehydrated) return;

    if (mountRecoveryTriggered.current) {
      return;
    }
    mountRecoveryTriggered.current = true;

    console.log("🔍 [Recovery] Running edge case checks");

    if (docxBase64 && fileName && !showDocumentPreview) {
      dispatch(setShowDocumentPreview(true));
      return;
    }

    if (
      isGenerating &&
      generatingProgress === 100 &&
      !hasReceivedCompletionMessage
    ) {
      setTimeout(() => {
        dispatch(setCompletionMessageReceived(true));
      }, 1000);
      return;
    }

    if (isGenerating && !hasReceivedCompletionMessage && wsUrl) {
      setTimeout(() => {
        dispatch(setIsGenerating(true));
      }, 500);
      return;
    }

    if (isGenerating && !wsUrl) {
      dispatch(setIsGenerating(false));
      toast.error("Generation state was interrupted. Please try again.");
      return;
    }

    return () => {
      mountRecoveryTriggered.current = false;
    };
  }, [
    isRehydrated,
    docxBase64,
    fileName,
    showDocumentPreview,
    hasReceivedCompletionMessage,
    isGenerating,
    generatingProgress,
    wsUrl,
    view,
    dispatch,
  ]);

  // Watch for completion message and trigger document download
  useEffect(() => {
    if (hasReceivedCompletionMessage && !showDocumentPreview && !docxBase64) {
      console.log(
        "✅ [GTM] Generation complete - triggering document download"
      );
      handleDocumentDownload();
    }
  }, [
    hasReceivedCompletionMessage,
    showDocumentPreview,
    docxBase64,
    handleDocumentDownload,
  ]);

  // Safety: Watch for 100% progress without completion message
  useEffect(() => {
    if (
      isGenerating &&
      generatingProgress === 100 &&
      !hasReceivedCompletionMessage
    ) {
      console.log("⚠️ [GTM Safety] 100% reached, forcing completion");
      setTimeout(() => {
        dispatch(setCompletionMessageReceived(true));
      }, 2000);
    }
  }, [isGenerating, generatingProgress, hasReceivedCompletionMessage, dispatch]);

  // Handle unanswered questions response
  useEffect(() => {
    if (!unansweredData) return;

    console.log(
      "📥 [GTM API Response] Unanswered questions received:",
      unansweredData
    );

    let parsedData = unansweredData;
    if (typeof unansweredData.body === "string") {
      try {
        parsedData = JSON.parse(unansweredData.body);
      } catch (error) {
        console.error("Failed to parse unanswered data:", error);
        return;
      }
    }

    // Scenario 1: Has unanswered questions
    if (
      parsedData.missing_questions &&
      parsedData.missing_questions.length > 0
    ) {
      const formattedQuestions: Question[] = parsedData.missing_questions.map(
        (q: string, index: number) => ({
          id: index + 1,
          question: q,
          answer: "",
        })
      );

      console.log(
        `✅ [Scenario 1] Found ${formattedQuestions.length} unanswered questions`
      );

      // Reset state when setting new questions
      dispatch(setCurrentQuestionIndex(0));
      dispatch(setAnsweredIds([]));
      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("questions"));
      dispatch(setShouldFetchUnanswered(false));

      toast.success(`Loaded ${formattedQuestions.length} question(s)`);
    } else {
      // Scenario 2: No unanswered questions - fetch all questions for preview
      console.log(
        "📋 [Scenario 2] No unanswered questions - fetching all questions for preview"
      );
      dispatch(setShouldFetchUnanswered(false));
      dispatch(setShouldFetchAll(true));
    }
  }, [unansweredData, dispatch]);

  // Handle all questions (answered) response
  useEffect(() => {
    if (!allQuestionsData || !allQuestionsData.questions) return;

    console.log(
      "📥 [GTM API Response] All questions received:",
      allQuestionsData
    );

    const formattedQuestions: Question[] = allQuestionsData.questions.map(
      (q: any, index: number) => ({
        id: index + 1,
        question: q.question_text,
        answer: q.answer_text || "",
      })
    );

    console.log(
      `✅ [GTM] Loaded ${formattedQuestions.length} answered questions`
    );
    dispatch(setQuestions(formattedQuestions));
    dispatch(setView("preview"));
    dispatch(setShouldFetchAll(false));
    toast.success("Preview loaded successfully!");
  }, [allQuestionsData, dispatch]);

  // When transitioning to preview
  const handleShowPreview = useCallback(() => {
    console.log("📋 [GTM Preview] Triggering API fetch for preview");
    dispatch(setShouldFetchAll(true));
  }, [dispatch]);

  // Check if all questions are answered
  const allQuestionsAnswered =
    questions.length > 0 && questions.every((q) => q.answer.trim() !== "");

  // Handle generating answer from API
  const handleGenerate = async (userPrompt: string) => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const fullPrompt = `${currentQuestion.question}\n\n${userPrompt}`;

      const responsePromise = refine({
        prompt: fullPrompt,
        session_id: sessionId,
      }).unwrap();

      const response = await toast.promise(responsePromise, {
        loading: "Generating answer...",
        success: "Answer generated successfully!",
        error: "Failed to generate answer. Please try again.",
      });

      if (response.session_id) {
        dispatch(setSessionId(response.session_id));
      }

      dispatch(updateCurrentQuestionAnswer(response.groq_response));
    } catch (error) {
      // Error already handled by toast.promise
    }
  };

  const handleRegenerate = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    toast("Regenerating answer...", { icon: "🔄" });
    await handleGenerate(currentQuestion.question);
  };

  const handleConfirm = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.answer) {
      dispatch(addAnsweredId(currentQuestion.id));
      toast.success("Answer confirmed successfully!");

      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        toast.success("All questions answered! Loading preview...");
        handleShowPreview();
      }
    } else {
      toast.error("Please provide an answer before confirming!");
    }
  };

  const handleItemClick = (id: number) => {
    dispatch(goToQuestion(id));
  };

  const handleAnswerUpdate = (id: number, newAnswer: string) => {
    dispatch(updateQuestionAnswer({ id, answer: newAnswer }));
  };

  const handleTypingComplete = useCallback(() => {
    console.log('✅ [GTM] Typing animation complete');
    setIsTypingComplete(true);
  }, []);

  const handleGenerateDocument = async () => {
    try {
      documentDownloadTriggered.current = false;
      mountRecoveryTriggered.current = false;

      const dynamicFileName = "businessidea.txt";
      const savedToken = Cookies.get("token");

      if (!savedToken) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      if (!project_id) {
        toast.error("Project ID not found. Please select a project.");
        return;
      }

      const textContent = questions
        .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
        .join("\n\n");

      const base64Content = btoa(unescape(encodeURIComponent(textContent)));

      const payload = {
        fileName: dynamicFileName,
        fileContent: base64Content,
        token: savedToken,
        project_id: project_id,
        document_type: "gtm",
      };

      const uploadPromise = uploadTextFile(payload).unwrap();

      await toast.promise(uploadPromise, {
        loading: "Uploading your answers...",
        success:
          "Answers uploaded successfully! Starting document generation...",
        error: "Failed to upload answers. Please try again.",
      });

      const baseWsUrl = process.env.NEXT_PUBLIC_REALTIME_WEBSOCKET_URL;

      if (!baseWsUrl) {
        console.error(
          "❌ [GTM] WebSocket URL not configured in environment variables"
        );
        toast.error(
          "WebSocket configuration missing. Please contact support."
        );
        return;
      }

      const websocketUrl = `${baseWsUrl}?session_id=${savedToken}`;

      console.log(
        "╔════════════════════════════════════════════════════════════╗"
      );
      console.log(
        "║          🚀 STARTING GTM DOCUMENT GENERATION              ║"
      );
      console.log(
        "╚════════════════════════════════════════════════════════════╝"
      );
      console.log("🔌 [GTM] Base WebSocket URL:", baseWsUrl);
      console.log("🔌 [GTM] Full WebSocket URL:", websocketUrl);
      console.log(
        "🔑 [GTM] Session Token:",
        savedToken ? "✅ Present" : "❌ Missing"
      );
      console.log("📦 [GTM] Project ID:", project_id);
      console.log("📦 [GTM] Dispatching Redux actions...");

      dispatch(setWsUrl(websocketUrl));
      console.log("✅ [GTM] wsUrl dispatched to Redux");

      await new Promise((resolve) => setTimeout(resolve, 100));

      dispatch(setIsGenerating(true));
      console.log("✅ [GTM] isGenerating=true dispatched to Redux");
      console.log(
        "⏳ [GTM] Waiting for middleware to establish WebSocket connection..."
      );
    } catch (err: any) {
      console.error("❌ [GTM Upload] Error:", err);
      toast.error("Upload failed. Please try again.");

      dispatch(setIsGenerating(false));
      dispatch(setWsUrl(""));
    }
  };

  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isFetching = isFetchingUnanswered || isFetchingAll;
  const isError = isErrorUnanswered || isErrorAll;

  const hasValidCurrentQuestion = currentQuestion !== undefined;

  // Show loading screen while rehydrating
  if (!isRehydrated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#EFF1F5",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ color: "red", fontFamily: "Poppins" }}>
          Error loading questions. Please try again.
        </div>
      </Box>
    );
  }

  if (showDocumentPreview && docxBase64) {
    console.log('🎯 [Document Preview] Rendering with tour ready:', isDocumentPreviewReady);
    return (
      <Box
        sx={{
          height: "calc(100vh - 10.96vh)",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <DocumentPreview
          docxBase64={docxBase64}
          fileName={fileName}
          documentType="gtm"
        />
      </Box>
    );
  }

  // Show loader when fetching data
  if (isFetching && questions.length === 0 && !isGenerating) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#EFF1F5",
          gap: 2,
        }}
      >
        <CircularProgress />
        <div
          style={{ fontFamily: "Poppins", color: "#666", fontSize: "16px" }}
        >
          Loading questions...
        </div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#EFF1F5",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {isGenerating ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Generating wsUrl={wsUrl} documentType="gtm" />
        </Box>
      ) : (
        <>
          {view === "questions" &&
            questions.length > 0 &&
            hasValidCurrentQuestion && (
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: "24px",
                    width: "100%",
                    alignItems: "flex-start",
                    height: "100%",
                    maxHeight: "500px",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <UserInput
                      number={currentQuestion.id}
                      question={currentQuestion.question}
                      answer={currentQuestion.answer}
                      documentType="gtm"
                      isLoading={isRefining}
                      onGenerate={handleGenerate}
                      onRegenerate={handleRegenerate}
                      onConfirm={handleConfirm}
                      onTypingComplete={handleTypingComplete}
                    />
                  </Box>

                  <Box sx={{ flex: "0 0 300px", height: "100%" }}>
                    <InputTakerUpdated
                      items={questions}
                      currentQuestionId={currentQuestion.id}
                      answeredIds={answeredIds}
                      onItemClick={handleItemClick}
                      isClickable={false}
                    />
                  </Box>
                </Box>
              </Box>
            )}

          {view === "preview" && questions.length > 0 && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "1200px",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-end",
                gap: "24px",
                paddingLeft: "20px",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <FinalPreview
                  questionsAnswers={questions}
                  onAnswerUpdate={handleAnswerUpdate}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <Button
                  data-tour="generate-document-button"
                  variant="contained"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: "14px" }} />}
                  onClick={handleGenerateDocument}
                  disabled={
                    view !== "preview" || !allQuestionsAnswered || isUploading
                  }
                  sx={{
                    background: "linear-gradient(135deg, #3EA3FF, #FF3C80)",
                    color: "#fff",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    fontSize: "13px",
                    fontWeight: 600,
                    padding: "10px 20px",
                    borderRadius: "10px",
                    boxShadow: "0 3px 8px rgba(62, 163, 255, 0.3)",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2E8FE6, #E6356D)",
                    },
                    "&:disabled": {
                      background: "#ccc",
                      color: "#666",
                    },
                  }}
                >
                  {isUploading ? "Uploading..." : "Generate Document"}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default GTMPage;