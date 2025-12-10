import React, { useState, useEffect } from 'react';
import { bookRequestService } from '../services/api';
import { BookRequest, RequestStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';

const BookRequests: React.FC = () => {
    const [requests, setRequests] = useState<BookRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { refreshNotifications } = useNotifications();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        const data = await bookRequestService.getAll();
        // Filter to show mainly pending, but could show all. Prompt says "Requests" tab.
        // Let's show all but sort Pending first.
        const sorted = data.sort((a, b) => {
            if (a.status === RequestStatus.PENDING && b.status !== RequestStatus.PENDING) return -1;
            if (a.status !== RequestStatus.PENDING && b.status === RequestStatus.PENDING) return 1;
            return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        });
        setRequests(sorted);
        setLoading(false);
    };

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        try {
            if (action === 'APPROVE') {
                await bookRequestService.updateStatus(id, RequestStatus.APPROVED);
                showToast('Request approved. Book issued.', 'success');
            } else {
                await bookRequestService.updateStatus(id, RequestStatus.REJECTED);
                showToast('Request rejected.', 'success');
            }
            // Instant update
            await loadRequests();
            await refreshNotifications();
        } catch (e: any) {
            showToast(e.message || 'Action failed', 'error');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading requests...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                     <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Book Requests</h1>
                     <p className="text-gray-500">Manage borrowing requests from users.</p>
                </div>
                <div className="text-right">
                     <span className="text-4xl font-display font-bold text-[#D81814]">
                         {requests.filter(r => r.status === RequestStatus.PENDING).length}
                     </span>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending</p>
                </div>
            </div>

            <div className="bg-white shadow-lg border border-gray-100 rounded-[32px] overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📭</div>
                        <h3 className="text-xl font-bold text-gray-900">No Requests</h3>
                        <p className="text-gray-500 mt-2">There are no book requests at the moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Book</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Requested By</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <img src={req.bookCoverUrl} className="h-16 w-12 object-cover rounded-lg shadow-sm bg-gray-200" alt="" />
                                                <span className="text-sm font-bold text-gray-900">{req.bookTitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                 <img src={req.userAvatarUrl} className="w-8 h-8 rounded-full bg-gray-200" alt="" />
                                                 <span className="text-sm font-medium text-gray-700">{req.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-500">
                                            {new Date(req.requestedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                req.status === RequestStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                                                req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {req.status === RequestStatus.PENDING && (
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleAction(req.id, 'APPROVE')}
                                                        className="bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-green-100"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(req.id, 'REJECT')}
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-red-100"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookRequests;