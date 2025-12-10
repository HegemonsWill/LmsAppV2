import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import { Book } from '../types';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({});
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category: '',
    publishYear: new Date().getFullYear(), totalCopies: 1,
    description: '', coverUrl: '', location: ''
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const data = await bookService.getAll();
    setBooks(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (book?: Book) => {
      if (book) {
        setCurrentBook(book);
        setFormData({
            title: book.title, author: book.author, isbn: book.isbn, category: book.category,
            publishYear: book.publishYear || new Date().getFullYear(), totalCopies: book.totalCopies,
            description: book.description || '', coverUrl: book.coverUrl, location: book.location || ''
        });
      } else {
        setCurrentBook({});
        setFormData({
            title: '', author: '', isbn: '', category: '',
            publishYear: new Date().getFullYear(), totalCopies: 1,
            description: '', coverUrl: '', location: ''
        });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookPayload: any = {
        ...formData,
        publishYear: Number(formData.publishYear),
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.totalCopies), // Simple logic: reset available on edit/create
        description: formData.description || 'No description provided.',
        coverUrl: formData.coverUrl || 'https://picsum.photos/200/300'
      };

      if (currentBook.id) {
        await bookService.update({ ...currentBook as Book, ...bookPayload });
        showToast('Book updated successfully', 'success');
      } else {
        await bookService.add(bookPayload);
        showToast('Book created successfully', 'success');
      }
      setIsModalOpen(false);
      loadBooks();
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Delete this book permanently?')) {
        await bookService.delete(id);
        showToast('Book deleted', 'success');
        loadBooks();
    }
  };

  const InputField = ({ label, name, type = "text", ...props }: any) => (
      <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
          <input 
            name={name} 
            type={type}
            className="w-full bg-gray-50 text-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-[#FF3A2F] transition-all"
            {...props} 
          />
      </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Books Inventory</h1>
                    <p className="text-gray-500">Manage catalog, stock, and details.</p>
            </div>
            <button 
                onClick={() => openModal()}
                className="brand-gradient text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
                <span>+ Add Book</span>
            </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Book</th>
                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Copies</th>
                        <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {books.map(book => (
                        <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                     <img src={book.coverUrl} className="h-16 w-12 object-cover rounded-lg shadow-sm bg-gray-200" alt="" />
                                     <div>
                                         <p className="font-display font-bold text-gray-900 text-lg">{book.title}</p>
                                         <p className="text-sm text-gray-500 font-medium">{book.author}</p>
                                         <p className="text-xs text-gray-400 font-mono mt-1">{book.isbn}</p>
                                     </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{book.category}</span>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-gray-900">
                                {book.availableCopies} / {book.totalCopies}
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => openModal(book)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(book.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentBook.id ? 'Edit Book' : 'Add New Book'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Book Title" name="title" value={formData.title} onChange={handleInputChange} required />
          <InputField label="Author" name="author" value={formData.author} onChange={handleInputChange} required />
          
          <div className="grid grid-cols-2 gap-4">
             <InputField label="ISBN" name="isbn" value={formData.isbn} onChange={handleInputChange} required />
             <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-50 text-gray-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-[#FF3A2F] transition-all">
                    <option value="">Select...</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="Classic">Classic</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <InputField label="Year" name="publishYear" type="number" value={formData.publishYear} onChange={handleInputChange} />
             <InputField label="Copies" name="totalCopies" type="number" min="1" value={formData.totalCopies} onChange={handleInputChange} />
          </div>
           
          <InputField label="Cover Image URL" name="coverUrl" value={formData.coverUrl} onChange={handleInputChange} placeholder="https://..." />
          
          <div className="pt-4">
            <button type="submit" className="w-full brand-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all">
                {currentBook.id ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageBooks;