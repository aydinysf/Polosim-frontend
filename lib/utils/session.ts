// Session management utilities for guest checkout

export const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

export const clearSessionId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart_session_id');
  }
};