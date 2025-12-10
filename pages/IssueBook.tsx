import React, { useState, useEffect } from 'react';
import { bookService, userService, borrowService } from '../services/api';
import { Book, User } from '../types';
import { useNavigate } from 'react-router-dom';

const IssueBook: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBook, setSelectedBook] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const [u, b] = await Promise.all([userService.getAll(), bookService.getAll()]);
            setUsers(u);
            setBooks(b);
            // Default due date: 14 days from now
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 14);
            setDueDate(defaultDate.toISOString().split('T')[0]);
        };
        loadData();
    }, []);

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!selectedUser || !selectedBook) {
            setMessage({ type: 'error', text: 'Please select both a user and a book.' });
            setLoading(false);
            return;
        }

        try {
            await borrowService.borrowBook(selectedBook, selectedUser, new Date(dueDate).toISOString());
            setMessage({ type: 'success', text: 'Book issued successfully!' });
            setTimeout(() => navigate('/active-loans'), 1500);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to issue book.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
             <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Issue Book</h1>
                <p className="text-gray-500">Assign a book to a user.</p>
            </div>

            <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden p-8 lg:p-12">
                <form onSubmit={handleIssue} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* User Selection */}
                        <div className="space-y-2">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select User</label>
                             <div className="relative">
                                <select 
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 text-lg rounded-2xl focus:ring-2 focus:ring-[#FF3A2F] focus:border-transparent block w-full p-4 border-none transition-all appearance-none"
                                >
                                    <option value="">Choose a member...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                             </div>
                        </div>

                        {/* Book Selection */}
                         <div className="space-y-2">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Book</label>
                             <div className="relative">
                                <select 
                                    value={selectedBook}
                                    onChange={(e) => setSelectedBook(e.target.value)}
                                    className="w-full bg-gray-50 text-gray-900 text-lg rounded-2xl focus:ring-2 focus:ring-[#FF3A2F] focus:border-transparent block w-full p-4 border-none transition-all appearance-none"
                                >
                                    <option value="">Choose a book...</option>
                                    {books.map(b => (
                                        <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                                            {b.title} {b.availableCopies <= 0 ? '(Unavailable)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                             </div>
                             {selectedBook && (
                                 <p className="text-sm text-gray-500 pl-2">
                                     Selected: <span className="font-bold text-gray-900">{books.find(b => b.id === selectedBook)?.title}</span>
                                 </p>
                             )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Due Date</label>
                        <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-gray-50 text-gray-900 text-lg rounded-2xl focus:ring-2 focus:ring-[#FF3A2F] focus:border-transparent block w-full p-4 border-none transition-all"
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full brand-gradient text-white font-bold text-xl py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:opacity-95 transition-all transform hover:-translate-y-1 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Confirm Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueBook;