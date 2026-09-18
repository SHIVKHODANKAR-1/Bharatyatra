import {
  AssistantChatMessage,
  ConversationalMemoryContext,
} from '../types/recommendation';
import { UserPreferences } from '../types/auth';
import { RetrievalService } from './retrievalService';
import { DataClassification } from '../types/index';

const STORAGE_KEY_CHAT = 'bharat_yatra_chat_history_v1';
const STORAGE_KEY_MEMORY = 'bharat_yatra_chat_memory_v1';

export class AssistantService {
  private static messages: AssistantChatMessage[] = [];
  private static memoryContext: ConversationalMemoryContext = {};

  /**
   * Initialize assistant messages from storage or default welcome message
   */
  public static init(preferences: UserPreferences): AssistantChatMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHAT);
      if (stored) {
        AssistantService.messages = JSON.parse(stored);
      }
      const mem = localStorage.getItem(STORAGE_KEY_MEMORY);
      if (mem) {
        AssistantService.memoryContext = JSON.parse(mem);
      }
    } catch {
      // ignore
    }

    if (AssistantService.messages.length === 0) {
      AssistantService.messages = [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: `Namaste! I am your AI Travel Assistant for Bharat Yatra, grounded in verified government, ASI, and state tourism archives. I can help craft personalized itineraries, outline authentic regional food trails, calculate realistic budgets, and verify seasonal timings. How may I help plan your voyage today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification: DataClassification.VERIFIED,
          sources: [
            {
              sourceName: 'Archaeological Survey of India (ASI)',
              lastUpdated: '2026-08-01',
              confidenceScore: 98,
            },
            {
              sourceName: 'Ministry of Tourism (Incredible India)',
              lastUpdated: '2026-08-15',
              confidenceScore: 99,
            },
          ],
          citations: ['ASI Official Registry', 'Incredible India Guidelines'],
        },
      ];
      AssistantService.persist();
    }

    return AssistantService.messages;
  }

  public static getMessages(): AssistantChatMessage[] {
    return AssistantService.messages;
  }

  public static getMemory(): ConversationalMemoryContext {
    return AssistantService.memoryContext;
  }

  /**
   * Process a user message through server-side AI API or client-side grounded RAG fallback
   */
  public static async sendMessage(
    query: string,
    preferences: UserPreferences
  ): Promise<AssistantChatMessage> {
    const userMsg: AssistantChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    AssistantService.messages.push(userMsg);

    // Try server-side endpoint first (which calls Gemini or grounded server RAG)
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          preferences,
          memoryContext: AssistantService.memoryContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: AssistantChatMessage = {
          id: data.id || `ast_${Date.now()}`,
          sender: 'assistant',
          text: data.reply || data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent,
          entities: data.entities,
          sources: data.sources || [],
          citations: data.citations || [],
          cardPayloads: data.cardPayloads || [],
          clarifyingQuestion: data.clarifyingQuestion,
          warningNote: data.warningNote,
          classification: DataClassification.AI_GENERATED,
        };

        AssistantService.messages.push(assistantMsg);
        AssistantService.persist();
        return assistantMsg;
      }
    } catch {
      // Offline or server unavailable fallback
    }

    // Client-side deterministic RAG fallback
    const ragResult = RetrievalService.executeRAG(query, preferences);

    const fallbackMsg: AssistantChatMessage = {
      id: `ast_${Date.now()}`,
      sender: 'assistant',
      text: ragResult.responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: ragResult.intent,
      entities: ragResult.entities,
      sources: ragResult.sources,
      citations: ragResult.citations,
      cardPayloads: ragResult.cardPayloads,
      clarifyingQuestion: ragResult.clarifyingQuestion,
      warningNote: ragResult.warningNote,
      classification: DataClassification.AI_GENERATED,
      isFallback: true,
    };

    AssistantService.messages.push(fallbackMsg);
    AssistantService.persist();
    return fallbackMsg;
  }

  /**
   * Handle clarifying question answer
   */
  public static async handleClarification(
    option: string,
    contextKey: string,
    preferences: UserPreferences
  ): Promise<AssistantChatMessage> {
    AssistantService.memoryContext[contextKey as keyof ConversationalMemoryContext] = option as any;
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(AssistantService.memoryContext));
    } catch {
      // ignore
    }

    return AssistantService.sendMessage(
      `I prefer: ${option}. Please tailor recommendations with this in mind.`,
      preferences
    );
  }

  /**
   * Clear chat history
   */
  public static clearHistory(preferences: UserPreferences): void {
    AssistantService.messages = [];
    AssistantService.memoryContext = {};
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
      localStorage.removeItem(STORAGE_KEY_MEMORY);
    } catch {
      // ignore
    }
    AssistantService.init(preferences);
  }

  /**
   * Record message feedback
   */
  public static setMessageFeedback(messageId: string, feedback: 'positive' | 'negative'): void {
    const msg = AssistantService.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.feedback = feedback;
      AssistantService.persist();
    }
  }

  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(AssistantService.messages));
    } catch {
      // ignore
    }
  }
}
