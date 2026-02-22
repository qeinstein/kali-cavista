import BaseRequest from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";

// ─── Types matching API contracts ────────────────────────────────────────────

/**
 * POST /api/v1/chat/message
 * → payload: { message, conversationId }
 * → response: { reply, conversationId, actions: [] }
 */
export interface ChatMessagePayload {
  message: string;
  conversationId?: string;
}

export interface ChatMessageResponse {
  reply: string;
  conversationId: string;
  actions: string[];
}

/**
 * GET /api/v1/chat/history?limit=20
 * → response: { messages: [{role, content, timestamp}] }
 */
export interface ChatHistoryMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatHistoryMessage[];
}

/**
 * DELETE /api/v1/chat/history
 * → response: { success: true }
 */

// ─── POST: Send chat message ────────────────────────────────────────────────

/**
 * sendMessage(payload)
 * → POST /api/v1/chat/message
 * → Send a message to the AI assistant (powered by OpenRouter LLM)
 * → Returns { reply, conversationId, actions }
 */
export const sendMessage = async (
  payload: ChatMessagePayload,
): Promise<ChatMessageResponse> => {
  return await BaseRequest.post("/api/v1/chat/message", payload);
};

// ─── GET: Chat history ──────────────────────────────────────────────────────

/**
 * useChatHistory(limit)
 * → GET /api/v1/chat/history?limit=N
 * → Get recent chat messages
 * → Returns { messages: [{role, content, timestamp}] }
 */
export const useChatHistory = (limit = 20) => {
  return useRequest("/api/v1/chat/history", {
    params: { limit },
    initialValue: { messages: [] },
  });
};

/**
 * fetchChatHistory(limit)
 * → GET /api/v1/chat/history?limit=N (imperative version)
 */
export const fetchChatHistory = async (
  limit = 20,
): Promise<ChatHistoryResponse> => {
  return await BaseRequest.get(`/api/v1/chat/history?limit=${limit}`);
};

// ─── DELETE: Clear chat history ─────────────────────────────────────────────

/**
 * clearChatHistory()
 * → DELETE /api/v1/chat/history
 * → Clear all chat history for the user
 * → Returns { success: true }
 */
export const clearChatHistory = async (): Promise<{ success: boolean }> => {
  return await BaseRequest.delete("/api/v1/chat/history");
};
