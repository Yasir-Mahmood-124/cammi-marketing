// redux/middleware/smpWebSocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { wsManager } from '../services/websocketManager';
import {
  setIsGenerating,
  setWsUrl,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setCompletionMessageReceived,
} from '../services/smp/smpSlice';

let unsubscribeMessage: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeClose: (() => void) | null = null;
let currentGenerationUrl: string | null = null;

// 🔥 Get WebSocket base URL from environment variable
const SMP_WEBSOCKET_BASE_URL = process.env.NEXT_PUBLIC_REALTIME_WEBSOCKET_URL || '';

export const smpWebSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // 🔥 Listen for BOTH wsUrl changes AND isGenerating changes
  if (setWsUrl.match(action) || setIsGenerating.match(action)) {
    const state = store.getState();
    const { wsUrl, isGenerating } = state.smp;

    // 🔥 Dynamic check: URL must start with configured base URL
    const isSMPWebSocket = wsUrl && (
      wsUrl.startsWith(SMP_WEBSOCKET_BASE_URL) ||
      wsUrl.includes('execute-api.us-east-1.amazonaws.com') // Fallback check
    );

    console.log("🔍 [SMP WS Middleware] Action triggered:", action.type);
    console.log("🔍 [SMP WS Middleware] Current wsUrl:", wsUrl || 'null');
    console.log("🔍 [SMP WS Middleware] isGenerating:", isGenerating);
    console.log("🔍 [SMP WS Middleware] isSMPWebSocket:", isSMPWebSocket);
    console.log("🔍 [SMP WS Middleware] Expected base URL:", SMP_WEBSOCKET_BASE_URL);

    if (isSMPWebSocket && isGenerating) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║    🌐 SMP Global WebSocket Middleware Activated           ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("🔗 [SMP Global WS] URL:", wsUrl);
      console.log("🔗 [SMP Global WS] isGenerating:", isGenerating);

      // Cleanup previous listeners if URL changed
      if (currentGenerationUrl && currentGenerationUrl !== wsUrl) {
        console.log("🔄 [SMP Global WS] URL changed, disconnecting old connection");
        console.log("   Old URL:", currentGenerationUrl);
        console.log("   New URL:", wsUrl);
        
        wsManager.disconnect();
        
        if (unsubscribeMessage) {
          console.log("🧹 [SMP Global WS] Unsubscribing old listeners");
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
        console.log("⏭️ [SMP Global WS] Already connected to this URL, skipping");
        return result;
      }

      currentGenerationUrl = wsUrl;

      // 🔥 Connect immediately
      console.log("🔌 [SMP Global WS] Initiating WebSocket connection...");
      console.log("⏱️ [SMP Global WS] Connection attempt at:", new Date().toISOString());
      
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

          console.log("📨 [SMP Global WS] Message received:", {
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
            console.log("║   🌐✅✅ SMP GLOBAL COMPLETION MESSAGE RECEIVED ✅✅🌐   ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("💾 [SMP Global WS] Dispatching completion flag to Redux");
            
            store.dispatch(setCompletionMessageReceived(true));
            
            console.log("🧹 [SMP Global WS] Cleaning up WebSocket listeners");
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
            
            console.log("🔌 [SMP Global WS] Disconnecting WebSocket");
            wsManager.disconnect();
            currentGenerationUrl = null;
            
            return;
          }

          // 📊 Progress update
          if (message.action === "realtimetext" && typeof message.body === "number") {
            const newProgress = message.body;
            console.log("📊 [SMP Global WS] Progress update:", newProgress + "%");
            store.dispatch(setGeneratingProgress(newProgress));
            return;
          }

          // 📄 Content chunk
          if (message.type === "tier_completion" && message.data?.content?.content) {
            const newContent = message.data.content.content;
            console.log("📄 [SMP Global WS] Content chunk received:", newContent.length, "chars");

            const currentState = store.getState();
            const currentContent = currentState.smp.generatingContent;

            if (currentContent === "Waiting for Document Generation...") {
              console.log("📝 [SMP Global WS] First content chunk - replacing placeholder");
              store.dispatch(setGeneratingContent(newContent));
            } else {
              console.log("📝 [SMP Global WS] Appending content chunk");
              store.dispatch(appendGeneratingContent(newContent));
            }
            return;
          }

          // ✅ Status completion
          if (message.status === "completed" || message.status === "complete") {
            console.log("✅ [SMP Global WS] Status completion indicator received");
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
          console.error("❌ [SMP Global WS] Message processing error:", err);
          console.error("❌ [SMP Global WS] Problematic message:", message);
        }
      });

      // 🔥 Setup error listener
      unsubscribeError = wsManager.onError((err) => {
        console.error("╔════════════════════════════════════════════════════════════╗");
        console.error("║              ❌ SMP WEBSOCKET ERROR                        ║");
        console.error("╚════════════════════════════════════════════════════════════╝");
        console.error("❌ [SMP Global WS] WebSocket error:", err);
        console.error("❌ [SMP Global WS] URL was:", wsUrl);
        console.error("❌ [SMP Global WS] Timestamp:", new Date().toISOString());
      });

      // 🔥 Setup close listener
      unsubscribeClose = wsManager.onClose((event) => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║              🔗 SMP WEBSOCKET CLOSED                       ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("🔗 [SMP Global WS] WebSocket closed");
        console.log("   └─ Code:", event.code);
        console.log("   └─ Reason:", event.reason || 'No reason provided');
        console.log("   └─ Clean close:", event.wasClean);
        console.log("   └─ Timestamp:", new Date().toISOString());
        
        currentGenerationUrl = null;
      });

      console.log("✅ [SMP Global WS] All listeners registered successfully");
      
    } else if (!isSMPWebSocket && wsUrl) {
      console.log("⚠️ [SMP Global WS] URL present but doesn't match SMP pattern");
      console.log("   Provided URL:", wsUrl);
      console.log("   Expected to start with:", SMP_WEBSOCKET_BASE_URL);
    }
  }

  // 🛑 Cleanup when generation stops
  if (setIsGenerating.match(action) && action.payload === false) {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║         🛑 SMP GENERATION STOPPED - CLEANUP               ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("🌐 [SMP Global WS] Generation stopped - cleaning up");
    
    if (unsubscribeMessage) {
      console.log("🧹 [SMP Global WS] Unsubscribing all listeners");
      unsubscribeMessage();
      unsubscribeError?.();
      unsubscribeClose?.();
      unsubscribeMessage = null;
      unsubscribeError = null;
      unsubscribeClose = null;
    }
    
    console.log("🔌 [SMP Global WS] Disconnecting WebSocket");
    wsManager.disconnect();
    currentGenerationUrl = null;
    
    console.log("✅ [SMP Global WS] Cleanup complete");
  }

  return result;
};