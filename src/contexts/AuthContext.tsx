import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, User as DbUser } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: 'admin' | 'employee') => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            full_name: userData.full_name
          });
        }
      }

      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.role,
              full_name: userData.full_name
            });
          }
        } else {
          setUser(null);
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError || !userData) {
        throw new Error('Invalid email or password');
      }

      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: userData.id
      });

      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: userData.id
        });

        if (signUpError) throw signUpError;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName: string, role: 'admin' | 'employee') => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('User already exists');
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            full_name: fullName,
            role
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.auth.signUp({
        email: email,
        password: newUser.id
      });

      setUser({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};