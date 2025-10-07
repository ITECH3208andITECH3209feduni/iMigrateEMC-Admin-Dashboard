
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message || 'Invalid credentials. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 transition-all duration-500 mt-16">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Admin Login</h2>
            <p className="text-sm text-center text-gray-500 mb-6">Enter your credentials to view the dashboard.</p>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="Email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        placeholder="Password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <p className="text-center text-red-500 text-sm mt-4">{error}</p>}
            </form>
        </div>
    );
};

export default Login;
