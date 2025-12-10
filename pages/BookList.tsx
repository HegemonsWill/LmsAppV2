import React, { useEffect, useState } from 'react';
import { Book, User } from '../types';
import { bookService, borrowService } from '../services/api';

interface BookListProps {
  user: User;
}

const BookList: React.FC<BookListProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const data = await bookService.getAll();
    setBooks(data);
    setFilteredBooks(data);
    setLoading(false);
  };

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

  const handleBorrow = async (bookId: string) => {
    setProcessing(bookId);
    try {
      await borrowService.borrowBook(bookId, user.id);
      await loadBooks();
    } catch (e: any) {
      alert(e.message || "Failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400 font-medium animate-pulse">Loading library...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Book Catalog</h1>
            <p className="text-gray-500 text-sm mt-1">Discover your next favorite read.</p>
        </div>
        <div className="w-full md:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Search title, author, ISBN..."
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#FF3A2F] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
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
              
              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Availability</span>
                    <span className={`text-sm font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {book.availableCopies} / {book.totalCopies}
                    </span>
                </div>
                
                {book.availableCopies > 0 ? (
                  <button 
                    onClick={() => handleBorrow(book.id)}
                    disabled={processing === book.id}
                    className="text-sm brand-gradient text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
                  >
                    {processing === book.id ? '...' : 'Borrow'}
                  </button>
                ) : (
                  <button className="text-sm bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl font-bold cursor-not-allowed">
                    Waitlist
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
          <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">No books found</h3>
              <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
      )}
    </div>
  );
};

export default BookList;