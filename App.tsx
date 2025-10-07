
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AccessDenied from './components/AccessDenied';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.app_metadata?.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        };

        checkUserRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                // Re-check role on auth state change
                supabase.auth.getUser().then(({ data: { user } }) => {
                    setIsAdmin(user?.app_metadata?.role === 'admin');
                });
            } else {
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        // FIX: Corrected a syntax error in the destructuring assignment. The extra '}' was removed.
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {!session ? (
                <Login />
            ) : isAdmin ? (
                <Dashboard onSignOut={handleSignOut} />
            ) : (
                <AccessDenied onSignOut={handleSignOut} />
            )}
        </div>
    );
};

export default App;