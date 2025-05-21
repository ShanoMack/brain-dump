
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null } | undefined>;
  signUp: (email: string, password: string, username: string) => Promise<{ user: User | null; session: Session | null } | undefined>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Setup auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Debug logging
          if (event === "SIGNED_IN") {
            console.log("User signed in successfully");
          } else if (event === "SIGNED_OUT") {
            console.log("User signed out");
          } else if (event === "TOKEN_REFRESHED") {
            console.log("Token refreshed successfully");
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          console.log("User signed out");
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Retrieved session:", currentSession?.user?.email || "No session");
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        throw error;
      }
      
      console.log("Sign in successful:", data.user?.email);
      setSession(data.session);
      setUser(data.user);
      return data;
    } catch (error: any) {
      console.error("Sign in exception:", error.message);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log("Attempting to sign up:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) {
        console.error("Sign up error:", error.message);
        throw error;
      }
      
      console.log("Sign up successful");
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      
      setSession(data.session);
      setUser(data.user);
      return data;
    } catch (error: any) {
      console.error("Sign up exception:", error.message);
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        throw error;
      }
      console.log("Sign out successful");
      setSession(null);
      setUser(null);
    } catch (error: any) {
      console.error("Sign out exception:", error.message);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
