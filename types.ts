export enum UserRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  USER = 'USER',
  GUEST = 'GUEST'
}

// User is now synonymous with Member for frontend consistency
export interface User {
  id: string;
  email: string;
  name: string; // Maps to fullName
  role: UserRole;
  phone?: string;
  joinedDate?: string;
  avatarUrl?: string;
  isTwoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishYear?: number; // Optional in new schema, kept for UI
  description?: string;
  coverUrl: string; // Maps to coverImageURL
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
  userId: string; // Maps to memberID
  borrowDate: string; // ISO Date (issuedDate)
  dueDate: string; // ISO Date
  returnDate?: string; // ISO Date
  status: BorrowStatus;
  bookTitle?: string; 
  userName?: string; 
  fineAmount?: number;
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

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface BookRequest {
  id: string;
  bookId: string;
  userId: string;
  bookTitle: string; // Flattened for UI convenience
  bookCoverUrl: string; // Flattened
  userName: string; // Flattened
  userAvatarUrl: string; // Flattened
  requestedAt: string; // ISO Date
  status: RequestStatus;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}