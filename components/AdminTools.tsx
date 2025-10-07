
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Service } from '../types';
import ConfirmationModal from './modals/ConfirmationModal';

const AdminTools: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({ title: '', description: '', duration: '', cost: '' });
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('consultation_type')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch services.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };
    
    const showMessage = (text: string, isError: boolean) => {
        setMessage({ text, isError });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { title, description, duration, cost } = formState;

        if (!title || !cost || !duration) {
            showMessage('Please fill out all required fields.', true);
            return;
        }

        const { error } = await supabase
            .from('consultation_type')
            .insert([{ 
                title, 
                description: description || null, 
                duration: parseInt(duration), 
                price: parseFloat(cost) 
            }]);
        
        if (error) {
            showMessage(`Failed to add service: ${error.message}`, true);
        } else {
            showMessage(`"${title}" service added successfully!`, false);
            setFormState({ title: '', description: '', duration: '', cost: '' });
            fetchServices();
        }
    };

    const handleDeleteService = async () => {
        if (!serviceToDelete) return;

        const { error } = await supabase
            .from('consultation_type')
            .delete()
            .eq('id', serviceToDelete.id);
        
        if (error) {
            showMessage(`Failed to remove service: ${error.message}`, true);
        } else {
            showMessage('Service removed successfully!', false);
            fetchServices();
        }
        setServiceToDelete(null);
    };
    
    const formatCurrency = (amount: number | null) => {
        if (amount === null || isNaN(amount)) return 'N/A';
        return `$${Number(amount).toFixed(2)}`;
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6">
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Add a New Service</h3>
                    <form onSubmit={handleAddService} className="space-y-4">
                        {/* Form fields */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Service Title</label>
                            <input type="text" id="title" value={formState.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" value={formState.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (in minutes)</label>
                            <input type="number" id="duration" value={formState.duration} onChange={handleInputChange} step="1" min="0" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost ($)</label>
                            <input type="number" id="cost" value={formState.cost} onChange={handleInputChange} step="0.01" min="0" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors">Add Service</button>
                        {message && <p className={`text-center text-sm mt-2 ${message.isError ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
                    </form>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Services</h3>
                    {loading && <div className="text-center py-4"><div className="inline-block w-6 h-6 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div><p className="mt-2 text-gray-600 text-sm">Loading services...</p></div>}
                    {error && <div className="text-center py-4 text-red-500 text-sm">{error}</div>}
                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            {services.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {services.map(service => (
                                            <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{service.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.duration || 'N/A'} mins</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatCurrency(service.price)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={service.description}>{service.description || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button onClick={() => setServiceToDelete(service)} className="text-red-600 hover:text-red-900 transition-colors">Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center p-8"><p className="text-gray-600">No services found. Add one above!</p></div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!serviceToDelete}
                onClose={() => setServiceToDelete(null)}
                onConfirm={handleDeleteService}
                title="Confirm Deletion"
                confirmText="Remove"
            >
                Are you sure you want to remove this service? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

export default AdminTools;