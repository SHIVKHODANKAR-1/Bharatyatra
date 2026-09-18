import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types/index';
import { User, LoginCredentials, SignupData, OtpVerificationState } from '../types/auth';

const AUTH_STORAGE_KEY = 'bharat_yatra_auth_session';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  userRole: UserRole;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  continueAsGuest: () => void;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (target: string, type: 'phone' | 'email') => Promise<{ success: boolean; error?: string }>;
  otpState: OtpVerificationState | null;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchRoleForDemo: (role: UserRole) => void;
  authModalType: 'login' | 'signup' | 'otp' | 'forgot' | 'reset' | 'welcome' | null;
  openAuthModal: (type: 'login' | 'signup' | 'otp' | 'forgot' | 'reset' | 'welcome') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Guest user so the home screen is immediately interactive and welcoming
    return {
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      fullName: 'Namaste Guest',
      email: '',
      role: UserRole.TRAVELER,
      isGuest: true,
      preferences: {
        language: 'en',
        selectedCity: 'Nagpur',
        useCurrentLocation: false,
        interests: ['heritage', 'nature', 'food'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: false,
        onboardingStep: 1,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [otpState, setOtpState] = useState<OtpVerificationState | null>(null);
  const [authModalType, setAuthModalType] = useState<'login' | 'signup' | 'otp' | 'forgot' | 'reset' | 'welcome' | null>(null);

  useEffect(() => {
    try {
      if (currentUser && !currentUser.isGuest) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    // Input validation
    if (!credentials.identifier || credentials.identifier.trim().length < 3) {
      return { success: false, error: 'Please enter a valid email address or 10-digit mobile number.' };
    }

    if (credentials.password && credentials.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Realistic authentication flow with session generation
    const isEmail = credentials.identifier.includes('@');
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      fullName: isEmail ? credentials.identifier.split('@')[0] : 'Indian Traveler',
      email: isEmail ? credentials.identifier : 'traveler@bharatyatra.in',
      phone: !isEmail ? credentials.identifier : '+91 98765 43210',
      role: UserRole.TRAVELER,
      isGuest: false,
      preferences: currentUser?.preferences || {
        language: 'en',
        selectedCity: 'Nagpur',
        useCurrentLocation: false,
        interests: ['heritage', 'food', 'nature'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: true,
        onboardingStep: 10,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setAuthModalType(null);
    return { success: true };
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    if (!data.fullName || data.fullName.trim().length < 2) {
      return { success: false, error: 'Please enter your full legal name.' };
    }
    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!data.phone || data.phone.trim().length < 10) {
      return { success: false, error: 'Please enter a 10-digit mobile number.' };
    }
    if (!data.termsAccepted) {
      return { success: false, error: 'You must agree to the Terms of Service to continue.' };
    }

    // Trigger OTP verification step as per Section 18.5
    setOtpState({
      target: data.phone || data.email,
      type: data.phone ? 'phone' : 'email',
      timerSeconds: 45,
      attempts: 0,
      isVerified: false,
    });
    setAuthModalType('otp');
    return { success: true };
  };

  const sendOtp = async (target: string, type: 'phone' | 'email') => {
    setOtpState({
      target,
      type,
      timerSeconds: 45,
      attempts: 0,
      isVerified: false,
    });
    return { success: true };
  };

  const verifyOtp = async (code: string) => {
    if (!code || code.length !== 6) {
      return { success: false, error: 'Please enter all 6 digits of the OTP code.' };
    }
    // Simulation: Any 6 digits or '123456' succeeds in demo without logging secrets
    if (code === '000000') {
      return { success: false, error: 'Invalid or expired OTP code. Please try again.' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      fullName: 'Aarav Sharma',
      email: otpState?.type === 'email' ? otpState.target : 'aarav.sharma@example.com',
      phone: otpState?.type === 'phone' ? otpState.target : '+91 98201 12345',
      role: UserRole.TRAVELER,
      isGuest: false,
      preferences: currentUser?.preferences || {
        language: 'en',
        selectedCity: 'Nagpur',
        useCurrentLocation: false,
        interests: ['heritage', 'nature', 'spiritual'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: true,
        onboardingStep: 10,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setOtpState(null);
    setAuthModalType(null);
    return { success: true };
  };

  const requestPasswordReset = async (identifier: string) => {
    if (!identifier || identifier.trim().length < 3) {
      return { success: false, error: 'Please enter your registered email or phone.' };
    }
    setAuthModalType('reset');
    return { success: true };
  };

  const resetPassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters with letters & numbers.' };
    }
    setAuthModalType('login');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser({
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      fullName: 'Namaste Guest',
      email: '',
      role: UserRole.TRAVELER,
      isGuest: true,
      preferences: {
        language: 'en',
        selectedCity: 'Nagpur',
        useCurrentLocation: false,
        interests: ['heritage', 'nature', 'food'],
        budget: 'moderate',
        duration: 'weekend',
        party: 'solo',
        pace: 'balanced',
        accessibility: [],
        weatherAwareRecommendations: true,
        onboardingCompleted: false,
        onboardingStep: 1,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const continueAsGuest = () => {
    setAuthModalType(null);
  };

  const switchRoleForDemo = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role,
        isGuest: false,
      });
    }
  };

  const openAuthModal = (type: 'login' | 'signup' | 'otp' | 'forgot' | 'reset' | 'welcome') => {
    setAuthModalType(type);
  };

  const closeAuthModal = () => {
    setAuthModalType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser && !currentUser.isGuest,
        isGuest: !currentUser || currentUser.isGuest,
        userRole: currentUser?.role || UserRole.TRAVELER,
        login,
        signup,
        logout,
        continueAsGuest,
        verifyOtp,
        sendOtp,
        otpState,
        requestPasswordReset,
        resetPassword,
        switchRoleForDemo,
        authModalType,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
