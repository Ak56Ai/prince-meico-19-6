import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: string | null;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  // Admin user configuration (fallback method)
  const ADMIN_USER_ID = 'c4506c4a-ed56-43a2-8a74-da42c0131b7c';
  const ADMIN_EMAIL = 'govindsingh747@gmail.com';

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update state for all auth events
        setSession(session);
        setUser(session?.user ?? null);
        checkAdminStatus(session?.user);
        setLoading(false);

        // Handle profile creation/update only for specific events
        if (event === 'SIGNED_UP' && session?.user) {
          console.log('Creating user profile for new signup:', session.user.id);
          await createUserProfile(session.user);
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('Ensuring user profile exists for sign in:', session.user.id);
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      return;
    }

    try {
      // First check if admin_roles table exists and query it
      const { data: adminData, error } = await supabase
        .from('admin_roles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!error && adminData) {
        // User found in admin_roles table
        console.log('Admin status from database:', adminData);
        setIsAdmin(true);
        setAdminRole(adminData.role);
        return;
      }
    } catch (error) {
      console.log('Admin roles table not available, using fallback method');
    }

    // Fallback to hardcoded admin check
    const isUserAdmin = user.id === ADMIN_USER_ID || user.email === ADMIN_EMAIL;
    console.log('Checking admin status (fallback):', {
      userId: user.id,
      userEmail: user.email,
      isAdmin: isUserAdmin,
      adminId: ADMIN_USER_ID,
      adminEmail: ADMIN_EMAIL
    });
    setIsAdmin(isUserAdmin);
    setAdminRole(isUserAdmin ? 'super_admin' : null);
  };

  const createUserProfile = async (user: User) => {
    try {
      console.log('Creating user profile for:', user.id, user.email);
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        return;
      }

      if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
        return;
      }

      // Create new profile with enhanced data
      const profileData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 
              (user.user_metadata?.firstName && user.user_metadata?.lastName 
                ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}` 
                : null),
        location: user.user_metadata?.country || null,
        plan_type: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting profile data:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        // Don't throw error to prevent auth flow interruption
        return;
      }

      console.log('User profile created successfully:', data);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Don't throw error to prevent auth flow interruption
    }
  };

  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Ensuring user profile exists for:', user.id);
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile:', checkError);
        return;
      }

      if (!existingProfile) {
        console.log('Profile does not exist, creating one...');
        await createUserProfile(user);
      } else {
        console.log('Profile exists:', existingProfile.id);
        
        // Update profile with any missing data from user metadata
        const updates: any = {};
        let needsUpdate = false;

        if (!existingProfile.name && user.user_metadata?.name) {
          updates.name = user.user_metadata.name;
          needsUpdate = true;
        }

        if (!existingProfile.location && user.user_metadata?.country) {
          updates.location = user.user_metadata.country;
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log('Updating profile with missing data:', updates);
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          } else {
            console.log('Profile updated successfully');
          }
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      // Don't throw error to prevent auth flow interruption
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('Signing up user:', email, 'with data:', userData);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { data, error };
      }

      console.log('Signup successful:', data.user?.id);
      return { data, error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        return { data, error };
      }

      console.log('Signin successful:', data.user?.id);
      return { data, error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Manually signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Manual signout successful');
      setIsAdmin(false);
      setAdminRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Resetting password for:', email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      console.log('Password reset result:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in');

    try {
      console.log('Updating profile for user:', user.id, 'with updates:', updates);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      return { data, error };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    adminRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};