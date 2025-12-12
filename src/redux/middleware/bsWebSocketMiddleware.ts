// redux/middleware/bsWebSocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { wsManager } from '../services/websocketManager';
import {
  setIsGenerating,
  setWsUrl,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setCompletionMessageReceived,
} from '../services/bs/bsSlice';

let unsubscribeMessage: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeClose: (() => void) | null = null;
let currentGenerationUrl: string | null = null;

// 🔥 Get WebSocket base URL from environment variable (same as all others)
const WEBSOCKET_BASE_URL = process.env.NEXT_PUBLIC_REALTIME_WEBSOCKET_URL || '';

export const bsWebSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // 🔥 Listen for BOTH wsUrl changes AND isGenerating changes
  if (setWsUrl.match(action) || setIsGenerating.match(action)) {
    const state = store.getState();
    const { wsUrl, isGenerating } = state.bs;

    // 🔥 Dynamic check: URL must start with configured base URL
    const isBSWebSocket = wsUrl && (
      wsUrl.startsWith(WEBSOCKET_BASE_URL) ||
      wsUrl.includes('execute-api.us-east-1.amazonaws.com') // Generic AWS check
    );

    console.log("🔍 [BS WS Middleware] Action triggered:", action.type);
    console.log("🔍 [BS WS Middleware] Current wsUrl:", wsUrl || 'null');
    console.log("🔍 [BS WS Middleware] isGenerating:", isGenerating);
    console.log("🔍 [BS WS Middleware] isBSWebSocket:", isBSWebSocket);
    console.log("🔍 [BS WS Middleware] Expected base URL:", WEBSOCKET_BASE_URL);

    if (isBSWebSocket && isGenerating) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║    🌐 BS Global WebSocket Middleware Activated            ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("🔗 [BS Global WS] URL:", wsUrl);
      console.log("🔗 [BS Global WS] isGenerating:", isGenerating);

      // Cleanup previous listeners if URL changed
      if (currentGenerationUrl && currentGenerationUrl !== wsUrl) {
        console.log("🔄 [BS Global WS] URL changed, disconnecting old connection");
        console.log("   Old URL:", currentGenerationUrl);
        console.log("   New URL:", wsUrl);
        
        wsManager.disconnect();
        
        if (unsubscribeMessage) {
          console.log("🧹 [BS Global WS] Unsubscribing old listeners");
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
        console.log("⏭️ [BS Global WS] Already connected to this URL, skipping");
        return result;
      }

      currentGenerationUrl = wsUrl;

      // 🔥 Connect immediately
      console.log("🔌 [BS Global WS] Initiating WebSocket connection...");
      console.log("⏱️ [BS Global WS] Connection attempt at:", new Date().toISOString());
      
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

          console.log("📨 [BS Global WS] Message received:", {
            action: message.action,
            type: message.type,
            body: messagePreview,
            status: message.status,
            timestamp: new Date().toISOString()
          });

          // ============ CRITICAL: COMPLETION MESSAGE ============
          if (
            message.action === "realtimetext" &&
            message.body === "Document generated successfully!"
          ) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║   🌐✅✅ BS GLOBAL COMPLETION MESSAGE RECEIVED ✅✅🌐    ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("💾 [BS Global WS] Dispatching completion flag to Redux");
            
            store.dispatch(setCompletionMessageReceived(true));
            
            console.log("🧹 [BS Global WS] Cleaning up WebSocket listeners");
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
            
            console.log("🔌 [BS Global WS] Disconnecting WebSocket");
            wsManager.disconnect();
            currentGenerationUrl = null;
            
            return;
          }

          // 📊 Progress updates
          if (message.action === "realtimetext" && typeof message.body === "number") {
            const newProgress = message.body;
            console.log("📊 [BS Global WS] Progress update:", newProgress + "%");
            console.log("💾 [BS Global WS] Saving progress to Redux (will persist)");
            store.dispatch(setGeneratingProgress(newProgress));
            return;
          }

          // 📄 Content updates
          if (message.type === "tier_completion" && message.data?.content?.content) {
            const newContent = message.data.content.content;
            console.log("📄 [BS Global WS] Content chunk received:", newContent.length, "chars");
            console.log("💾 [BS Global WS] Saving content to Redux (will persist)");

            const currentState = store.getState();
            const currentContent = currentState.bs.generatingContent;

            if (currentContent === "Waiting for Document Generation...") {
              console.log("📝 [BS Global WS] First content chunk - replacing placeholder");
              store.dispatch(setGeneratingContent(newContent));
            } else {
              console.log("📝 [BS Global WS] Appending content chunk");
              store.dispatch(appendGeneratingContent(newContent));
            }
            return;
          }

          // ✅ Backup: Other completion indicators
          if (message.status === "completed" || message.status === "complete") {
            console.log("✅ [BS Global WS] Status completion indicator received");
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
          console.error("❌ [BS Global WS] Message processing error:", err);
          console.error("❌ [BS Global WS] Problematic message:", message);
        }
      });

      // 🔥 Setup error listener
      unsubscribeError = wsManager.onError((err) => {
        console.error("╔════════════════════════════════════════════════════════════╗");
        console.error("║              ❌ BS WEBSOCKET ERROR                         ║");
        console.error("╚════════════════════════════════════════════════════════════╝");
        console.error("❌ [BS Global WS] WebSocket error:", err);
        console.error("❌ [BS Global WS] URL was:", wsUrl);
        console.error("❌ [BS Global WS] Timestamp:", new Date().toISOString());
      });

      // 🔥 Setup close listener
      unsubscribeClose = wsManager.onClose((event) => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║              🔗 BS WEBSOCKET CLOSED                        ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("🔗 [BS Global WS] WebSocket closed");
        console.log("   └─ Code:", event.code);
        console.log("   └─ Reason:", event.reason || 'No reason provided');
        console.log("   └─ Clean close:", event.wasClean);
        console.log("   └─ Timestamp:", new Date().toISOString());
        
        currentGenerationUrl = null;
      });

      console.log("✅ [BS Global WS] All listeners registered successfully");
      
    } else if (!isBSWebSocket && wsUrl) {
      console.log("⚠️ [BS Global WS] URL present but doesn't match expected pattern");
      console.log("   Provided URL:", wsUrl);
      console.log("   Expected to start with:", WEBSOCKET_BASE_URL);
    }
  }

  // 🛑 Cleanup when generation stops
  if (setIsGenerating.match(action) && action.payload === false) {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║         🛑 BS GENERATION STOPPED - CLEANUP                ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("🌐 [BS Global WS] Generation stopped - cleaning up");
    
    if (unsubscribeMessage) {
      console.log("🧹 [BS Global WS] Unsubscribing all listeners");
      unsubscribeMessage();
      unsubscribeError?.();
      unsubscribeClose?.();
      unsubscribeMessage = null;
      unsubscribeError = null;
      unsubscribeClose = null;
    }
    
    console.log("🔌 [BS Global WS] Disconnecting WebSocket");
    wsManager.disconnect();
    currentGenerationUrl = null;
    
    console.log("✅ [BS Global WS] Cleanup complete");
  }

  return result;
};