"use client";

import React, { useRef, useEffect } from "react";

interface InputItem {
  id: number;
  question: string;
  answer: string;
}

interface InputTakerProps {
  items: InputItem[];
  currentQuestionId: number;
  answeredIds: number[];
  onItemClick?: (id: number) => void;
  isClickable?: boolean;
}

// Question to Short Form mapping
const questionMapping: { [key: string]: string } = {
  // ICP Questions
  "What is the name of your business?": "Business Name",
  "How would you describe your business concept in a few sentences?":
    "Business Concept",
  "Who is your main customer right now?": "Current Customer",
  "What are the top 3 goals you want to hit in the next 12 months?":
    "12-Month Goals",
  "What challenges are you facing in finding or converting customers?":
    "Customer Challenges",
  "Do you already know your best-fit customers or industries?":
    "Best-Fit Customers",

  // KMF Questions
  "Which industry does your business belong to?": "Industry",
  "What is the main objective or goal of your business?": "Business Goal",
  "Who is your target market or ideal customer?": "Target Customer",
  "What is your short value proposition (how you help customers in a simple way)?":
    "Value Proposition",
  "What is the long-term vision for your business?": "Long-Term Vision",
  "What key problems does your business solve for customers?":
    "Problems Solved",
  "What are the core products or services your business offers?":
    "Core Offerings",
  "What makes your business unique compared to competitors?":
    "Unique Differentiator",
  "What tone or personality should your brand convey (e.g., professional, friendly, innovative)?":
    "Brand Tone",
  "Are there any additional themes or values you want associated with your brand?":
    "Brand Values",

  // SR Questions
  "What is your value proposition (the main benefit your platform offers customers)?":
    "Value Proposition",
  "What is your business model (e.g., subscription, pay-per-download, freemium)?":
    "Business Model",
  "What is your primary geographic market focus?": "Geographic Focus",
  "How do you position your pricing (e.g., low-tier, mid-tier, premium)?":
    "Pricing Position",
  "What is your estimated marketing budget?": "Marketing Budget",
  "What stage of development is your business currently in?":
    "Development Stage",
  "What are your top user development priorities?": "User Priorities",
  "What are your key marketing objectives?": "Marketing Objectives",
  "When do you plan to start this project?": "Start Date",
  "When is your planned end date or long-term milestone?": "End Date/Milestone",

  // BS Questions
  "Which customers are approved to be publicly showcased?":
    "Approved Customers",
  "Can you provide links to approved customer video assets?": "Customer Videos",
  "Can you provide links to approved customer case studies?": "Case Studies",
  "What are the approved customer quotes you want to feature?":
    "Customer Quotes",
  "Can you provide links to approved customer logos or other visual assets?":
    "Customer Logos",
  "What brag points or achievements would you like to highlight?":
    "Achievements",
  "Who will act as the spokesperson for your business?": "Spokesperson",
  "What is the spokesperson's title or role?": "Spokesperson Title",
  "Can you provide links to your brand's visual assets (e.g., logo, product screenshots)?":
    "Brand Assets",

  // GTM Questions
  "What do you want to accomplish in one year?": "One-Year Goal",
  "Where do you want to be in three years?": "Three-Year Vision",
  "Where is your short term focus?": "Short-Term Focus",
  "Tell us about who you sell to? Where are they located?": "Customer Location",
  "What is unique about your business?": "Unique Factor",
  "What marketing tools do you have available to you?": "Marketing Tools",
  "What are your strengths, weaknesses, opps and threats?": "SWOT",
  "Tell us about your product/solution/service?": "Product/Service",

  // Common Questions
  "Who else is out there offering something similar to what you're doing?":
    "Competitors",

  // Messaging Questions
  "What’s the name of the brand we’re talking about?": "Brand Name",
  "In a nutshell, what are you offering, and what specific headache does it actually cure for people?":
    "Core Offer",
  "Who usually buys this? I'm thinking specific industries, job titles, or company sizes.":
    "Target Audience",
  "Deep down, what's the main mission here? What specific problem are you waking up to solve every day?":
    "Core Purpose",
  "Where do you see this going? Like, what's the dream scenario for the business down the road?":
    "Future Vision",
  "What’s that one thing that makes you totally different from everyone else doing this?":
    "Key Differentiator",

  // Brand Questions
  "How would you explain what the business does in plain English?":
    "Business Summary",
  "Who are we trying to get the attention of? What kind of people or companies are your 'people'?":
    "Target Crowd",
  "Why does this brand exist, and where are you hoping to take it eventually?":
    "Brand Mission",
  "If someone lined you up next to your competitors, what makes you stand out?":
    "Unique Factor",
  "How should the brand sound or feel? Also, are there any vibes you absolutely hate and want to avoid?":
    "Tone & Vibe",

  // MR Questions
  "How would you pitch what you do and who it's for if we were just chatting casually?":
    "Elevator Pitch",
  "What’s keeping your ideal customers up at night lately? What are their biggest annoyances?":
    "Customer Pain",
  "How are they trying to fix that stuff right now? Are they using other tools, vendors, or just messy workarounds?":
    "Current Solutions",
  "Why aren't the current options working for them, and how is your way better?":
    "Better Approach",
  "Where can you realistically take on clients over the next year or two? Is it global or specific regions?":
    "Service Area",
  "What does an average customer usually spend with you?": "Customer Value",
  "Do you have a feel for how many potential customers are actually out there for this?":
    "Market Size",
  "Who are you competing against, and are you seeing any big shifts in the market recently?":
    "Competition",

  // SMP Questions
  "How would you describe the business in just a sentence or two?":
    "Business Overview",
  "How does the money-making side work? Like pricing models, how you sell, that sort of thing.":
    "Revenue Model",
  "Who’s the target buyer here? Any specific industries, company sizes, or roles?":
    "Target Persona",
  "What is the number one problem you are helping people solve right now?":
    "Primary Problem",
  "What’s the big long-term vision you're building toward?": "Long-term Vision",
  "Fast forward a few years—what does 'success' look like to you for this business?":
    "Success Goal",

  // ICP2 Questions
  "Give me the quick scoop on the business—what you do and the big issue you fix.":
    "Business Recap",
  "Who is the primary decision-maker you want to target? What’s their job title and what are they responsible for?":
    "Decision Maker",
  "What kind of pressure is this person under? What goals are they stressed about hitting?":
    "Key Pressures",
  "Where does this person usually work? I'm curious about company size, industry, location, etc.":
    "Company Profile",
  "Where do they hang out online or get their info? Specific blogs, communities, or influencers?":
    "Info Sources",
};

