// src/components/onboarding/OnboardingProvider.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import Joyride, {
  CallBackProps,
  STATUS,
  Step,
  TooltipRenderProps,
} from "react-joyride";
import { usePathname } from "next/navigation";
import { CustomTooltip } from "./tours/DashboardTour";

export type TourType =
  | "dashboard"
  | "user_input"
  | "document_preview"
  | "final_preview";

interface OnboardingContextType {
  startTour: (tourType: TourType, steps: Step[]) => void;
  stopTour: () => void;
  isTourActive: boolean;
  currentTour: TourType | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

const ConditionalTooltip = (props: TooltipRenderProps) => {
  if (
    props.index === 0 &&
    props.step.content &&
    typeof props.step.content !== "string"
  ) {
    return <div {...props.tooltipProps}>{props.step.content}</div>;
  }

  return <CustomTooltip {...props} />;
};

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentTour, setCurrentTour] = useState<TourType | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const user = JSON.parse(userStr);

        if (user.onboarding_status === false) {
          const tourMapping: Record<string, TourType> = {
            "/dashboard": "dashboard",
            "/views/ICP": "user_input",
            "/views/data-upload": "document_preview",
            "/views/final-preview": "final_preview",
          };

          const tourType = tourMapping[pathname];
          if (tourType) {
            let tourCompleted = false;

            if (tourType === "dashboard") {
              tourCompleted = user.dashboard_status === true;
            } else if (tourType === "user_input") {
              tourCompleted = user.user_input_status === true;
            } else if (tourType === "document_preview") {
              tourCompleted = user.document_preview_status === true;
            } else if (tourType === "final_preview") {
              tourCompleted = user.final_preview_status === true;
            }

            if (!tourCompleted) {
              setTimeout(() => {
                console.log(`Ready to start ${tourType} tour`);
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [pathname]);

  const startTour = useCallback((tourType: TourType, tourSteps: Step[]) => {
    console.log(`🎬 [OnboardingProvider] Starting tour: ${tourType}`);
    setCurrentTour(tourType);
    setSteps(tourSteps);
    setRun(true);
  }, []);

  const stopTour = useCallback(() => {
    setRun(false);
    setCurrentTour(null);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, step } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      console.log(`🏁 Tour ${currentTour} finished with status: ${status}`);
      setRun(false);

      if (currentTour) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);

            console.log(`📝 Before update:`, user);

            // ✅ CHECK: Is this a partial completion or final completion?
            const isPartialCompletion = step?.data?.isPartialCompletion === true;

            if (isPartialCompletion) {
              console.log('⏸️ Partial tour completion - NOT updating status yet');
              console.log('⏸️ Waiting for user to generate answer and see step 4...');
              // ✅ DON'T clear currentTour - we need it to continue with step 4
              // ✅ DON'T update localStorage
              return;
            }

            // ✅ This is the FINAL step or user skipped - update the status
            if (currentTour === "dashboard") {
              user.dashboard_status = true;
            } else if (currentTour === "user_input") {
              user.user_input_status = true;
              console.log('✅ Setting user_input_status to TRUE (final step completed)');
            } else if (currentTour === "document_preview") {
              user.document_preview_status = true;
            } else if (currentTour === "final_preview") {
              user.final_preview_status = true;
            }

            // Check if all tours are completed
            const allToursCompleted =
              user.dashboard_status === true &&
              user.user_input_status === true &&
              user.document_preview_status === true &&
              user.final_preview_status === true;

            if (allToursCompleted) {
              user.onboarding_status = true;
              console.log('🎉 All tours completed! Setting onboarding_status to TRUE');
            }

            localStorage.setItem("user", JSON.stringify(user));

            console.log(`📝 After update:`, user);
            console.log(`✅ ${currentTour} tour completed and saved to localStorage!`);
          }
        } catch (error) {
          console.error("❌ Error updating tour status:", error);
        }
      }

      setCurrentTour(null);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        startTour,
        stopTour,
        isTourActive: run,
        currentTour,
      }}
    >
      {children}
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress={false}
        showSkipButton={false}
        hideCloseButton
        disableCloseOnEsc
        disableOverlayClose
        scrollToFirstStep
        scrollOffset={100}
        tooltipComponent={ConditionalTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};