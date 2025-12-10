import React, { useState, useEffect } from 'react';
import { borrowService } from '../services/api';
import { BorrowRecord, BorrowStatus } from '../types';

const ActiveLoans: React.FC = () => {
    const [loans, setLoans] = useState<BorrowRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        setLoading(true);
        const data = await borrowService.getAllActiveRecords();
        setLoans(data);
        setLoading(false);
    };

    const handleReturn = async (recordId: string) => {
        if (!window.confirm("Confirm return of this book?")) return;
        
        setProcessingId(recordId);
        try {
            const result = await borrowService.returnBook(recordId);
            if (result?.fineAmount && result.fineAmount > 0) {
                alert(`Book Returned. Overdue Fine: $${result.fineAmount.toFixed(2)}`);
            } else {
                // Simple toast or reload
            }
            await loadLoans();
        } catch (e) {
            alert('Error returning book');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading loans...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                     <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Active Loans</h1>
                     <p className="text-gray-500">Monitor borrowed items and manage returns.</p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-display font-bold text-[#D81814]">{loans.length}</span>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active</p>
                </div>
            </div>

            <div className="bg-white shadow-lg border border-gray-100 rounded-[32px] overflow-hidden">
                {loans.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✅</div>
                        <h3 className="text-xl font-bold text-gray-900">All Clear</h3>
                        <p className="text-gray-500 mt-2">There are no active loans at the moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Book</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loans.map((loan) => {
                                    const isOverdue = loan.status === BorrowStatus.OVERDUE;
                                    return (
                                        <tr key={loan.id} className={`transition-colors ${isOverdue ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50/50'}`}>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-gray-900 block text-lg">{loan.bookTitle}</span>
                                                <span className="text-xs text-gray-400 font-mono">ID: {loan.bookId}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 mr-3">
                                                        {loan.userName?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{loan.userName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-600">
                                                    {new Date(loan.dueDate).toLocaleDateString()}
                                                </div>
                                                {isOverdue && (
                                                    <span className="text-xs font-bold text-[#D81814] block mt-1">
                                                        Overdue
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                    isOverdue 
                                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                                    : 'bg-green-100 text-green-700 border border-green-200'
                                                }`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <button 
                                                    onClick={() => handleReturn(loan.id)}
                                                    disabled={processingId === loan.id}
                                                    className="bg-white border-2 border-gray-100 text-gray-600 hover:border-[#FF3A2F] hover:text-[#D81814] px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                                >
                                                    {processingId === loan.id ? '...' : 'Return'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveLoans;