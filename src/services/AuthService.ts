import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  User, 
  Session,
  AuthResponse,
  AuthTokenResponse,
  AuthError
} from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export class AuthService {
  private static instance: AuthService;
  private supabase;
  private authAttempts: Map<string, { timestamp: number; count: number }> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly WINDOW_MS = 60000; // 1 minute window

  private constructor() {
    this.supabase = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.authAttempts.get(identifier);

    if (!attempt) {
      this.authAttempts.set(identifier, { timestamp: now, count: 1 });
      return true;
    }

    if (now - attempt.timestamp > this.WINDOW_MS) {
      // Reset if window has passed
      this.authAttempts.set(identifier, { timestamp: now, count: 1 });
      return true;
    }

    if (attempt.count >= this.MAX_ATTEMPTS) {
      const timeLeft = Math.ceil((this.WINDOW_MS - (now - attempt.timestamp)) / 1000);
      throw new Error(`Too many login attempts. Please try again in ${timeLeft} seconds.`);
    }

    // Increment attempt count
    this.authAttempts.set(identifier, {
      timestamp: attempt.timestamp,
      count: attempt.count + 1
    });
    return true;
  }

  async signInWithEmail(email: string, password: string): Promise<AuthTokenResponse> {
    try {
      this.checkRateLimit(email.toLowerCase());

      const response = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        throw response.error;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('too many requests')) {
        throw new Error('Login rate limit reached. Please try again in a minute.');
      }
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      this.checkRateLimit(email.toLowerCase());

      const response = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (response.error) {
        throw response.error;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('too many requests')) {
        throw new Error('Sign up rate limit reached. Please try again in a minute.');
      }
      throw error;
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    try {
      this.checkRateLimit(email.toLowerCase());

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('too many requests')) {
        throw new Error('Reset password rate limit reached. Please try again in a minute.');
      }
      throw error;
    }
  }

  async getSession(): Promise<AuthTokenResponse> {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
