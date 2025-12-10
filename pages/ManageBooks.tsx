import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import { Book } from '../types';

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({});
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookPayload: any = {
        ...formData,
        publishYear: Number(formData.publishYear),
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.totalCopies),
        description: formData.description || 'No description provided.',
        coverUrl: formData.coverUrl || 'https://picsum.photos/200/300'
      };

      if (isEditing && currentBook.id) {
        await bookService.update({ ...currentBook as Book, ...bookPayload });
      } else {
        await bookService.add(bookPayload);
      }
      resetForm();
      loadBooks();
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    }
  };

  const startEdit = (book: Book) => {
    setIsEditing(true);
    setCurrentBook(book);
    setFormData({
      title: book.title, author: book.author, isbn: book.isbn, category: book.category,
      publishYear: book.publishYear, totalCopies: book.totalCopies,
      description: book.description, coverUrl: book.coverUrl, location: book.location || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Delete this book permanently?')) {
        await bookService.delete(id);
        loadBooks();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentBook({});
    setFormData({
      title: '', author: '', isbn: '', category: '',
      publishYear: new Date().getFullYear(), totalCopies: 1,
      description: '', coverUrl: '', location: ''
    });
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      {/* Form Section */}
      <div className="lg:col-span-4 bg-white p-8 rounded-[32px] shadow-lg border border-gray-100 overflow-y-auto">
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
        <form onSubmit={handleSubmit}>
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
          
          <div className="flex gap-3 pt-6 mt-2">
            <button type="submit" className="flex-1 brand-gradient text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all">
                {isEditing ? 'Save Changes' : 'Create Book'}
            </button>
            {isEditing && (
                <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-all">
                    Cancel
                </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="lg:col-span-8 bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden flex flex-col">
         <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-display font-bold text-gray-900">Inventory ({books.length})</h3>
         </div>
         <div className="overflow-y-auto p-4 space-y-3">
            {books.map(book => (
                <div key={book.id} className="group p-4 rounded-2xl bg-white border border-gray-100 hover:border-red-100 hover:shadow-md transition-all flex justify-between items-center">
                    <div className="flex items-center gap-5">
                         <img src={book.coverUrl} className="h-16 w-12 object-cover rounded-lg shadow-sm bg-gray-200" alt="" />
                         <div>
                             <p className="font-display font-bold text-gray-900 text-lg">{book.title}</p>
                             <p className="text-sm text-gray-500 font-medium">{book.author} <span className="text-gray-300 mx-2">•</span> {book.category}</p>
                         </div>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(book)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Edit</button>
                        <button onClick={() => handleDelete(book.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Delete</button>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ManageBooks;