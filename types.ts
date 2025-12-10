export enum UserRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishYear: number;
  description: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
}

export enum BorrowStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string; // ISO Date
  dueDate: string; // ISO Date
  returnDate?: string; // ISO Date
  status: BorrowStatus;
  bookTitle?: string; // Denormalized for display convenience
  userName?: string; // Denormalized for display convenience
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  reservationDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
  bookTitle?: string;
  userName?: string;
}

// AWS/API Response Wrappers (simulated)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}