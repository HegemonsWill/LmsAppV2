import { Book, User, BorrowRecord, Reservation, BorrowStatus, UserRole } from '../types';
import { INITIAL_BOOKS, INITIAL_USERS, INITIAL_RECORDS, INITIAL_RESERVATIONS } from './mockData';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const KEYS = {
  USERS: 'lms_users',
  BOOKS: 'lms_books',
  RECORDS: 'lms_records',
  RESERVATIONS: 'lms_reservations',
  CURRENT_USER: 'lms_current_user'
};

// Initialize Data
const initializeData = () => {
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  if (!localStorage.getItem(KEYS.BOOKS)) localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  if (!localStorage.getItem(KEYS.RECORDS)) localStorage.setItem(KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
  if (!localStorage.getItem(KEYS.RESERVATIONS)) localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
};

initializeData();

// Generic Getter
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Generic Setter
const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// --- AUTH SERVICES ---
export const authService = {
  login: async (email: string): Promise<User | null> => {
    await delay(500);
    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },
  logout: async () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }
};

// --- BOOK SERVICES ---
export const bookService = {
  getAll: async (): Promise<Book[]> => {
    await delay(600);
    return getItems<Book>(KEYS.BOOKS);
  },
  getById: async (id: string): Promise<Book | undefined> => {
    await delay(300);
    const books = getItems<Book>(KEYS.BOOKS);
    return books.find(b => b.id === id);
  },
  add: async (book: Omit<Book, 'id'>): Promise<Book> => {
    await delay(800);
    const books = getItems<Book>(KEYS.BOOKS);
    const newBook = { ...book, id: Date.now().toString() };
    books.push(newBook);
    setItems(KEYS.BOOKS, books);
    return newBook;
  },
  update: async (book: Book): Promise<Book> => {
    await delay(500);
    const books = getItems<Book>(KEYS.BOOKS);
    const index = books.findIndex(b => b.id === book.id);
    if (index !== -1) {
      books[index] = book;
      setItems(KEYS.BOOKS, books);
    }
    return book;
  },
  delete: async (id: string): Promise<void> => {
    await delay(500);
    let books = getItems<Book>(KEYS.BOOKS);
    books = books.filter(b => b.id !== id);
    setItems(KEYS.BOOKS, books);
  }
};

// --- BORROW SERVICES ---
export const borrowService = {
  borrowBook: async (bookId: string, userId: string): Promise<BorrowRecord> => {
    await delay(600);
    const books = getItems<Book>(KEYS.BOOKS);
    const bookIndex = books.findIndex(b => b.id === bookId);
    
    if (bookIndex === -1 || books[bookIndex].availableCopies <= 0) {
      throw new Error("Book not available");
    }

    // Decrement copies
    books[bookIndex].availableCopies -= 1;
    setItems(KEYS.BOOKS, books);

    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.id === userId);

    const newRecord: BorrowRecord = {
      id: Date.now().toString(),
      bookId,
      userId,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      status: BorrowStatus.BORROWED,
      bookTitle: books[bookIndex].title,
      userName: user?.name
    };

    const records = getItems<BorrowRecord>(KEYS.RECORDS);
    records.push(newRecord);
    setItems(KEYS.RECORDS, records);

    return newRecord;
  },
  returnBook: async (recordId: string): Promise<void> => {
    await delay(600);
    const records = getItems<BorrowRecord>(KEYS.RECORDS);
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex !== -1) {
      const record = records[recordIndex];
      record.status = BorrowStatus.RETURNED;
      record.returnDate = new Date().toISOString();
      setItems(KEYS.RECORDS, records);

      // Increment copies
      const books = getItems<Book>(KEYS.BOOKS);
      const bookIndex = books.findIndex(b => b.id === record.bookId);
      if (bookIndex !== -1) {
        books[bookIndex].availableCopies += 1;
        setItems(KEYS.BOOKS, books);
      }
    }
  },
  getUserHistory: async (userId: string): Promise<BorrowRecord[]> => {
    await delay(400);
    const records = getItems<BorrowRecord>(KEYS.RECORDS);
    return records.filter(r => r.userId === userId).sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  },
  getAllActiveRecords: async (): Promise<BorrowRecord[]> => {
      await delay(400);
      const records = getItems<BorrowRecord>(KEYS.RECORDS);
      return records.filter(r => r.status === BorrowStatus.BORROWED || r.status === BorrowStatus.OVERDUE);
  }
};

// --- RESERVATION SERVICES ---
export const reservationService = {
    create: async (bookId: string, userId: string): Promise<Reservation> => {
        await delay(400);
        const books = getItems<Book>(KEYS.BOOKS);
        const book = books.find(b => b.id === bookId);
        const users = getItems<User>(KEYS.USERS);
        const user = users.find(u => u.id === userId);

        const newRes: Reservation = {
            id: Date.now().toString(),
            bookId,
            userId,
            reservationDate: new Date().toISOString(),
            status: 'PENDING',
            bookTitle: book?.title,
            userName: user?.name
        };
        const resList = getItems<Reservation>(KEYS.RESERVATIONS);
        resList.push(newRes);
        setItems(KEYS.RESERVATIONS, resList);
        return newRes;
    },
    getAll: async (): Promise<Reservation[]> => {
        await delay(500);
        return getItems<Reservation>(KEYS.RESERVATIONS);
    },
    updateStatus: async (id: string, status: Reservation['status']): Promise<void> => {
        await delay(400);
        const resList = getItems<Reservation>(KEYS.RESERVATIONS);
        const idx = resList.findIndex(r => r.id === id);
        if (idx !== -1) {
            resList[idx].status = status;
            setItems(KEYS.RESERVATIONS, resList);
        }
    }
};