

import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAdmin } from '../services/supabase';
import type { ChatMessage, SupabaseUser } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ChatIcon } from './icons/ChatIcon';
import { SendIcon } from './icons/SendIcon';

const LiveChat: React.FC = () => {
    const [users, setUsers] = useState<SupabaseUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<SupabaseUser | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messageListRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        const fetchUsersWithChats = async () => {
            setLoadingUsers(true);
            const { data: messagesData, error: messagesError } = await supabaseAdmin
                .from('chat_messages')
                .select('user_id');
            
            if (messagesError) {
                console.error("Error fetching chat users:", messagesError.message);
                setLoadingUsers(false);
                return;
            }

            const userIds = [...new Set((messagesData || []).map(m => m.user_id))];

            if (userIds.length > 0) {
                // FIX: Destructuring the result from Supabase client methods can sometimes break TypeScript's type narrowing.
                // By assigning the whole response to a variable before checking for an error, we ensure `data` is correctly typed in the `else` block.
                const userListResponse = await supabaseAdmin.auth.admin.listUsers();
                if (userListResponse.error) {
                    console.error("Error fetching user details:", userListResponse.error.message);
                } else {
                    const usersWithChats = userListResponse.data.users.filter(u => userIds.includes(u.id));
                    setUsers(usersWithChats as SupabaseUser[]);
                }
            }
            setLoadingUsers(false);
        };

        fetchUsersWithChats();
    }, []);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }

        if (selectedUser) {
            const channel = supabase
                .channel(`chat-admin:${selectedUser.id}`)
                .on<ChatMessage>(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${selectedUser.id}` },
                    (payload) => {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                )
                .subscribe();
            
            channelRef.current = channel;
        }

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [selectedUser]);

    const handleSelectUser = async (user: SupabaseUser) => {
        setSelectedUser(user);
        setLoadingMessages(true);
        setMessages([]);
        const { data, error } = await supabaseAdmin
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Error fetching messages:', error.message);
        } else {
            setMessages(data);
        }
        setLoadingMessages(false);
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const content = newMessage;
        setNewMessage('');
        
        const { error } = await supabaseAdmin.from('chat_messages').insert({
            user_id: selectedUser.id,
            content: content,
            sender_is_admin: true
        });

        if (error) {
            console.error("Failed to send message:", error.message);
            setNewMessage(content); // Revert on failure
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row h-[40rem] border border-gray-200 rounded-lg">
                <aside className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-lg">Conversations</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loadingUsers && <div className="p-4 text-center text-gray-500">Loading conversations...</div>}
                        {!loadingUsers && users.length === 0 && <div className="p-4 text-gray-500 text-center">No conversations started yet.</div>}
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className={`w-full text-left p-3 border-b transition-colors ${selectedUser?.id === user.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                            >
                                <p className="font-semibold text-gray-800">{user.email}</p>
                                <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                            </button>
                        ))}
                    </div>
                </aside>
                <section className="w-full md:w-2/3 flex flex-col bg-gray-50">
                    {!selectedUser ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                            <ChatIcon className="h-16 w-16 text-gray-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-700">Select a conversation</h3>
                            <p className="mt-1 text-gray-500">Choose a user from the list to view and reply to messages.</p>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col overflow-hidden">
                            <header className="bg-white p-3 border-b flex items-center">
                                <h3 className="font-bold">{selectedUser.email}</h3>
                            </header>
                            <main ref={messageListRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                                {loadingMessages && <div className="text-center text-gray-500">Loading messages...</div>}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender_is_admin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-md px-3 py-2 rounded-lg ${msg.sender_is_admin ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </main>
                            <footer className="bg-white p-3 border-t">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        autoComplete="off"
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                                        <SendIcon className="h-5 w-5" />
                                    </button>
                                </form>
                            </footer>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default LiveChat;