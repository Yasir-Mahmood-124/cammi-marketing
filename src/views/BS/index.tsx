// BSPage.tsx
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DocumentQuestion from "../ICP/DocumentQuestion";
import UploadDocument from "../ICP/UploadDocument";
import UserInput from "../ICP/UserInput";
import InputTakerUpdated from "../ICP/InputTakerUpdated";
import FinalPreview from "../ICP/FinalPreview";
import Generating from "../ICP/Generating";
import DocumentPreview from "../ICP/DocumentPreview";
import { useGet_unanswered_questionsQuery } from "@/redux/services/common/getUnansweredQuestionsApi";
import { useGetQuestionsQuery } from "@/redux/services/common/getQuestionsApi";
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
  setIsGenerating,
  setWsUrl,
  setDocumentData,
  setShouldFetchUnanswered,
  setShouldFetchAll,
  setShowDocumentPreview,
  setCompletionMessageReceived,
  setCurrentQuestionIndex,
  setAnsweredIds,
} from "@/redux/services/bs/bsSlice";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { useUserInputTour } from "@/components/onboarding/tours/userInputTour/useUserInputTour";

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

const BSPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const documentFetchTriggered = useRef(false);
  const mountRecoveryTriggered = useRef(false);
  const hasCheckedForRefetch = useRef(false);
  const refetchTimestamp = useRef(Date.now());

  const [wasUploadInterrupted, setWasUploadInterrupted] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const {
    view,
    questions,
    currentQuestionIndex,
    answeredIds,
    projectId,
    isGenerating,
    wsUrl,
    showDocumentPreview,
    docxBase64,
    fileName,
    shouldFetchUnanswered,
    shouldFetchAll,
    generatingProgress,
    generatingContent,
    hasReceivedCompletionMessage,
    displayedContent,
  } = useSelector((state: RootState) => state.bs);

  const [uploadTextFile, { isLoading: isUploading }] =
    useUploadTextFileMutation();
  const [getDocxFile, { isLoading: isDownloading }] = useGetDocxFileMutation();

  const uploadWebSocketUrl = process.env.NEXT_PUBLIC_UPLOAD_WEBSOCKET_URL as string;
  const realtimeWebSocketUrl = process.env.NEXT_PUBLIC_REALTIME_WEBSOCKET_URL as string;

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswer = !!(
    currentQuestion?.answer && currentQuestion.answer.trim() !== ""
  );

  const componentsReady =
    view === "questions" &&
    questions.length > 0 &&
    currentQuestion !== undefined &&
    !isGenerating &&
    !showDocumentPreview;

  const readyForRegenerateStep = hasAnswer && isTypingComplete;

  console.log("🎯 [BS Page] Tour conditions:", {
    view,
    questionsLength: questions.length,
    hasCurrentQuestion: !!currentQuestion,
    isGenerating,
    showDocumentPreview,
    componentsReady,
    hasAnswer,
    isTypingComplete,
    readyForRegenerateStep,
  });

  useUserInputTour(componentsReady, readyForRegenerateStep);

  useEffect(() => {
    console.log('🔄 [BS] Answer changed, resetting typing state');
    setIsTypingComplete(false);
  }, [currentQuestion?.answer, currentQuestionIndex]);

  useEffect(() => {
    console.log('🎯 [BS Tour Debug]', {
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

  useEffect(() => {
    if (wasUploadInterrupted) {
      console.log("⚠️ [BS] Upload was interrupted - showing message");
      toast.error(
        "Document analysis was interrupted due to page navigation or refresh. Please upload again.",
        { duration: 5000 }
      );
      setWasUploadInterrupted(false);
    }
  }, []);

  useEffect(() => {
    const currentProjectStr = localStorage.getItem("currentProject");
    if (currentProjectStr) {
      try {
        const currentProject: CurrentProject = JSON.parse(currentProjectStr);
        if (currentProject.project_id !== projectId) {
          dispatch(setProjectId(currentProject.project_id));
        }
      } catch (error) {
        console.error("❌ [BS Project] Error parsing currentProject:", error);
      }
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (view === "initial" || view === "upload") {
      const isNotUploadUrl = wsUrl && !wsUrl.startsWith(uploadWebSocketUrl);
      if (!wsUrl || isNotUploadUrl) {
        console.log("🔗 [BS] Setting upload WebSocket URL from ENV");
        dispatch(setWsUrl(uploadWebSocketUrl));
      }
    }
  }, [view, wsUrl, dispatch, uploadWebSocketUrl]);

  const {
    data: unansweredData,
    isLoading: isLoadingUnanswered,
    isError: isErrorUnanswered,
  } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "bs",
      _timestamp: refetchTimestamp.current,
    } as any,
    {
      skip: !shouldFetchUnanswered || !projectId,
      refetchOnMountOrArgChange: 0.1,
    }
  );

  const {
    data: allQuestionsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useGetQuestionsQuery(
    {
      project_id: projectId,
      document_type: "bs",
      _timestamp: refetchTimestamp.current,
    } as any,
    {
      skip: !shouldFetchAll || !projectId,
      refetchOnMountOrArgChange: 0.1,
    }
  );

  useEffect(() => {
    return () => {
      console.log("🧹 [BS Unmount] Cleaning up for fresh fetch on return");
      toast.dismiss("analyzing-doc");
      console.log("🧹 [BS Unmount] Dismissed analyzing toast");

      if (!isGenerating && !showDocumentPreview) {
        if (view === "questions" && questions.length > 0) {
          console.log(
            "📋 [BS Unmount] Was on questions - will refetch on return"
          );
          dispatch(setQuestions([]));
          dispatch(setCurrentQuestionIndex(0));
          dispatch(setAnsweredIds([]));
          dispatch(setShouldFetchUnanswered(false));
          hasCheckedForRefetch.current = false;
          refetchTimestamp.current = Date.now();
        }

        if (view === "preview" && questions.length > 0) {
          console.log(
            "📋 [BS Unmount] Was on preview - will refetch on return"
          );
          dispatch(setQuestions([]));
          dispatch(setShouldFetchAll(false));
          hasCheckedForRefetch.current = false;
          refetchTimestamp.current = Date.now();
        }
      }
    };
  }, [dispatch, isGenerating, showDocumentPreview, view, questions.length]);

  useEffect(() => {
    if (hasCheckedForRefetch.current) {
      return;
    }

    if (projectId && !isGenerating && !showDocumentPreview) {
      if (view === "questions" && questions.length === 0) {
        console.log(
          "📋 [BS Mount] On questions view - fetching unanswered questions"
        );
        hasCheckedForRefetch.current = true;
        refetchTimestamp.current = Date.now();

        setTimeout(() => {
          dispatch(setShouldFetchUnanswered(true));
        }, 100);
      } else if (view === "preview" && questions.length === 0) {
        console.log(
          "📋 [BS Mount] On preview view - fetching all answered questions"
        );
        hasCheckedForRefetch.current = true;
        refetchTimestamp.current = Date.now();

        setTimeout(() => {
          dispatch(setShouldFetchAll(true));
        }, 100);
      }
    }
  }, [
    projectId,
    view,
    dispatch,
    isGenerating,
    showDocumentPreview,
    questions.length,
  ]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      console.log(
        "⚠️ [BS Safety] currentQuestionIndex out of bounds, resetting to 0"
      );
      dispatch(setCurrentQuestionIndex(0));
    }
  }, [questions.length, currentQuestionIndex, dispatch]);

  const handleGenerationComplete = useCallback(async () => {
    if (documentFetchTriggered.current) {
      return;
    }

    documentFetchTriggered.current = true;

    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      const response = await getDocxFile({
        session_id: savedToken || "",
        document_type: "bs",
        project_id: project_id,
      }).unwrap();

      dispatch(
        setDocumentData({
          docxBase64: response.docxBase64,
          fileName: response.fileName || "bs_document.docx",
        })
      );

      toast.success("Document ready for preview!");
    } catch (error: any) {
      console.error("❌ [BS Document] Fetch failed:", error);
      toast.error("Failed to fetch document. Please try again.");
      documentFetchTriggered.current = false;
    }
  }, [dispatch, getDocxFile]);

  useEffect(() => {
    if (mountRecoveryTriggered.current) {
      console.log(
        "↩️ [Recovery] Already triggered during this mount, skipping duplicate"
      );
      return;
    }
    mountRecoveryTriggered.current = true;

    console.log(
      "╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║           🔍 Mount Recovery Check (Enhanced)               ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝"
    );

    if (docxBase64 && fileName) {
      console.log("✅ [Recovery] Document already available in Redux");
      if (!showDocumentPreview) {
        dispatch(setShowDocumentPreview(true));
      }
      return;
    }

    if (hasReceivedCompletionMessage && !docxBase64) {
      console.log(
        "🎯 [Recovery] Completion message found - fetching document!"
      );
      setTimeout(() => {
        handleGenerationComplete();
      }, 1000);
      return;
    }

    if (isGenerating && !hasReceivedCompletionMessage && wsUrl) {
      console.log(
        "⚡ [Recovery] Generation active - restoring progress and WebSocket"
      );
      console.log("  ├─ Progress:", generatingProgress + "%");
      console.log("  ├─ wsUrl:", wsUrl);
      console.log("  └─ Re-triggering WebSocket connection...");

      mountRecoveryTriggered.current = true;

      setTimeout(() => {
        setTimeout(() => {
          dispatch(setIsGenerating(true));
        }, 100);
      }, 500);
      return;
    }

    if (isGenerating && !wsUrl) {
      console.log(
        "⚠️ [Recovery] Stale generation state detected - resetting..."
      );
      dispatch(setIsGenerating(false));
      toast.error("Generation state was interrupted. Please try again.");
      return;
    }

    if (!isGenerating) {
      console.log("✅ [Recovery] No active generation, normal state");
      return;
    }

    console.log("ℹ️ [Recovery] No specific recovery action required");

    return () => {
      console.log("🧹 [Cleanup] Resetting mount recovery flag for next mount");
      mountRecoveryTriggered.current = false;
    };
  }, [
    docxBase64,
    fileName,
    showDocumentPreview,
    hasReceivedCompletionMessage,
    isGenerating,
    generatingProgress,
    wsUrl,
    dispatch,
    handleGenerationComplete,
  ]);

  useEffect(() => {
    if (
      hasReceivedCompletionMessage &&
      !docxBase64 &&
      !documentFetchTriggered.current
    ) {
      handleGenerationComplete();
    }
  }, [hasReceivedCompletionMessage, docxBase64, handleGenerationComplete]);

  useEffect(() => {
    if (unansweredData) {
      console.log(
        "📥 [BS API Response] Unanswered questions received:",
        unansweredData
      );

      if (
        unansweredData.missing_questions &&
        unansweredData.missing_questions.length > 0
      ) {
        const formattedQuestions: Question[] =
          unansweredData.missing_questions.map((q, index) => ({
            id: index + 1,
            question: q,
            answer: "",
          }));

        console.log(
          `✅ [BS] Found ${formattedQuestions.length} unanswered questions`
        );
        dispatch(setQuestions(formattedQuestions));
        dispatch(setView("questions"));
        dispatch(setShouldFetchUnanswered(false));

        toast.success(
          `${formattedQuestions.length} unanswered question(s) found. Please provide answers.`
        );
      } else {
        console.log(
          "✅ [BS] No unanswered questions, fetching all answered questions"
        );
        dispatch(setShouldFetchUnanswered(false));
        dispatch(setShouldFetchAll(true));
      }
    }
  }, [unansweredData, dispatch]);

  useEffect(() => {
    if (allQuestionsData && allQuestionsData.questions) {
      console.log(
        "📥 [BS API Response] All questions received for preview:",
        allQuestionsData
      );

      const formattedQuestions: Question[] = allQuestionsData.questions.map(
        (q, index) => ({
          id: index + 1,
          question: q.question_text,
          answer: q.answer_text || "",
        })
      );

      console.log(
        `✅ [BS] Loaded ${formattedQuestions.length} answered questions for preview`
      );
      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("preview"));
      dispatch(setShouldFetchAll(false));

      if (formattedQuestions.length > 0) {
        toast.success("Processing complete! Preview ready.");
      }
    }
  }, [allQuestionsData, dispatch]);

  const allQuestionsAnswered =
    questions.length > 0 && questions.every((q) => q.answer.trim() !== "");

  const handleYesClick = () => {
    console.log("📤 [BS] User clicked Yes - preparing upload view");
    dispatch(setWsUrl(uploadWebSocketUrl));
    dispatch(setView("upload"));
  };

  const handleNoClick = () => {
    console.log(
      "📋 [BS] User clicked No - fetching fresh unanswered questions"
    );
    hasCheckedForRefetch.current = false;
    refetchTimestamp.current = Date.now();
    dispatch(setShouldFetchUnanswered(true));
  };

  const handleUploadInterrupted = () => {
    console.log("⚠️ [BS] Upload interrupted - setting flag");
    setWasUploadInterrupted(true);
  };

  const handleUploadComplete = (data: any) => {
    if (data.status === "processing_started") {
      return;
    }

    if (data.status === "analyzing_document") {
      toast.loading("Analyzing your document...", {
        id: "analyzing-doc",
        duration: Infinity,
      });
      return;
    }

    if (data.status === "questions_need_answers" && data.not_found_questions) {
      toast.dismiss("analyzing-doc");

      const formattedQuestions: Question[] = data.not_found_questions.map(
        (item: any, index: number) => {
          const questionText = item.question || item.question_text || item;
          return {
            id: index + 1,
            question:
              typeof questionText === "string"
                ? questionText
                : String(questionText),
            answer: "",
          };
        }
      );

      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("questions"));
      toast.success("Some questions need answers. Please review them.");
      return;
    }

    if (data.status === "processing_complete") {
      toast.dismiss("analyzing-doc");

      if (data.results) {
        const notFoundQuestions = Object.entries(data.results)
          .filter(([_, answer]) => answer === "Not Found")
          .map(([question, _], index) => ({
            id: index + 1,
            question: question,
            answer: "",
          }));

        if (notFoundQuestions.length > 0) {
          dispatch(setQuestions(notFoundQuestions));
          dispatch(setView("questions"));
          toast.success("Some questions need answers. Please review them.");
        } else {
          console.log("📋 [BS] All questions answered - fetching for preview");
          dispatch(setQuestions([]));
          refetchTimestamp.current = Date.now();
          dispatch(setShouldFetchAll(true));
        }
      } else {
        console.log("📋 [BS] Processing complete - fetching for preview");
        dispatch(setQuestions([]));
        refetchTimestamp.current = Date.now();
        dispatch(setShouldFetchAll(true));
      }
      return;
    }

    if (data.message === "Forbidden" || data.status === "error") {
      toast.dismiss("analyzing-doc");
      toast.error(
        `WebSocket Error: ${data.message || "Something went wrong."}`
      );
      return;
    }
  };

  const handleGenerate = (generatedAnswer: string) => {
    dispatch(updateCurrentQuestionAnswer(generatedAnswer));
  };

  const handleRegenerate = () => {
    // console.log('Regenerate answer');
  };

  const handleConfirm = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.answer) {
      dispatch(addAnsweredId(currentQuestion.id));
      toast.success("Answer confirmed successfully!");

      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        console.log(
          "📋 [BS] All questions answered - fetching fresh data for preview"
        );
        toast.success("All questions answered! Loading preview...");
        dispatch(setQuestions([]));
        refetchTimestamp.current = Date.now();
        dispatch(setShouldFetchAll(true));
      }
    } else {
      toast.error("Please provide an answer before confirming!");
    }
  };

  const handleItemClick = (id: number) => {
    dispatch(goToQuestion(id));
  };

  const handleBackToQuestions = () => {
    dispatch(setView("questions"));
  };

  const handleAnswerUpdate = (id: number, newAnswer: string) => {
    dispatch(updateQuestionAnswer({ id, answer: newAnswer }));
  };

  const handleTypingComplete = useCallback(() => {
    console.log('✅ [BS] Typing animation complete');
    setIsTypingComplete(true);
  }, []);

  const handleGenerateDocument = async () => {
    try {
      documentFetchTriggered.current = false;
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
        document_type: "bs",
      };

      const uploadPromise = uploadTextFile(payload).unwrap();

      await toast.promise(uploadPromise, {
        loading: "Uploading your answers...",
        success:
          "Answers uploaded successfully! Starting document generation...",
        error: "Failed to upload answers. Please try again.",
      });

      const savedTokenForWs = Cookies.get("token");
      const websocketUrl = `${realtimeWebSocketUrl}?session_id=${savedTokenForWs}`;

      console.log(
        "╔════════════════════════════════════════════════════════════╗"
      );
      console.log(
        "║          🚀 STARTING BS DOCUMENT GENERATION               ║"
      );
      console.log(
        "╚════════════════════════════════════════════════════════════╝"
      );
      console.log("🔌 [BS] Base WebSocket URL:", realtimeWebSocketUrl);
      console.log("🔌 [BS] Full WebSocket URL:", websocketUrl);
      console.log(
        "🔑 [BS] Session Token:",
        savedTokenForWs ? "✅ Present" : "❌ Missing"
      );
      console.log("📦 [BS] Project ID:", project_id);
      console.log("📦 [BS] Dispatching Redux actions...");

      dispatch(setWsUrl(websocketUrl));
      console.log("✅ [BS] wsUrl dispatched to Redux");

      await new Promise((resolve) => setTimeout(resolve, 100));

      dispatch(setIsGenerating(true));
      console.log("✅ [BS] isGenerating=true dispatched to Redux");
      console.log(
        "⏳ [BS] Waiting for middleware to establish WebSocket connection..."
      );
    } catch (err: any) {
      console.error("❌ [BS Upload] Error:", err);
      toast.error("Upload failed. Please try again.");
      dispatch(setIsGenerating(false));
      dispatch(setWsUrl(""));
    }
  };

  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isError = isErrorUnanswered || isErrorAll;
  const showButton = view === "preview";

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
          documentType="bs"
        />
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
          <Generating wsUrl={wsUrl} documentType="bs" />
        </Box>
      ) : (
        <>
          {view === "initial" && (
            <DocumentQuestion
              onYesClick={handleYesClick}
              onNoClick={handleNoClick}
              isLoading={isLoading}
            />
          )}

          {view === "upload" && (
            <UploadDocument
              document_type="bs"
              wsUrl={wsUrl}
              onUploadComplete={handleUploadComplete}
              onUploadInterrupted={handleUploadInterrupted}
            />
          )}

          {view === "questions" && questions.length > 0 && (
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
                    number={questions[currentQuestionIndex].id}
                    question={questions[currentQuestionIndex].question}
                    answer={questions[currentQuestionIndex].answer}
                    documentType="bs"
                    isLoading={false}
                    onGenerate={handleGenerate}
                    onRegenerate={handleRegenerate}
                    onConfirm={handleConfirm}
                    onTypingComplete={handleTypingComplete}
                  />
                </Box>

                <Box sx={{ flex: "0 0 300px", height: "100%" }}>
                  <InputTakerUpdated
                    items={questions}
                    currentQuestionId={questions[currentQuestionIndex].id}
                    answeredIds={answeredIds}
                    onItemClick={handleItemClick}
                    isClickable={false}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {view === "preview" && questions.length === 0 && isLoadingAll && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
              }}
            >
              <div style={{ fontFamily: "Poppins", color: "#666" }}>
                Loading preview...
              </div>
            </Box>
          )}

          {view === "preview" && questions.length > 0 && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "1200px",
                display: "flex",
                justifyContent: "flex-start",
                paddingLeft: "20px",
              }}
            >
              <Box sx={{ width: "100%" }}>
                {questions.some((q) => q.answer === "") && (
                  <Button
                    onClick={handleBackToQuestions}
                    sx={{
                      color: "#3EA3FF",
                      textTransform: "none",
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      fontWeight: 500,
                      marginBottom: "16px",
                      "&:hover": {
                        backgroundColor: "rgba(62, 163, 255, 0.1)",
                      },
                    }}
                  >
                    ← Back to Questions
                  </Button>
                )}

                <FinalPreview
                  questionsAnswers={questions}
                  onAnswerUpdate={handleAnswerUpdate}
                />
              </Box>
            </Box>
          )}

          {showButton && (
            <Box sx={{ position: "fixed", bottom: "20px", right: "70px" }}>
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
          )}
        </>
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default BSPage;