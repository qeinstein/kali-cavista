/**
 * Conversation state management for voice navigation
 * Handles conversation history, context, and interruptibility
 */

export interface ConversationTurn {
  user: string;
  assistant: string;
  timestamp: number;
  route?: string;
  pageContext?: any;
}

export interface ConversationState {
  history: ConversationTurn[];
  currentContext: any;
  isInterruptible: boolean;
  isPlaying: boolean;
  lastInteraction: number;
}

class ConversationStateManager {
  private state: ConversationState = {
    history: [],
    currentContext: {},
    isInterruptible: false,
    isPlaying: false,
    lastInteraction: Date.now()
  };

  private maxHistoryLength = 20; // Keep last 20 turns
  private inactivityTimeout = 300000; // 5 minutes

  constructor() {
    // Load from localStorage if available
    this.loadFromStorage();
  }

  // Add a new turn to the conversation
  addUserTurn(userInput: string, assistantResponse: string, route?: string, pageContext?: any): void {
    const turn: ConversationTurn = {
      user: userInput,
      assistant: assistantResponse,
      timestamp: Date.now(),
      route,
      pageContext
    };

    this.state.history.push(turn);
    
    // Keep history manageable
    if (this.state.history.length > this.maxHistoryLength) {
      this.state.history = this.state.history.slice(-this.maxHistoryLength);
    }

    this.state.lastInteraction = Date.now();
    this.saveToStorage();
  }

  // Get recent conversation history
  getRecentHistory(limit: number = 5): ConversationTurn[] {
    return this.state.history.slice(-limit);
  }

  // Get full conversation history
  getFullHistory(): ConversationTurn[] {
    return [...this.state.history];
  }

  // Clear conversation history
  clearHistory(): void {
    this.state.history = [];
    this.saveToStorage();
  }

  // Update current context
  updateContext(context: any): void {
    this.state.currentContext = { ...this.state.currentContext, ...context };
    this.state.lastInteraction = Date.now();
    this.saveToStorage();
  }

  // Get current context
  getContext(): any {
    return this.state.currentContext;
  }

  // Set interruptible state
  setInterruptible(isInterruptible: boolean): void {
    this.state.isInterruptible = isInterruptible;
    this.state.lastInteraction = Date.now();
  }

  // Get interruptible state
  isInterruptible(): boolean {
    return this.state.isInterruptible;
  }

  // Set playing state
  setPlaying(isPlaying: boolean): void {
    this.state.isPlaying = isPlaying;
    this.state.lastInteraction = Date.now();
  }

  // Get playing state
  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  // Check if conversation is active (recent interaction)
  isConversationActive(): boolean {
    const timeSinceLastInteraction = Date.now() - this.state.lastInteraction;
    return timeSinceLastInteraction < this.inactivityTimeout;
  }

  // Reset conversation state
  reset(): void {
    this.state = {
      history: [],
      currentContext: {},
      isInterruptible: false,
      isPlaying: false,
      lastInteraction: Date.now()
    };
    this.saveToStorage();
  }

  // Save state to localStorage
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('voiceConversationState', JSON.stringify(this.state));
      } catch (e) {
        console.warn('Could not save conversation state to localStorage:', e);
      }
    }
  }

  // Load state from localStorage
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceConversationState');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only load if not too old (within 24 hours)
          if (Date.now() - parsed.lastInteraction < 24 * 60 * 60 * 1000) {
            this.state = { ...this.state, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Could not load conversation state from localStorage:', e);
      }
    }
  }

  // Export conversation for debugging or analytics
  exportConversation(): string {
    return JSON.stringify(this.state.history, null, 2);
  }

  // Get conversation summary
  getSummary(): string {
    const recent = this.getRecentHistory(3);
    if (recent.length === 0) {
      return "No conversation history";
    }
    
    const lastTurn = recent[recent.length - 1];
    return `Last interaction: "${lastTurn.user}" -> "${lastTurn.assistant.substring(0, 50)}..."`;
  }
}

// Export singleton instance
export const conversationManager = new ConversationStateManager();