const InputTakerUpdated: React.FC<InputTakerProps> = ({
  items,
  currentQuestionId,
  answeredIds,
  onItemClick,
  isClickable = true,
}) => {
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to get the display text for a question
  const getDisplayQuestion = (question: string): string => {
    return questionMapping[question] || question;
  };

  // Auto-scroll to current question with more context (showing ~4 questions)
  useEffect(() => {
    const currentItemRef = itemRefs.current[currentQuestionId];
    if (currentItemRef && containerRef.current) {
      const container = containerRef.current;
      const itemRect = currentItemRef.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const itemHeight = 67;
      const scrollOffset = itemHeight * 1.5;

      const scrollTop =
        currentItemRef.offsetTop - container.offsetTop - scrollOffset;

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }, [currentQuestionId]);

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div style={{ width: "100%", fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        @media (max-width: 600px) {
          .input-taker-container {
            padding: 16px !important;
            margin-top: -12px !important;
          }
          .input-taker-title {
            font-size: 16px !important;
            margin-bottom: 16px !important;
          }
          .input-taker-scroll {
            max-height: 280px !important;
          }
          .input-taker-item {
            width: 100% !important;
            height: 50px !important;
          }
        }
        
        @media (min-width: 601px) and (max-width: 900px) {
          .input-taker-container {
            padding: 18px !important;
            margin-top: -15px !important;
          }
          .input-taker-title {
            font-size: 18px !important;
            margin-bottom: 20px !important;
          }
          .input-taker-scroll {
            max-height: 320px !important;
          }
          .input-taker-item {
            width: 220px !important;
            height: 55px !important;
          }
        }
        
        @media (min-width: 901px) and (max-width: 1200px) {
          .input-taker-container {
            padding: 18px !important;
            margin-top: -15px !important;
          }
          .input-taker-title {
            font-size: 18px !important;
            margin-bottom: 20px !important;
          }
          .input-taker-scroll {
            max-height: 300px !important;
          }
          .input-taker-item {
            width: 220px !important;
            height: 55px !important;
          }
        }
        
        @media (min-width: 1201px) {
          .input-taker-container {
            padding: 22px !important;
            margin-top: -18px !important;
          }
          .input-taker-title {
            font-size: 22px !important;
            margin-bottom: 26px !important;
          }
          .input-taker-scroll {
            max-height: 400px !important;
          }
          .input-taker-item {
            width: 280px !important;
            height: 60px !important;
          }
        }

        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      <div
        className="input-taker-container"
        style={{
          padding: "20px",
          fontFamily: "Poppins, sans-serif",
          marginTop: "-18px",
          transition: "all 0.3s ease",
        }}
      >
        <h2
          className="input-taker-title"
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "24px",
            color: "#000",
            transition: "all 0.3s ease",
          }}
        >
          Document Generation
        </h2>

        <div
          data-tour="question-list"
          ref={containerRef}
          className="input-taker-scroll"
          style={{
            height: "100%",
            maxHeight: "360px",
            overflowY: "auto",
            paddingRight: "8px",
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #f1f1f1",
            transition: "max-height 0.3s ease",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {items.map((item) => {
              const isAnswered = answeredIds.includes(item.id);
              const isCurrent = item.id === currentQuestionId;
              const isActive = isAnswered || isCurrent;
              const displayQuestion = getDisplayQuestion(item.question);

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  className="input-taker-item"
                  onClick={() => isClickable && onItemClick?.(item.id)}
                  style={{
                    width: "247px",
                    height: "55px",
                    borderRadius: "12px",
                    background: isActive ? "#3EA3FF" : "#FAFAFA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    cursor: isClickable ? "pointer" : "default",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    opacity: isAnswered ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && isClickable) {
                      e.currentTarget.style.background = "#f0f0f0";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && isClickable) {
                      e.currentTarget.style.background = "#FAFAFA";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: isActive ? "#fff" : "#8A8787",
                        width: "20px",
                        flexShrink: 0,
                      }}
                    >
                      {item.id}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isActive ? "#fff" : "#000",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "2px",
                        }}
                      >
                        {truncateText(displayQuestion, 20)}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 400,
                          color: isActive
                            ? "rgba(255, 255, 255, 0.8)"
                            : "#8A8A8A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isAnswered
                          ? truncateText(item.answer, 22)
                          : "Not answered yet"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isActive ? "#fff" : "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isAnswered ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 13L9 17L19 7"
                          stroke="#3EA3FF"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 18L15 12L9 6"
                          stroke={isActive ? "#3EA3FF" : "#fff"}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputTakerUpdated;
