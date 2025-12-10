import { User, UserRole, Book, BorrowRecord, Reservation, BorrowStatus, BookRequest, RequestStatus } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@library.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://picsum.photos/seed/admin/200',
    isTwoFactorEnabled: false
  },
  {
    id: '2',
    name: 'Sarah Librarian',
    email: 'sarah@library.com',
    role: UserRole.LIBRARIAN,
    avatarUrl: 'https://picsum.photos/seed/sarah/200',
    isTwoFactorEnabled: false
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john@user.com',
    role: UserRole.USER,
    avatarUrl: 'https://picsum.photos/seed/john/200',
    isTwoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP' // Mock secret for demo (Base32)
  },
  {
    id: '4',
    name: 'Jane Doe',
    email: 'jane@user.com',
    role: UserRole.USER,
    avatarUrl: 'https://picsum.photos/seed/jane/200',
    isTwoFactorEnabled: false
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Classic',
    publishYear: 1925,
    description: 'A novel set in the Jazz Age that explores themes of wealth and excess.',
    coverUrl: 'https://picsum.photos/seed/gatsby/300/450',
    totalCopies: 5,
    availableCopies: 3,
    location: 'A-12'
  },
  {
    id: 'b2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Technology',
    publishYear: 2008,
    description: 'A handbook of agile software craftsmanship.',
    coverUrl: 'https://picsum.photos/seed/cleancode/300/450',
    totalCopies: 10,
    availableCopies: 8,
    location: 'T-05'
  },
  {
    id: 'b3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    category: 'Classic',
    publishYear: 1960,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town.',
    coverUrl: 'https://picsum.photos/seed/mockingbird/300/450',
    totalCopies: 4,
    availableCopies: 0,
    location: 'A-14'
  },
  {
    id: 'b4',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    category: 'Education',
    publishYear: 2009,
    description: 'Comprehensive introduction to the modern study of computer algorithms.',
    coverUrl: 'https://picsum.photos/seed/algo/300/450',
    totalCopies: 2,
    availableCopies: 2,
    location: 'E-22'
  }
];

export const INITIAL_RECORDS: BorrowRecord[] = [
  {
    id: 'r1',
    bookId: 'b1',
    userId: '3',
    borrowDate: '2023-10-01',
    dueDate: '2023-10-15',
    status: BorrowStatus.OVERDUE,
    bookTitle: 'The Great Gatsby',
    userName: 'John Doe'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
    {
        id: 'res1',
        bookId: 'b3',
        userId: '3',
        reservationDate: '2023-10-25',
        status: 'PENDING',
        bookTitle: 'To Kill a Mockingbird',
        userName: 'John Doe'
    }
];

export const INITIAL_REQUESTS: BookRequest[] = [
  {
    id: 'req1',
    bookId: 'b2',
    userId: '4',
    bookTitle: 'Clean Code',
    bookCoverUrl: 'https://picsum.photos/seed/cleancode/300/450',
    userName: 'Jane Doe',
    userAvatarUrl: 'https://picsum.photos/seed/jane/200',
    requestedAt: new Date(Date.now() - 10000000).toISOString(),
    status: RequestStatus.PENDING
  }
];