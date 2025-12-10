// Run this script within your Amplify React app context or a script that has access to DataStore
import { DataStore } from 'aws-amplify';
import { Book, Member, Role } from './models';

export const seedDatabase = async () => {
  // Check if data exists
  const books = await DataStore.query(Book);
  if (books.length > 0) return;

  // Seed Members
  const members = [
    new Member({
      fullName: 'Admin User',
      email: 'admin@library.com',
      role: Role.ADMIN,
      joinedDate: new Date().toISOString(),
      avatarUrl: 'https://picsum.photos/seed/admin/200'
    }),
    new Member({
      fullName: 'Sarah Librarian',
      email: 'sarah@library.com',
      role: Role.LIBRARIAN,
      joinedDate: new Date().toISOString(),
      avatarUrl: 'https://picsum.photos/seed/sarah/200'
    }),
    new Member({
      fullName: 'John Doe',
      email: 'john@user.com',
      role: Role.USER,
      joinedDate: new Date().toISOString(),
      avatarUrl: 'https://picsum.photos/seed/john/200',
      isTwoFactorEnabled: true
    }),
    new Member({
        fullName: 'Jane Doe',
        email: 'jane@user.com',
        role: Role.USER,
        joinedDate: new Date().toISOString(),
        avatarUrl: 'https://picsum.photos/seed/jane/200'
    }),
    new Member({
        fullName: 'Robert Smith',
        email: 'robert@user.com',
        role: Role.USER,
        joinedDate: new Date().toISOString(),
        avatarUrl: 'https://picsum.photos/seed/robert/200'
    })
  ];

  for (const m of members) await DataStore.save(m);

  // Seed Books (20 samples)
  const categories = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'Classic'];
  const sampleBooks = Array.from({ length: 20 }).map((_, i) => new Book({
    title: `Sample Book Title ${i + 1}`,
    author: `Author Name ${i + 1}`,
    isbn: `978-0000000${i}`,
    category: categories[i % categories.length],
    totalCopies: 5,
    availableCopies: 5,
    coverImageURL: `https://picsum.photos/seed/book${i}/300/450`
  }));

  for (const b of sampleBooks) await DataStore.save(b);
  
  console.log('Database seeded successfully!');
};