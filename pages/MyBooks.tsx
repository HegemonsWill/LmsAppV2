import React, { useEffect, useState } from 'react';
import { User, BorrowRecord, BorrowStatus } from '../types';
import { borrowService } from '../services/api';

const MyBooks: React.FC<{ user: User }> = ({ user }) => {
    const [history, setHistory] = useState<BorrowRecord[]>([]);
    
    useEffect(() => {
        borrowService.getUserHistory(user.id).then(setHistory);
    }, [user.id]);

    const handleReturn = async (recordId: string) => {
        if(window.confirm("Return this book?")) {
            await borrowService.returnBook(recordId);
            const updated = await borrowService.getUserHistory(user.id);
            setHistory(updated);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Loans</h1>
                <p className="text-gray-500">Track your current reads and history.</p>
            </div>

            <div className="bg-white shadow-lg border border-gray-100 rounded-[32px] overflow-hidden">
                {history.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📚</div>
                        <h3 className="text-lg font-bold text-gray-900">No history found</h3>
                        <p className="text-gray-500 mt-1">You haven't borrowed any books yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Book Title</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Borrowed Date</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900 block text-lg">{record.bookTitle}</span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-500">
                                            {new Date(record.borrowDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-500">
                                            {new Date(record.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                record.status === BorrowStatus.RETURNED ? 'bg-gray-100 text-gray-500' :
                                                record.status === BorrowStatus.OVERDUE ? 'bg-red-100 text-red-600' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                            {record.status !== BorrowStatus.RETURNED && (
                                                <button 
                                                    onClick={() => handleReturn(record.id)} 
                                                    className="text-white brand-gradient px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                                                >
                                                    Return Book
                                                </button>
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

export default MyBooks;