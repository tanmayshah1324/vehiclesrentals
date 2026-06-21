import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            }
            catch (err) {
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);

        // Listen for Supabase auth state changes (handles OAuth redirects)
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    // Check if we already have this user in state (avoid duplicate processing)
                    const existingUser = localStorage.getItem('user');
                    if (existingUser) {
                        const parsed = JSON.parse(existingUser);
                        if (parsed.email === session.user.email) return;
                    }

                    // Fetch or create profile for OAuth user
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    let userData;
                    if (profile) {
                        userData = { id: profile.id, name: profile.name, email: profile.email, role: profile.email === 'shahtanmay132@gmail.com' ? 'admin' : profile.role };
                    } else {
                        // Create profile for new OAuth user
                        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
                        const defaultRole = session.user.email === 'shahtanmay132@gmail.com' ? 'admin' : 'user';
                        const { data: newProfile } = await supabase
                            .from('profiles')
                            .insert({ id: session.user.id, name, email: session.user.email, role: defaultRole })
                            .select()
                            .single();

                        userData = newProfile
                            ? { id: newProfile.id, name: newProfile.name, email: newProfile.email, role: newProfile.email === 'shahtanmay132@gmail.com' ? 'admin' : newProfile.role }
                            : { id: session.user.id, name, email: session.user.email, role: defaultRole };
                    }

                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('token', session.access_token);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            });

            return () => subscription?.unsubscribe();
        }
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.auth.login(email, password);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token)
                localStorage.setItem('token', data.token);
            setIsLoading(false);
            return true;
        }
        catch (err) {
            setError(err.message || 'Invalid email or password');
            setIsLoading(false);
            return false;
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!supabase) {
                // Fallback: simulate Google login with a demo user
                const demoGoogleUser = {
                    id: 'google-' + Date.now(),
                    name: 'Google User',
                    email: 'googleuser@gmail.com',
                    role: 'user'
                };
                setUser(demoGoogleUser);
                localStorage.setItem('user', JSON.stringify(demoGoogleUser));
                localStorage.setItem('token', 'mock-google-token-' + Date.now());
                setIsLoading(false);
                return true;
            }

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/',
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });

            if (oauthError) {
                throw oauthError;
            }

            // OAuth redirects the browser, so we don't set state here.
            // The onAuthStateChange listener will handle it.
            return true;
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
            setIsLoading(false);
            return false;
        }
    };

    const signup = async (name, email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.auth.signup(name, email, password);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token)
                localStorage.setItem('token', data.token);
            setIsLoading(false);
            return true;
        }
        catch (err) {
            setError(err.message || 'Signup failed');
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        try {
            await apiService.auth.logout();
        } catch (err) {
            console.error('Logout error:', err);
        }
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
