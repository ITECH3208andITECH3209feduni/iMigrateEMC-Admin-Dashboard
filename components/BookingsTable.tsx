import React, { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../services/supabase';
import type { Booking } from '../types';
import ConfirmationModal from './modals/ConfirmationModal';
import RescheduleModal from './modals/RescheduleModal';

const BookingsTable: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [users, setUsers] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const bookingsPromise = supabaseAdmin
                .from('bookings')
                .select(`*, consultation_type(title)`)
                .order('created_at', { ascending: false });

            const usersPromise = supabaseAdmin.auth.admin.listUsers();
            
            const [
                { data: bookingsData, error: bookingsError },
                { data: usersData, error: usersError }
            ] = await Promise.all([bookingsPromise, usersPromise]);

            if (bookingsError) throw bookingsError;
            if (usersError) throw usersError;

            setBookings(bookingsData || []);

            const userMap = new Map<string, string>();
            if (usersData) {
                for (const user of usersData.users) {
                    if (user.email) {
                        userMap.set(user.id, user.email);
                    }
                }
            }
            setUsers(userMap);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bookings and user data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    
    const showMessage = (text: string, isError: boolean) => {
        setMessage({ text, isError });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleDeleteBooking = async () => {
        if (!bookingToDelete) return;
        const { error } = await supabaseAdmin.from('bookings').delete().eq('id', bookingToDelete.id);
        if (error) showMessage(`Failed to remove booking: ${error.message}`, true);
        else {
            showMessage('Booking removed successfully!', false);
            fetchBookings();
        }
        setBookingToDelete(null);
    };

    const handleRescheduleBooking = async (newDate: string, newTime: string) => {
        if (!bookingToReschedule) return;
        const { error } = await supabaseAdmin.from('bookings').update({ booking_date: newDate, time_slot: newTime }).eq('id', bookingToReschedule.id);
        if (error) showMessage(`Failed to reschedule booking: ${error.message}`, true);
        else {
            showMessage('Booking rescheduled successfully!', false);
            fetchBookings();
        }
        setBookingToReschedule(null);
    };

    const handleMarkDone = async (bookingId: number) => {
        const { error } = await supabaseAdmin.from('bookings').update({ status: 'Done' }).eq('id', bookingId);
        if (error) showMessage(`Failed to update status: ${error.message}`, true);
        else {
            showMessage('Booking marked as done!', false);
            fetchBookings();
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00'); // Assume UTC date
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || isNaN(amount)) return 'N/A';
        return `$${Number(amount).toFixed(2)}`;
    };

    return (
        <>
            {message && <p className={`text-center text-sm mb-4 p-2 rounded-md ${message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>}

            {loading && <div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-gray-700">Fetching booking data...</p></div>}
            
            {error && <div className="text-center py-12 bg-red-50 border border-red-200 rounded-lg"><p className="font-semibold text-red-600">Failed to load bookings.</p><p className="text-red-500 mt-2 text-sm">{error}</p></div>}

            {!loading && !error && (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    {bookings.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map(booking => (
                                    <tr key={booking.id} className={`hover:bg-gray-50 transition-colors ${booking.status === 'Done' ? 'bg-green-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"><div className="font-semibold">{formatDate(booking.booking_date)}</div><div>{booking.time_slot || 'N/A'}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{booking.consultation_type?.title || 'Unknown Service'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{users.get(booking.user_id) || <span className="text-gray-400">Not found</span>}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.purpose || <span className="text-gray-400">Not provided</span>}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={booking.questions}>{booking.questions || <span className="text-gray-400">None</span>}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatCurrency(booking.total_cost)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.payment_method || <span className="text-gray-400">N/A (Free)</span>}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {booking.document_urls && booking.document_urls.length > 0 ? booking.document_urls.map((url, index) => <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">File {index + 1}</a>) : <span className="text-gray-400">None</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800" title={booking.user_id}>{booking.user_id.substring(0,8)}...</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {booking.status === 'Done' && <span className="inline-block bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">Done</span>}
                                            <button onClick={() => setBookingToReschedule(booking)} className="text-blue-600 hover:text-blue-900">Reschedule</button>
                                            <button onClick={() => handleMarkDone(booking.id)} className="text-green-600 hover:text-green-900">Mark Done</button>
                                            <button onClick={() => setBookingToDelete(booking)} className="text-red-600 hover:text-red-900">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-8"><p className="text-gray-600">No bookings found.</p></div>
                    )}
                </div>
            )}
            <ConfirmationModal
                isOpen={!!bookingToDelete}
                onClose={() => setBookingToDelete(null)}
                onConfirm={handleDeleteBooking}
                title="Confirm Deletion"
                confirmText="Remove"
            >
                Are you sure you want to remove this booking? This action cannot be undone.
            </ConfirmationModal>
            <RescheduleModal
                isOpen={!!bookingToReschedule}
                onClose={() => setBookingToReschedule(null)}
                onConfirm={handleRescheduleBooking}
            />
        </>
    );
};

export default BookingsTable;