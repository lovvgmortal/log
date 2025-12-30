import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserSettings } from '../types';

export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                if (session) {
                    loadUserSettings(session.user.id);
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.warn("Session check failed", err);
                setLoading(false);
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
            setSession(nextSession);
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                if (nextSession) {
                    loadUserSettings(nextSession.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setUserSettings(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserSettings = async (userId: string) => {
        try {
            const { data: settings } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            setUserSettings(settings || { openrouter_key: '', youtube_key: '' });
        } catch (e) {
            console.error("Error loading user settings:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (email: string, pass: string, isSignUp: boolean) => {
        setAuthLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password: pass });
                if (error) throw error;
                return { success: true, message: "Đăng ký thành công! Hãy kiểm tra email xác thực hoặc đăng nhập." };
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
                if (error) throw error;
                return { success: true, message: "Đăng nhập thành công!" };
            }
        } catch (e: any) {
            return { success: false, message: e.message };
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUserSettings(null);
    };

    return {
        session,
        loading,
        authLoading,
        userSettings,
        handleEmailAuth,
        handleLogout,
    };
};
