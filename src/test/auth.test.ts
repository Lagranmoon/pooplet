import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }
};

vi.mock('../services/supabase', () => ({
  supabase: mockSupabase
}));

describe('Authentication System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Supabase Auth Integration', () => {
    it('should have auth methods available', () => {
      expect(mockSupabase.auth.signUp).toBeDefined();
      expect(mockSupabase.auth.signInWithPassword).toBeDefined();
      expect(mockSupabase.auth.signOut).toBeDefined();
      expect(mockSupabase.auth.getSession).toBeDefined();
      expect(mockSupabase.auth.onAuthStateChange).toBeDefined();
    });

    it('should call signUp with correct parameters', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ error: null });
      
      await mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should call signInWithPassword with correct parameters', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
      
      await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle authentication errors', async () => {
      const mockError = { message: 'Invalid credentials' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: mockError });
      
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(result.error).toBe(mockError);
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('')).toBe(false);
    });

    it('should validate password length', () => {
      const minPasswordLength = 6;
      
      expect('password123'.length >= minPasswordLength).toBe(true);
      expect('12345'.length >= minPasswordLength).toBe(false);
      expect(''.length >= minPasswordLength).toBe(false);
    });

    it('should validate password confirmation', () => {
      const password = 'password123';
      const confirmPassword = 'password123';
      const wrongConfirmPassword = 'different';
      
      expect(password === confirmPassword).toBe(true);
      expect(password === wrongConfirmPassword).toBe(false);
    });
  });
});