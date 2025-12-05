// redux/middleware/gtmWebSocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { wsManager } from '../services/websocketManager';
import {
  setIsGenerating,
  setWsUrl,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setCompletionMessageReceived,
} from '../services/gtm/gtmSlice';

let unsubscribeMessage: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeClose: (() => void) | null = null;
let currentGenerationUrl: string | null = null;

// 🔥 Get WebSocket base URL from environment variable
const GTM_WEBSOCKET_BASE_URL = process.env.NEXT_PUBLIC_REALTIME_WEBSOCKET_URL || '';

export const gtmWebSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // 🔥 Listen for BOTH wsUrl changes AND isGenerating changes
  if (setWsUrl.match(action) || setIsGenerating.match(action)) {
    const state = store.getState();
    const { wsUrl, isGenerating } = state.gtm;

    // 🔥 Dynamic check: URL must start with configured base URL
    const isGTMWebSocket = wsUrl && (
      wsUrl.startsWith(GTM_WEBSOCKET_BASE_URL) ||
      wsUrl.includes('execute-api.us-east-1.amazonaws.com') // Fallback check
    );

    console.log("🔍 [GTM WS Middleware] Action triggered:", action.type);
    console.log("🔍 [GTM WS Middleware] Current wsUrl:", wsUrl || 'null');
    console.log("🔍 [GTM WS Middleware] isGenerating:", isGenerating);
    console.log("🔍 [GTM WS Middleware] isGTMWebSocket:", isGTMWebSocket);
    console.log("🔍 [GTM WS Middleware] Expected base URL:", GTM_WEBSOCKET_BASE_URL);

    if (isGTMWebSocket && isGenerating) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║    🌐 GTM Global WebSocket Middleware Activated           ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("🔗 [GTM Global WS] URL:", wsUrl);
      console.log("🔗 [GTM Global WS] isGenerating:", isGenerating);

      // Cleanup previous listeners if URL changed
      if (currentGenerationUrl && currentGenerationUrl !== wsUrl) {
        console.log("🔄 [GTM Global WS] URL changed, disconnecting old connection");
        console.log("   Old URL:", currentGenerationUrl);
        console.log("   New URL:", wsUrl);
        
        wsManager.disconnect();
        
        if (unsubscribeMessage) {
          console.log("🧹 [GTM Global WS] Unsubscribing old listeners");
          unsubscribeMessage();
          unsubscribeError?.();
          unsubscribeClose?.();
          unsubscribeMessage = null;
          unsubscribeError = null;
          unsubscribeClose = null;
        }
      }

      // Avoid duplicate connections to same URL
      if (currentGenerationUrl === wsUrl) {
        console.log("⏭️ [GTM Global WS] Already connected to this URL, skipping");
        return result;
      }

      currentGenerationUrl = wsUrl;

      // 🔥 Connect immediately
      console.log("🔌 [GTM Global WS] Initiating WebSocket connection...");
      console.log("⏱️ [GTM Global WS] Connection attempt at:", new Date().toISOString());
      
      wsManager.connect(wsUrl);

      // 🔥 Setup message listener
      unsubscribeMessage = wsManager.onMessage((message) => {
        try {
          const messagePreview = typeof message.body === 'number' 
            ? `${message.body}%`
            : typeof message.body === 'string' 
            ? message.body.length > 50 
              ? message.body.substring(0, 50) + '...' 
              : message.body
            : JSON.stringify(message.body);

          console.log("📨 [GTM Global WS] Message received:", {
            action: message.action,
            type: message.type,
            body: messagePreview,
            status: message.status,
            timestamp: new Date().toISOString()
          });

          // ✅ Completion message
          if (
            message.action === "sendMessage" &&
            message.body === "Document generated successfully!"
          ) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║   🌐✅✅ GTM GLOBAL COMPLETION MESSAGE RECEIVED ✅✅🌐   ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("💾 [GTM Global WS] Dispatching completion flag to Redux");
            
            store.dispatch(setCompletionMessageReceived(true));
            
            console.log("🧹 [GTM Global WS] Cleaning up WebSocket listeners");
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
            
            console.log("🔌 [GTM Global WS] Disconnecting WebSocket");
            wsManager.disconnect();
            currentGenerationUrl = null;
            
            return;
          }

          // 📊 Progress update
          if (message.action === "sendMessage" && typeof message.body === "number") {
            const newProgress = message.body;
            console.log("📊 [GTM Global WS] Progress update:", newProgress + "%");
            store.dispatch(setGeneratingProgress(newProgress));
            return;
          }

          // 📄 Content chunk
          if (message.type === "tier_completion" && message.data?.content?.content) {
            const newContent = message.data.content.content;
            console.log("📄 [GTM Global WS] Content chunk received:", newContent.length, "chars");

            const currentState = store.getState();
            const currentContent = currentState.gtm.generatingContent;

            if (currentContent === "Waiting for Document Generation...") {
              console.log("📝 [GTM Global WS] First content chunk - replacing placeholder");
              store.dispatch(setGeneratingContent(newContent));
            } else {
              console.log("📝 [GTM Global WS] Appending content chunk");
              store.dispatch(appendGeneratingContent(newContent));
            }
            return;
          }

          // ✅ Status completion
          if (message.status === "completed" || message.status === "complete") {
            console.log("✅ [GTM Global WS] Status completion indicator received");
            store.dispatch(setCompletionMessageReceived(true));
            
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
            
            wsManager.disconnect();
            currentGenerationUrl = null;
          }
        } catch (err) {
          console.error("❌ [GTM Global WS] Message processing error:", err);
          console.error("❌ [GTM Global WS] Problematic message:", message);
        }
      });

      // 🔥 Setup error listener
      unsubscribeError = wsManager.onError((err) => {
        console.error("╔════════════════════════════════════════════════════════════╗");
        console.error("║              ❌ GTM WEBSOCKET ERROR                        ║");
        console.error("╚════════════════════════════════════════════════════════════╝");
        console.error("❌ [GTM Global WS] WebSocket error:", err);
        console.error("❌ [GTM Global WS] URL was:", wsUrl);
        console.error("❌ [GTM Global WS] Timestamp:", new Date().toISOString());
      });

      // 🔥 Setup close listener
      unsubscribeClose = wsManager.onClose((event) => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║              🔗 GTM WEBSOCKET CLOSED                       ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("🔗 [GTM Global WS] WebSocket closed");
        console.log("   └─ Code:", event.code);
        console.log("   └─ Reason:", event.reason || 'No reason provided');
        console.log("   └─ Clean close:", event.wasClean);
        console.log("   └─ Timestamp:", new Date().toISOString());
        
        currentGenerationUrl = null;
      });

      console.log("✅ [GTM Global WS] All listeners registered successfully");
      
    } else if (!isGTMWebSocket && wsUrl) {
      console.log("⚠️ [GTM Global WS] URL present but doesn't match GTM pattern");
      console.log("   Provided URL:", wsUrl);
      console.log("   Expected to start with:", GTM_WEBSOCKET_BASE_URL);
    }
  }

  // 🛑 Cleanup when generation stops
  if (setIsGenerating.match(action) && action.payload === false) {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║         🛑 GTM GENERATION STOPPED - CLEANUP               ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("🌐 [GTM Global WS] Generation stopped - cleaning up");
    
    if (unsubscribeMessage) {
      console.log("🧹 [GTM Global WS] Unsubscribing all listeners");
      unsubscribeMessage();
      unsubscribeError?.();
      unsubscribeClose?.();
      unsubscribeMessage = null;
      unsubscribeError = null;
      unsubscribeClose = null;
    }
    
    console.log("🔌 [GTM Global WS] Disconnecting WebSocket");
    wsManager.disconnect();
    currentGenerationUrl = null;
    
    console.log("✅ [GTM Global WS] Cleanup complete");
  }

  return result;
};