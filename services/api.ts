import { Book, User, BorrowRecord, Reservation, BorrowStatus, UserRole, BookRequest, RequestStatus } from '../types';
import { INITIAL_BOOKS, INITIAL_USERS, INITIAL_RECORDS, INITIAL_RESERVATIONS, INITIAL_REQUESTS } from './mockData';
import * as OTPAuth from 'otpauth';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const KEYS = {
  USERS: 'lms_users',
  BOOKS: 'lms_books',
  RECORDS: 'lms_records',
  RESERVATIONS: 'lms_reservations',
  REQUESTS: 'lms_requests',
  CURRENT_USER: 'lms_current_user'
};

// Initialize Data
const initializeData = () => {
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  if (!localStorage.getItem(KEYS.BOOKS)) localStorage.setItem(KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  if (!localStorage.getItem(KEYS.RECORDS)) localStorage.setItem(KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
  if (!localStorage.getItem(KEYS.RESERVATIONS)) localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
  if (!localStorage.getItem(KEYS.REQUESTS)) localStorage.setItem(KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
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
  login: async (email: string): Promise<{ user: User | null; requires2FA: boolean }> => {
    await delay(500);
    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.email === email);
    
    if (user) {
      if (user.isTwoFactorEnabled) {
        return { user: user, requires2FA: true };
      }
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return { user: user, requires2FA: false };
    }
    return { user: null, requires2FA: false };
  },

  verify2FA: async (userId: string, token: string): Promise<boolean> => {
    await delay(800);
    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.twoFactorSecret) return false;

    const totp = new OTPAuth.TOTP({
      issuer: 'LibraTech',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret)
    });

    const delta = totp.validate({ token, window: 1 });
    if (delta !== null) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        return true;
    }
    return false;
  },

  logout: async () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },
  
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  
  generateTwoFactorSecret: async (userId: string): Promise<{ secret: string; otpauth_url: string }> => {
    await delay(600);
    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    const secret = new OTPAuth.Secret({ size: 20 }); 
    const secretBase32 = secret.base32;

    const totp = new OTPAuth.TOTP({
      issuer: 'LibraTech',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });

    return { 
        secret: secretBase32, 
        otpauth_url: totp.toString() 
    };
  },

  enableTwoFactor: async (userId: string, secret: string, token: string): Promise<boolean> => {
    await delay(800);
    const totp = new OTPAuth.TOTP({
      issuer: 'LibraTech',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });

    const delta = totp.validate({ token, window: 1 });

    if (delta !== null) {
      const users = getItems<User>(KEYS.USERS);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].isTwoFactorEnabled = true;
        users[userIndex].twoFactorSecret = secret;
        setItems(KEYS.USERS, users);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
        return true;
      }
    }
    return false;
  },

  disableTwoFactor: async (userId: string): Promise<void> => {
    await delay(500);
    const users = getItems<User>(KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].isTwoFactorEnabled = false;
      delete users[userIndex].twoFactorSecret;
      setItems(KEYS.USERS, users);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
    }
  }
};

