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
import DocumentSelection from "./DocumentSelection";
import GeneratedDocumentsList from "./GeneratedDocumentsList";
import { useGet_unanswered_questionsQuery } from "@/redux/services/common/getUnansweredQuestionsApi";
import { useGetQuestionsQuery } from "@/redux/services/common/getQuestionsApi";
import { useRefineMutation } from "@/redux/services/common/refineApi";
import { useUploadTextFileMutation } from "@/redux/services/common/uploadApiSlice";
import { useGetGtmDocumentMutation } from "@/redux/services/document/getGtmDocument";
import { RootState, AppDispatch } from "@/redux/store";
import {
  setView,
  setSelectedDocumentTypes,
  setCurrentViewingDocument,
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
  setGtmExists,
  resetGTMState,
} from "@/redux/services/gtm/gtmSlice";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";

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
  const documentFetchTriggered = useRef(false);
  const mountRecoveryTriggered = useRef(false);
  const initialMountFetchDone = useRef(false); // 🔥 Track if mount fetch happened

  const [isRehydrated, setIsRehydrated] = useState(false);

  // Get state from Redux
  const {
    view,
    selectedDocumentTypes,
    currentViewingDocument,
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
    gtmExists,
  } = useSelector((state: RootState) => state.gtm);

  // Redux mutation hooks
  const [refine, { isLoading: isRefining }] = useRefineMutation();
  const [uploadTextFile, { isLoading: isUploading }] =
    useUploadTextFileMutation();
  const [getGtmDocument, { isLoading: isDownloading }] =
    useGetGtmDocumentMutation();

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

  // Persist selectedDocumentTypes to localStorage
  useEffect(() => {
    if (selectedDocumentTypes.length > 0) {
      localStorage.setItem(
        "gtm_selectedDocumentTypes",
        JSON.stringify(selectedDocumentTypes)
      );
    }
  }, [selectedDocumentTypes]);

  // Restore selectedDocumentTypes from localStorage on mount
  useEffect(() => {
    if (!isRehydrated) return;

    const savedTypes = localStorage.getItem("gtm_selectedDocumentTypes");
    if (savedTypes && selectedDocumentTypes.length === 0) {
      try {
        const parsed = JSON.parse(savedTypes);
        if (parsed.length > 0) {
          console.log("🔄 [Recovery] Restoring selectedDocumentTypes:", parsed);
          dispatch(setSelectedDocumentTypes(parsed));
        }
      } catch (error) {
        console.error("Failed to parse saved document types:", error);
      }
    }
  }, [isRehydrated, dispatch, selectedDocumentTypes.length]);

  // Clear localStorage when on selection view and no documents selected
  useEffect(() => {
    if (view === "selection" && selectedDocumentTypes.length === 0) {
      localStorage.removeItem("gtm_selectedDocumentTypes");
      console.log("🧹 [Cleanup] Cleared localStorage");
    }
  }, [view, selectedDocumentTypes.length]);

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

  // 🔥 FIXED: Mount fetch - only runs ONCE on mount after rehydration
  useEffect(() => {
    // Don't run until rehydrated
    if (!isRehydrated || !projectId) {
      return;
    }

    // 🔥 Only run ONCE per mount
    if (initialMountFetchDone.current) {
      console.log("↩️ [Mount Fetch] Already done, skipping");
      return;
    }

    // Skip if on these views
    if (view === "selection" || view === "documentsList" || isGenerating) {
      console.log(`⏸️ [Mount Fetch] Skipping - view: ${view}`);
      return;
    }

    console.log("🚀 [GTM Mount] Running ONE-TIME mount fetch");
    console.log(`  ├─ View: ${view}`);
    console.log(`  ├─ Questions count: ${questions.length}`);
    console.log(`  └─ Selected documents: ${selectedDocumentTypes.length}`);

    initialMountFetchDone.current = true; // 🔥 Mark as done

    // Fetch based on current view
    if (view === "questions" && selectedDocumentTypes.length > 0) {
      console.log("🔄 [Mount Fetch] Fetching unanswered questions");
      setTimeout(() => {
        dispatch(setShouldFetchUnanswered(true));
      }, 100);
    } else if (view === "preview" && selectedDocumentTypes.length > 0) {
      console.log("🔄 [Mount Fetch] Fetching all questions");
      setTimeout(() => {
        dispatch(setShouldFetchAll(true));
      }, 100);
    }
  }, [isRehydrated, projectId]); // 🔥 ONLY these dependencies - no view!

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
      console.log("⚠️ [GTM Safety] currentQuestionIndex out of bounds, resetting to 0");
      dispatch(setCurrentQuestionIndex(0));
    }
  }, [questions.length, currentQuestionIndex, dispatch]);

  // Handle document selection confirmation
  const handleDocumentSelectionConfirm = useCallback(
    (selectedTypes: string[]) => {
      console.log("📄 [GTM Selection] User selected:", selectedTypes);
      dispatch(setSelectedDocumentTypes(selectedTypes));

      localStorage.setItem(
        "gtm_selectedDocumentTypes",
        JSON.stringify(selectedTypes)
      );

      // 🔥 Reset mount fetch flag to allow new fetch
      initialMountFetchDone.current = false;

      // Trigger fetch
      setTimeout(() => {
        dispatch(setShouldFetchUnanswered(true));
      }, 50);

      toast.success(`Selected ${selectedTypes.length} document type(s)`);
    },
    [dispatch]
  );

  // Handle document fetching
  const handleFetchDocument = useCallback(
    async (documentType: string) => {
      if (documentFetchTriggered.current) {
        return;
      }

      documentFetchTriggered.current = true;

      try {
        const savedToken = Cookies.get("token");
        const project_id = JSON.parse(
          localStorage.getItem("currentProject") || "{}"
        ).project_id;

        const readableName = documentType.replace("gtm-", "");
        toast.loading(`Fetching ${readableName} document...`, {
          id: "fetch-doc",
        });

        const response = await getGtmDocument({
          session_id: savedToken || "",
          project_id: project_id,
          document_type: documentType,
        }).unwrap();

        if (!response.docxBase64) {
          throw new Error("Document content not found in response");
        }

        dispatch(
          setDocumentData({
            docxBase64: response.docxBase64,
            fileName: response.fileName || `${documentType}_document.docx`,
          })
        );

        dispatch(setCurrentViewingDocument(documentType));
        toast.dismiss("fetch-doc");
        toast.success("Document ready for preview!");
      } catch (error: any) {
        console.error("❌ [GTM Document] Fetch failed:", error);
        toast.dismiss("fetch-doc");

        let errorMessage = "Failed to fetch document. Please try again.";
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
        documentFetchTriggered.current = false;
      }
    },
    [dispatch, getGtmDocument]
  );

  const handleDocumentClick = useCallback(
    (documentType: string) => {
      documentFetchTriggered.current = false;
      handleFetchDocument(documentType);
    },
    [handleFetchDocument]
  );

  // 🔥 FIXED: Reset all state after Save All
  const handleSaveAllDocuments = useCallback(async () => {
    console.log("💾 [GTM Save All] Starting to save all documents");

    const savedToken = Cookies.get("token");
    const project_id = JSON.parse(
      localStorage.getItem("currentProject") || "{}"
    ).project_id;

    if (!savedToken || !project_id) {
      toast.error("Missing authentication or project information");
      throw new Error("Missing credentials");
    }

    const totalDocs = selectedDocumentTypes.length;
    let savedCount = 0;
    let failedDocs: string[] = [];

    const loadingToastId = toast.loading(
      `Saving documents... (0/${totalDocs})`
    );

    try {
      for (const documentType of selectedDocumentTypes) {
        try {
          toast.loading(`Saving documents... (${savedCount}/${totalDocs})`, {
            id: loadingToastId,
          });

          await getGtmDocument({
            session_id: savedToken,
            project_id: project_id,
            document_type: documentType,
          }).unwrap();

          savedCount++;
        } catch (error: any) {
          console.error(`❌ [GTM Save All] Failed to save ${documentType}:`, error);
          failedDocs.push(documentType);
        }
      }

      toast.dismiss(loadingToastId);

      if (failedDocs.length === 0) {
        toast.success(`All ${savedCount} documents saved successfully!`);

        // 🔥 RESET ALL STATE after successful save
        console.log("🔄 [GTM] Resetting all state after Save All");
        localStorage.removeItem("gtm_selectedDocumentTypes");
        initialMountFetchDone.current = false;
        dispatch(resetGTMState());

      } else if (savedCount > 0) {
        toast.success(`Saved ${savedCount} documents`);
        toast.error(`Failed to save ${failedDocs.length} document(s)`);
      } else {
        throw new Error("Failed to save all documents");
      }
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      throw error;
    }
  }, [selectedDocumentTypes, getGtmDocument, dispatch]);

  const handleGenerationComplete = useCallback(() => {
    console.log("✅ [GTM Generation] Complete - showing document list");
    dispatch(setIsGenerating(false));
    dispatch(setView("documentsList"));
    dispatch(setShouldFetchUnanswered(false));
    dispatch(setShouldFetchAll(false));
    documentFetchTriggered.current = false;
    toast.success("All documents generated successfully!");
  }, [dispatch]);

  // Mount recovery - only for edge cases
  useEffect(() => {
    if (!isRehydrated) return;

    if (mountRecoveryTriggered.current) {
      return;
    }
    mountRecoveryTriggered.current = true;

    console.log("🔍 [Recovery] Running edge case checks");

    if (
      view === "documentsList" &&
      selectedDocumentTypes.length === 0 &&
      !isGenerating
    ) {
      console.log("⚠️ [Recovery] On document list but no selected documents");
      const savedTypes = localStorage.getItem("gtm_selectedDocumentTypes");
      if (savedTypes) {
        try {
          const parsed = JSON.parse(savedTypes);
          if (parsed.length > 0) {
            dispatch(setSelectedDocumentTypes(parsed));
            return;
          }
        } catch (error) {
          console.error("Failed to restore document types:", error);
        }
      }
      dispatch(setView("selection"));
      toast.error("Session lost. Please select documents again.");
      return;
    }

    if (docxBase64 && fileName && !showDocumentPreview) {
      dispatch(setShowDocumentPreview(true));
      return;
    }

    if (hasReceivedCompletionMessage && !docxBase64 && view !== "documentsList") {
      dispatch(setView("documentsList"));
      return;
    }

    if (isGenerating && generatingProgress === 100 && !hasReceivedCompletionMessage) {
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
    selectedDocumentTypes.length,
    dispatch,
  ]);

  // Watch for completion message flag changes
  useEffect(() => {
    if (hasReceivedCompletionMessage && view !== "documentsList") {
      handleGenerationComplete();
    }
  }, [hasReceivedCompletionMessage, view, handleGenerationComplete]);

  // Safety: Watch for 100% progress without completion message
  useEffect(() => {
    if (
      isGenerating &&
      generatingProgress === 100 &&
      !hasReceivedCompletionMessage &&
      view !== "documentsList"
    ) {
      console.log("⚠️ [GTM Safety] 100% reached, forcing completion");
      setTimeout(() => {
        dispatch(setCompletionMessageReceived(true));
      }, 2000);
    }
  }, [isGenerating, generatingProgress, hasReceivedCompletionMessage, view, dispatch]);

  // 🔥 FIXED: Handle unanswered questions response - prevent preview flash
  useEffect(() => {
    if (!unansweredData) return;

    console.log("📥 [GTM API Response] Unanswered questions received:", unansweredData);

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
    if (parsedData.missing_questions && parsedData.missing_questions.length > 0) {
      const formattedQuestions: Question[] =
        parsedData.missing_questions.map((q: string, index: number) => ({
          id: index + 1,
          question: q,
          answer: "",
        }));

      console.log(`✅ [Scenario 1] Found ${formattedQuestions.length} unanswered questions`);
      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("questions"));
      dispatch(setShouldFetchUnanswered(false));
      toast.success("Questions loaded successfully!");

    } else {
      // No unanswered questions - check gtm_exists flag
      const gtmExistsFlag = parsedData.gtm_exists || false;

      console.log(`✅ [GTM] No unanswered questions. gtm_exists: ${gtmExistsFlag}`);

      dispatch(setGtmExists(gtmExistsFlag));
      dispatch(setShouldFetchUnanswered(false));

      if (gtmExistsFlag) {
        // 🔥 Scenario 3: GTM documents exist - go DIRECTLY to documentsList (NO preview)
        console.log("🎯 [Scenario 3] Documents exist - going DIRECTLY to documentsList");
        dispatch(setView("documentsList"));
        toast.success("GTM documents already generated!");

      } else {
        // 🔥 Scenario 2: No documents - fetch all questions for preview
        console.log("📋 [Scenario 2] No documents - fetching all questions for preview");
        dispatch(setShouldFetchAll(true));
      }
    }
  }, [unansweredData, dispatch]);

  // Handle all questions (answered) response
  useEffect(() => {
    if (!allQuestionsData || !allQuestionsData.questions) return;

    console.log("📥 [GTM API Response] All questions received:", allQuestionsData);

    const formattedQuestions: Question[] = allQuestionsData.questions.map(
      (q: any, index: number) => ({
        id: index + 1,
        question: q.question_text,
        answer: q.answer_text || "",
      })
    );

    console.log(`✅ [GTM] Loaded ${formattedQuestions.length} answered questions`);
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

  const handleGenerateDocument = async () => {
    try {
      documentFetchTriggered.current = false;
      mountRecoveryTriggered.current = false;

      const dynamicFileName = "businessidea.txt";
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

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
        success: "Answers uploaded successfully! Starting document generation...",
        error: "Failed to upload answers. Please try again.",
      });

      const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;

      dispatch(setWsUrl(websocketUrl));
      dispatch(setIsGenerating(true));
    } catch (err: any) {
      console.error("❌ [GTM Upload] Error:", err);
      toast.error("Upload failed. Please try again.");
    }
  };

  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isFetching = isFetchingUnanswered || isFetchingAll;
  const isError = isErrorUnanswered || isErrorAll;

  const currentQuestion = questions[currentQuestionIndex];
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

  if (showDocumentPreview && docxBase64 && currentViewingDocument) {
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
          documentType={currentViewingDocument as any}
        />
      </Box>
    );
  }

  // 🔥 Show loader when fetching data after clicking continue
  if (isFetching && view !== "selection" && view !== "documentsList" && questions.length === 0) {
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
        <div style={{ fontFamily: "Poppins", color: "#666", fontSize: "16px" }}>
          Loading...
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
      {isGenerating && view !== "documentsList" ? (
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
          {view === "selection" && (
            <DocumentSelection onConfirm={handleDocumentSelectionConfirm} />
          )}

          {view === "documentsList" && (
            <GeneratedDocumentsList
              selectedDocumentTypes={selectedDocumentTypes}
              onDocumentClick={handleDocumentClick}
              onSaveAll={handleSaveAllDocuments}
            />
          )}

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