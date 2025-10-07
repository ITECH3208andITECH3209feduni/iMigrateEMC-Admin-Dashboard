import React, { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAdmin } from '../services/supabase';
import type { SupabaseUser } from '../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<SupabaseUser[]>([]);
    const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
            if (!currentAuthUser) throw new Error("Could not identify current user.");
            setCurrentUser(currentAuthUser as SupabaseUser);

            const { data, error } = await supabaseAdmin.auth.admin.listUsers();
            if (error) throw error;
            setUsers(data.users as SupabaseUser[]);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const showMessage = (text: string, isError: boolean) => {
        setMessage({ text, isError });
        setTimeout(() => setMessage(null), 5000);
    };
    
    const handleRoleChange = async (user: SupabaseUser, newRole: 'admin' | null) => {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { app_metadata: { ...user.app_metadata, role: newRole } }
        );

        if (error) {
            showMessage(`Failed to update role: ${error.message}`, true);
        } else {
            showMessage(`User ${user.email} role updated successfully.`, false);
            fetchUsers(); // Refresh the list
        }
    };
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {message && <p className={`text-center text-sm mb-4 p-2 rounded-md ${message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>}

            {loading && <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-gray-700">Loading user data...</p></div>}
            
            {error && <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg"><p className="font-semibold text-red-600">Failed to load users.</p><p className="text-red-500 mt-2 text-sm">{error}</p></div>}
            
            {!loading && !error && (
                <div className="overflow-x-auto">
                    {users.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign In</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {user.app_metadata?.role === 'admin' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(user.last_sign_in_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {user.app_metadata?.role === 'admin' ? (
                                                <button
                                                    onClick={() => handleRoleChange(user, null)}
                                                    disabled={user.id === currentUser?.id}
                                                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    title={user.id === currentUser?.id ? "You cannot change your own role." : ""}
                                                >
                                                    Remove Admin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRoleChange(user, 'admin')}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Make Admin
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-8"><p className="text-gray-600">No users found.</p></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserManagement;