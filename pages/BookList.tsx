import React, { useEffect, useState } from 'react';
import { Book, User, UserRole, BorrowRecord } from '../types';
import { bookService, borrowService, bookRequestService, userService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

interface BookListProps {
  user: User;
}

const BookList: React.FC<BookListProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Admin Data
  const [users, setUsers] = useState<User[]>([]);
  const [activeLoans, setActiveLoans] = useState<BorrowRecord[]>([]);

  // Modal State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Issue Form State
  const [issueUserId, setIssueUserId] = useState('');
  const [issueDueDate, setIssueDueDate] = useState('');

  const { showToast } = useToast();

  const isAdminOrLibrarian = user.role === UserRole.ADMIN || user.role === UserRole.LIBRARIAN;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allBooks, allUsers, allLoans] = await Promise.all([
        bookService.getAll(),
        userService.getAll(),
        borrowService.getAllActiveRecords()
      ]);
      setBooks(allBooks);
      setFilteredBooks(allBooks);
      setUsers(allUsers);
      setActiveLoans(allLoans);
    } catch (error) {
      showToast('Error loading library data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = books.filter(b => 
      b.title.toLowerCase().includes(term) || 
      b.author.toLowerCase().includes(term) ||
      b.isbn.includes(term) ||
      b.category.toLowerCase().includes(term)
    );
    setFilteredBooks(filtered);
  }, [search, books]);

  // --- HANDLERS ---

  // 1. Open Issue Modal
  const openIssueModal = (book: Book) => {
    setSelectedBook(book);
    setIssueUserId('');
    // Default due date 14 days
    const date = new Date();
    date.setDate(date.getDate() + 14);
    setIssueDueDate(date.toISOString().split('T')[0]);
    setIssueModalOpen(true);
  };

  // 2. Submit Issue
  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !issueUserId) {
        showToast('Please select a user', 'error');
        return;
    }
    try {
        await borrowService.borrowBook(selectedBook.id, issueUserId, new Date(issueDueDate).toISOString());
        showToast('Book issued successfully', 'success');
        setIssueModalOpen(false);
        await loadData(); // Instant Refresh
    } catch (err: any) {
        showToast(err.message || 'Failed to issue', 'error');
    }
  };

  // 3. Open Return Modal
  const openReturnModal = (book: Book) => {
    setSelectedBook(book);
    setReturnModalOpen(true);
  };

  // 4. Submit Return (Specific Loan)
  const handleReturnBook = async (recordId: string) => {
      try {
          const result = await borrowService.returnBook(recordId);
          showToast('Book returned successfully', 'success');
          if (result?.fineAmount && result.fineAmount > 0) {
              alert(`Overdue Fine: $${result.fineAmount.toFixed(2)}`);
          }
          // Check if we need to close modal (if no more loans for this book)
          const remainingLoans = activeLoans.filter(l => l.bookId === selectedBook?.id && l.id !== recordId);
          if (remainingLoans.length === 0) {
              setReturnModalOpen(false);
          }
          await loadData(); // Instant Refresh
      } catch (err: any) {
          showToast('Failed to return book', 'error');
      }
  };

  // 5. User Reserve / Waitlist -> Request
  const handleUserAction = async (book: Book) => {
      try {
          // Both Reserve (avail > 0) and Waitlist (avail == 0) create a Request
          await bookRequestService.create(book.id, user.id);
          showToast('Request sent successfully', 'success');
      } catch (err: any) {
          showToast('Failed to place request', 'error');
      }
  };

  if (loading) return <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading catalog...</div>;

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Book Catalog</h1>
            <p className="text-gray-500 text-sm mt-1">Manage inventory and loans.</p>
        </div>
        <div className="w-full md:w-96 relative">
            <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-4 pr-4 text-gray-900 focus:ring-2 focus:ring-[#FF3A2F] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredBooks.map((book) => {
            const isBorrowed = book.totalCopies > book.availableCopies;
            const isAvailable = book.availableCopies > 0;

            return (
                <div key={book.id} className="bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group">
                    <div className="h-64 bg-gray-100 relative overflow-hidden">
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4">
                            <span className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                                {book.category}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-display font-bold text-gray-900 line-clamp-1 mb-1" title={book.title}>{book.title}</h3>
                        <p className="text-sm font-medium text-gray-500 mb-4">{book.author}</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Stock</span>
                                <span className={`text-sm font-bold ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                                    {book.availableCopies} / {book.totalCopies}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {isAdminOrLibrarian ? (
                                    <>
                                        {isAvailable && (
                                            <button 
                                                onClick={() => openIssueModal(book)}
                                                className="w-full brand-gradient text-white font-bold py-2.5 rounded-full shadow-lg hover:shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 text-sm"
                                            >
                                                Issue Book
                                            </button>
                                        )}
                                        {isBorrowed && (
                                            <button 
                                                onClick={() => openReturnModal(book)}
                                                className="w-full bg-white border-2 border-red-100 text-[#D81814] font-bold py-2.5 rounded-full hover:bg-red-50 hover:border-red-200 transition-all text-sm"
                                            >
                                                Return Book
                                            </button>
                                        )}
                                        {!isAvailable && !isBorrowed && (
                                            <span className="text-center text-xs text-gray-400 font-medium py-2">No Actions Available</span>
                                        )}
                                    </>
                                ) : (
                                    // User Actions
                                    <button 
                                        onClick={() => handleUserAction(book)}
                                        className={`w-full font-bold py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm ${
                                            isAvailable 
                                            ? 'brand-gradient text-white' 
                                            : 'bg-gray-800 text-white hover:bg-gray-900'
                                        }`}
                                    >
                                        {isAvailable ? 'Reserve' : 'Join Waitlist'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* --- ISSUE BOOK MODAL (Admin Only) --- */}
      <Modal isOpen={issueModalOpen} onClose={() => setIssueModalOpen(false)} title={`Issue: ${selectedBook?.title}`}>
          <form onSubmit={handleIssueBook} className="space-y-6">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select User</label>
                  <select 
                      value={issueUserId} 
                      onChange={(e) => setIssueUserId(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-[#FF3A2F]"
                      required
                  >
                      <option value="">Choose a member...</option>
                      {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                      type="date"
                      value={issueDueDate}
                      onChange={(e) => setIssueDueDate(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-[#FF3A2F]"
                      required
                  />
              </div>
              <button type="submit" className="w-full brand-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all">
                  Confirm Issue
              </button>
          </form>
      </Modal>

      {/* --- RETURN BOOK MODAL (Admin Only) --- */}
      <Modal isOpen={returnModalOpen} onClose={() => setReturnModalOpen(false)} title={`Return: ${selectedBook?.title}`}>
          <div className="space-y-4">
              <p className="text-gray-500 text-sm mb-4">Select the loan to mark as returned:</p>
              {activeLoans.filter(l => l.bookId === selectedBook?.id).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                      No active loans found for this book.
                  </div>
              ) : (
                  <div className="space-y-3">
                      {activeLoans.filter(l => l.bookId === selectedBook?.id).map(loan => (
                          <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-100 transition-colors">
                              <div>
                                  <p className="font-bold text-gray-900">{loan.userName}</p>
                                  <p className="text-xs text-gray-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                              </div>
                              <button 
                                  onClick={() => handleReturnBook(loan.id)}
                                  className="brand-gradient text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition-all"
                              >
                                  Return
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </Modal>
    </div>
  );
};

export default BookList;