// --- USER/MEMBER SERVICES ---
export const userService = {
    getAll: async (): Promise<User[]> => {
        await delay(400);
        return getItems<User>(KEYS.USERS);
    },
    // Add Member CRUD
    add: async (member: Omit<User, 'id'>): Promise<User> => {
        await delay(500);
        const members = getItems<User>(KEYS.USERS);
        const newMember = { 
            ...member, 
            id: Date.now().toString(),
            joinedDate: new Date().toISOString(),
            avatarUrl: member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`
        };
        members.push(newMember);
        setItems(KEYS.USERS, members);
        return newMember;
    },
    update: async (member: User): Promise<User> => {
        await delay(500);
        const members = getItems<User>(KEYS.USERS);
        const index = members.findIndex(m => m.id === member.id);
        if (index !== -1) {
            members[index] = { ...members[index], ...member };
            setItems(KEYS.USERS, members);
            // If current user, update session
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.id === member.id) {
                localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(members[index]));
            }
        }
        return member;
    },
    delete: async (id: string): Promise<void> => {
        await delay(500);
        let members = getItems<User>(KEYS.USERS);
        members = members.filter(m => m.id !== id);
        setItems(KEYS.USERS, members);
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
  borrowBook: async (bookId: string, userId: string, customDueDate?: string): Promise<BorrowRecord> => {
    await delay(600);
    const books = getItems<Book>(KEYS.BOOKS);
    const bookIndex = books.findIndex(b => b.id === bookId);
    
    if (bookIndex === -1 || books[bookIndex].availableCopies <= 0) {
      throw new Error("Book not available");
    }

    books[bookIndex].availableCopies -= 1;
    setItems(KEYS.BOOKS, books);

    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.id === userId);

    const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); 

    const newRecord: BorrowRecord = {
      id: Date.now().toString(),
      bookId,
      userId,
      borrowDate: new Date().toISOString(),
      dueDate: customDueDate || defaultDue.toISOString(),
      status: BorrowStatus.BORROWED,
      bookTitle: books[bookIndex].title,
      userName: user?.name
    };

    const records = getItems<BorrowRecord>(KEYS.RECORDS);
    records.push(newRecord);
    setItems(KEYS.RECORDS, records);

    return newRecord;
  },

  returnBook: async (recordId: string): Promise<BorrowRecord | null> => {
    await delay(600);
    const records = getItems<BorrowRecord>(KEYS.RECORDS);
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex !== -1) {
      const record = records[recordIndex];
      record.status = BorrowStatus.RETURNED;
      record.returnDate = new Date().toISOString();
      
      const due = new Date(record.dueDate);
      const returned = new Date(record.returnDate);
      if (returned > due) {
          const diffTime = Math.abs(returned.getTime() - due.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          record.fineAmount = diffDays * 0.50;
      } else {
          record.fineAmount = 0;
      }

      setItems(KEYS.RECORDS, records);

      const books = getItems<Book>(KEYS.BOOKS);
      const bookIndex = books.findIndex(b => b.id === record.bookId);
      if (bookIndex !== -1) {
        books[bookIndex].availableCopies += 1;
        setItems(KEYS.BOOKS, books);
      }
      return record;
    }
    return null;
  },

  getUserHistory: async (userId: string): Promise<BorrowRecord[]> => {
    await delay(400);
    const records = getItems<BorrowRecord>(KEYS.RECORDS);
    const now = new Date();
    const updatedRecords = records.map(r => {
        if (r.status === BorrowStatus.BORROWED && new Date(r.dueDate) < now) {
            return { ...r, status: BorrowStatus.OVERDUE };
        }
        return r;
    });
    
    return updatedRecords
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  },

  getAllActiveRecords: async (): Promise<BorrowRecord[]> => {
      await delay(400);
      const records = getItems<BorrowRecord>(KEYS.RECORDS);
      const now = new Date();
      const updatedRecords = records.map(r => {
          if (r.status === BorrowStatus.BORROWED && new Date(r.dueDate) < now) {
              return { ...r, status: BorrowStatus.OVERDUE };
          }
          return r;
      });

      return updatedRecords
        .filter(r => r.status === BorrowStatus.BORROWED || r.status === BorrowStatus.OVERDUE)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }
};

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

// --- BOOK REQUEST SERVICES ---
export const bookRequestService = {
  create: async (bookId: string, userId: string): Promise<BookRequest> => {
    await delay(300);
    const books = getItems<Book>(KEYS.BOOKS);
    const book = books.find(b => b.id === bookId);
    const users = getItems<User>(KEYS.USERS);
    const user = users.find(u => u.id === userId);
    
    const newReq: BookRequest = {
      id: Date.now().toString(),
      bookId,
      userId,
      bookTitle: book?.title || 'Unknown',
      bookCoverUrl: book?.coverUrl || '',
      userName: user?.name || 'Unknown',
      userAvatarUrl: user?.avatarUrl || '',
      requestedAt: new Date().toISOString(),
      status: RequestStatus.PENDING
    };

    const requests = getItems<BookRequest>(KEYS.REQUESTS);
    requests.push(newReq);
    setItems(KEYS.REQUESTS, requests);
    return newReq;
  },

  getAll: async (): Promise<BookRequest[]> => {
    await delay(300);
    const requests = getItems<BookRequest>(KEYS.REQUESTS);
    return requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  },

  getPendingCount: async (): Promise<number> => {
    const requests = getItems<BookRequest>(KEYS.REQUESTS);
    return requests.filter(r => r.status === RequestStatus.PENDING).length;
  },

  updateStatus: async (requestId: string, status: RequestStatus): Promise<void> => {
    await delay(400);
    const requests = getItems<BookRequest>(KEYS.REQUESTS);
    const idx = requests.findIndex(r => r.id === requestId);
    
    if (idx !== -1) {
      // If Approved, convert to BorrowRecord
      if (status === RequestStatus.APPROVED) {
        const req = requests[idx];
        // Attempt to borrow (will fail if no stock, but assuming admin overrides or checked)
        // Note: borrowService decreases availability.
        try {
            await borrowService.borrowBook(req.bookId, req.userId);
            requests[idx].status = status;
            // Delete request after approval as per prompt requirement?
            // "Approve → creates normal Borrowing record, deletes request"
            requests.splice(idx, 1);
            setItems(KEYS.REQUESTS, requests);
        } catch (e) {
            throw new Error('Cannot approve: Book unavailable or error.');
        }
      } else if (status === RequestStatus.REJECTED) {
          // "Reject → deletes request"
          requests.splice(idx, 1);
          setItems(KEYS.REQUESTS, requests);
      }
    }
  }
};