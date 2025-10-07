import React, { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../services/supabase';
import type { PartnerEOI } from '../types';

const PartnerEOITable: React.FC = () => {
    const [eois, setEois] = useState<PartnerEOI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const fetchEois = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabaseAdmin
                .from('partner_eoi')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEois(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch Partner EOIs.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEois();
    }, [fetchEois]);

    const showMessage = (text: string, isError: boolean) => {
        setMessage({ text, isError });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleStatusChange = async (eoiId: number, newStatus: string) => {
        const { error } = await supabaseAdmin
            .from('partner_eoi')
            .update({ status: newStatus })
            .eq('id', eoiId);

        if (error) {
            showMessage(`Failed to update status: ${error.message}`, true);
        } else {
            showMessage('EOI status updated successfully!', false);
            fetchEois();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {message && <p className={`text-center text-sm mb-4 p-2 rounded-md ${message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>}

            {loading && <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-gray-700">Loading EOIs...</p></div>}
            
            {error && <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg"><p className="font-semibold text-red-600">Failed to load EOIs.</p><p className="text-red-500 mt-2 text-sm">{error}</p></div>}
            
            {!loading && !error && (
                <div className="overflow-x-auto">
                    {eois.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email & Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {eois.map(eoi => (
                                    <tr key={eoi.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(eoi.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{eoi.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>{eoi.email}</div>
                                            <div>{eoi.phone_number || <span className="text-gray-400">No phone</span>}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{eoi.company_name || <span className="text-gray-400">N/A</span>}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={eoi.message}>{eoi.message}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                eoi.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                eoi.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                                eoi.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {eoi.status || 'new'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {eoi.status !== 'contacted' && (
                                                <button onClick={() => handleStatusChange(eoi.id, 'contacted')} className="text-yellow-600 hover:text-yellow-900">Mark Contacted</button>
                                            )}
                                            {eoi.status !== 'closed' && (
                                                <button onClick={() => handleStatusChange(eoi.id, 'closed')} className="text-gray-600 hover:text-gray-900">Close</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-8"><p className="text-gray-600">No partner expressions of interest found.</p></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PartnerEOITable;