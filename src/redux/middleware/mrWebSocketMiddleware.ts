// redux/middleware/mrWebSocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { wsManager } from '../services/websocketManager';
import {
  setIsGenerating,
  setWsUrl,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setCompletionMessageReceived,
} from '../services/mr/mrSlice';

let unsubscribeMessage: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeClose: (() => void) | null = null;
let currentGenerationUrl: string | null = null;

// 🔥 Get WebSocket base URL from environment variable
const MR_WEBSOCKET_BASE_URL = process.env.NEXT_PUBLIC_REALTIME_WEBSOCKET_URL || '';

export const mrWebSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // 🔥 Listen for BOTH wsUrl changes AND isGenerating changes
  if (setWsUrl.match(action) || setIsGenerating.match(action)) {
    const state = store.getState();
    const { wsUrl, isGenerating } = state.mr;

    // 🔥 Dynamic check: URL must start with configured base URL
    const isMRWebSocket = wsUrl && (
      wsUrl.startsWith(MR_WEBSOCKET_BASE_URL) ||
      wsUrl.includes('execute-api.us-east-1.amazonaws.com') // Fallback check
    );

    console.log("🔍 [MR WS Middleware] Action triggered:", action.type);
    console.log("🔍 [MR WS Middleware] Current wsUrl:", wsUrl || 'null');
    console.log("🔍 [MR WS Middleware] isGenerating:", isGenerating);
    console.log("🔍 [MR WS Middleware] isMRWebSocket:", isMRWebSocket);
    console.log("🔍 [MR WS Middleware] Expected base URL:", MR_WEBSOCKET_BASE_URL);

    if (isMRWebSocket && isGenerating) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║    🌐 MR Global WebSocket Middleware Activated           ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("🔗 [MR Global WS] URL:", wsUrl);
      console.log("🔗 [MR Global WS] isGenerating:", isGenerating);

      // Cleanup previous listeners if URL changed
      if (currentGenerationUrl && currentGenerationUrl !== wsUrl) {
        console.log("🔄 [MR Global WS] URL changed, disconnecting old connection");
        console.log("   Old URL:", currentGenerationUrl);
        console.log("   New URL:", wsUrl);
        
        wsManager.disconnect();
        
        if (unsubscribeMessage) {
          console.log("🧹 [MR Global WS] Unsubscribing old listeners");
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
        console.log("⏭️ [MR Global WS] Already connected to this URL, skipping");
        return result;
      }

      currentGenerationUrl = wsUrl;

      // 🔥 Connect immediately
      console.log("🔌 [MR Global WS] Initiating WebSocket connection...");
      console.log("⏱️ [MR Global WS] Connection attempt at:", new Date().toISOString());
      
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

          console.log("📨 [MR Global WS] Message received:", {
            action: message.action,
            type: message.type,
            body: messagePreview,
            status: message.status,
            timestamp: new Date().toISOString()
          });

          // ✅ Completion message
          if (
            message.action === "realtimetext" &&
            message.body === "Document generated successfully!"
          ) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║   🌐✅✅ MR GLOBAL COMPLETION MESSAGE RECEIVED ✅✅🌐   ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("💾 [MR Global WS] Dispatching completion flag to Redux");
            
            store.dispatch(setCompletionMessageReceived(true));
            
            console.log("🧹 [MR Global WS] Cleaning up WebSocket listeners");
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
            
            console.log("🔌 [MR Global WS] Disconnecting WebSocket");
            wsManager.disconnect();
            currentGenerationUrl = null;
            
            return;
          }

          // 📊 Progress update
          if (message.action === "realtimetext" && typeof message.body === "number") {
            const newProgress = message.body;
            console.log("📊 [MR Global WS] Progress update:", newProgress + "%");
            store.dispatch(setGeneratingProgress(newProgress));
            return;
          }

          // 📄 Content chunk
          if (message.type === "tier_completion" && message.data?.content?.content) {
            const newContent = message.data.content.content;
            console.log("📄 [MR Global WS] Content chunk received:", newContent.length, "chars");

            const currentState = store.getState();
            const currentContent = currentState.mr.generatingContent;

            if (currentContent === "Waiting for Document Generation...") {
              console.log("📝 [MR Global WS] First content chunk - replacing placeholder");
              store.dispatch(setGeneratingContent(newContent));
            } else {
              console.log("📝 [MR Global WS] Appending content chunk");
              store.dispatch(appendGeneratingContent(newContent));
            }
            return;
          }

          // ✅ Status completion
          if (message.status === "completed" || message.status === "complete") {
            console.log("✅ [MR Global WS] Status completion indicator received");
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
          console.error("❌ [MR Global WS] Message processing error:", err);
          console.error("❌ [MR Global WS] Problematic message:", message);
        }
      });

      // 🔥 Setup error listener
      unsubscribeError = wsManager.onError((err) => {
        console.error("╔════════════════════════════════════════════════════════════╗");
        console.error("║              ❌ MR WEBSOCKET ERROR                        ║");
        console.error("╚════════════════════════════════════════════════════════════╝");
        console.error("❌ [MR Global WS] WebSocket error:", err);
        console.error("❌ [MR Global WS] URL was:", wsUrl);
        console.error("❌ [MR Global WS] Timestamp:", new Date().toISOString());
      });

      // 🔥 Setup close listener
      unsubscribeClose = wsManager.onClose((event) => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║              🔗 MR WEBSOCKET CLOSED                       ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("🔗 [MR Global WS] WebSocket closed");
        console.log("   └─ Code:", event.code);
        console.log("   └─ Reason:", event.reason || 'No reason provided');
        console.log("   └─ Clean close:", event.wasClean);
        console.log("   └─ Timestamp:", new Date().toISOString());
        
        currentGenerationUrl = null;
      });

      console.log("✅ [MR Global WS] All listeners registered successfully");
      
    } else if (!isMRWebSocket && wsUrl) {
      console.log("⚠️ [MR Global WS] URL present but doesn't match MR pattern");
      console.log("   Provided URL:", wsUrl);
      console.log("   Expected to start with:", MR_WEBSOCKET_BASE_URL);
    }
  }

  // 🛑 Cleanup when generation stops
  if (setIsGenerating.match(action) && action.payload === false) {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║         🛑 MR GENERATION STOPPED - CLEANUP               ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("🌐 [MR Global WS] Generation stopped - cleaning up");
    
    if (unsubscribeMessage) {
      console.log("🧹 [MR Global WS] Unsubscribing all listeners");
      unsubscribeMessage();
      unsubscribeError?.();
      unsubscribeClose?.();
      unsubscribeMessage = null;
      unsubscribeError = null;
      unsubscribeClose = null;
    }
    
    console.log("🔌 [MR Global WS] Disconnecting WebSocket");
    wsManager.disconnect();
    currentGenerationUrl = null;
    
    console.log("✅ [MR Global WS] Cleanup complete");
  }

  return result;
};