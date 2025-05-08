import { useCurrentUser, useLoginMutation, useLogoutMutation, useSignupMutation, useResendVerificationMutation } from '@bbook/data';
import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ReturnType<typeof useLoginMutation>;
  signup: ReturnType<typeof useSignupMutation>;
  logout: ReturnType<typeof useLogoutMutation>;
  resendVerification: ReturnType<typeof useResendVerificationMutation>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const logoutMutation = useLogoutMutation();
  const resendVerificationMutation = useResendVerificationMutation();
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation,
    signup: signupMutation,
    logout: logoutMutation,
    resendVerification: resendVerificationMutation,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
