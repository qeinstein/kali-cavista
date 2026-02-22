/**
 * Tests for conversation state management
 */

import { conversationManager } from '../conversationState';

describe('ConversationStateManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    conversationManager.reset();
  });

  test('should add user turn to history', () => {
    conversationManager.addUserTurn(
      'Show me my health data',
      'Here is your health data overview...',
      '/dashboard',
      { page_name: 'Dashboard' }
    );

    const history = conversationManager.getFullHistory();
    expect(history).toHaveLength(1);
    expect(history[0].user).toBe('Show me my health data');
    expect(history[0].assistant).toBe('Here is your health data overview...');
    expect(history[0].route).toBe('/dashboard');
  });

  test('should limit history length', () => {
    // Add more than maxHistoryLength (20) turns
    for (let i = 0; i < 25; i++) {
      conversationManager.addUserTurn(
        `User command ${i}`,
        `Assistant response ${i}`,
        '/test',
        {}
      );
    }

    const history = conversationManager.getFullHistory();
    expect(history).toHaveLength(20); // Should keep only last 20
    expect(history[0].user).toBe('User command 5'); // First should be the 6th (0-indexed)
  });

  test('should manage interruptible state', () => {
    expect(conversationManager.isInterruptible()).toBe(false);
    
    conversationManager.setInterruptible(true);
    expect(conversationManager.isInterruptible()).toBe(true);
    
    conversationManager.setInterruptible(false);
    expect(conversationManager.isInterruptible()).toBe(false);
  });

  test('should manage playing state', () => {
    expect(conversationManager.isPlaying()).toBe(false);
    
    conversationManager.setPlaying(true);
    expect(conversationManager.isPlaying()).toBe(true);
    
    conversationManager.setPlaying(false);
    expect(conversationManager.isPlaying()).toBe(false);
  });

  test('should detect active conversation', () => {
    // Initially not active
    expect(conversationManager.isConversationActive()).toBe(false);
    
    // Add a turn (should make it active)
    conversationManager.addUserTurn('Test', 'Response');
    expect(conversationManager.isConversationActive()).toBe(true);
  });

  test('should update context', () => {
    const context = { page_name: 'Dashboard', path: '/dashboard' };
    conversationManager.updateContext(context);
    
    const storedContext = conversationManager.getContext();
    expect(storedContext.page_name).toBe('Dashboard');
    expect(storedContext.path).toBe('/dashboard');
  });

  test('should get recent history', () => {
    for (let i = 0; i < 10; i++) {
      conversationManager.addUserTurn(`Command ${i}`, `Response ${i}`);
    }
    
    const recent = conversationManager.getRecentHistory(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].user).toBe('Command 7');
    expect(recent[2].user).toBe('Command 9');
  });

  test('should clear history', () => {
    conversationManager.addUserTurn('Test', 'Response');
    expect(conversationManager.getFullHistory()).toHaveLength(1);
    
    conversationManager.clearHistory();
    expect(conversationManager.getFullHistory()).toHaveLength(0);
  });

  test('should export conversation', () => {
    conversationManager.addUserTurn('Test', 'Response');
    const exported = conversationManager.exportConversation();
    
    expect(typeof exported).toBe('string');
    expect(exported).toContain('Test');
    expect(exported).toContain('Response');
  });

  test('should get summary', () => {
    // No history
    expect(conversationManager.getSummary()).toBe('No conversation history');
    
    // With history
    conversationManager.addUserTurn('Test command', 'Test response');
    const summary = conversationManager.getSummary();
    expect(summary).toContain('Last interaction');
    expect(summary).toContain('Test command');
  });

  test('should persist to localStorage', () => {
    // Add some data
    conversationManager.addUserTurn('Test', 'Response');
    conversationManager.setInterruptible(true);
    
    // Create new instance (simulating page reload)
    const newInstance = new (conversationManager.constructor as any)();
    
    // Should load from localStorage
    expect(newInstance.getFullHistory()).toHaveLength(1);
    expect(newInstance.isInterruptible()).toBe(true);
  });
});