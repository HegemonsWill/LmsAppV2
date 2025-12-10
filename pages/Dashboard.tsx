import React, { useEffect, useState } from 'react';
import { User, UserRole, Book, BorrowStatus } from '../types';
import { bookService, borrowService, userService, reservationService } from '../services/api';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueCount: 0,
    pendingReservations: 0,
    myActiveLoans: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);

  const isAdminOrLibrarian = user.role === UserRole.ADMIN || user.role === UserRole.LIBRARIAN;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const books = await bookService.getAll();
        
        if (isAdminOrLibrarian) {
          const loans = await borrowService.getAllActiveRecords();
          const members = await userService.getAll();
          const reservations = await reservationService.getAll();
          
          setStats({
            totalBooks: books.length,
            totalMembers: members.length,
            activeLoans: loans.length,
            overdueCount: loans.filter(l => l.status === BorrowStatus.OVERDUE).length,
            pendingReservations: reservations.filter(r => r.status === 'PENDING').length,
            myActiveLoans: 0
          });
        } else {
          const myHistory = await borrowService.getUserHistory(user.id);
          const active = myHistory.filter(h => h.status === BorrowStatus.BORROWED || h.status === BorrowStatus.OVERDUE);
          setStats(prev => ({
             ...prev,
             myActiveLoans: active.length,
             overdueCount: active.filter(a => a.status === BorrowStatus.OVERDUE).length
          }));
        }
        
        setRecentBooks(books.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdminOrLibrarian]);

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading dashboard...</div>;

  const StatCard = ({ title, value, icon, gradient }: any) => (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-full blur-xl transform translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500`}></div>
      <div className="flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">{icon}</span>
        </div>
        <dd className="text-4xl font-display font-bold text-gray-900 mb-1">{value}</dd>
        <dt className="text-sm font-medium text-gray-500">{title}</dt>
      </div>
    </div>
  );

  const QuickLink = ({ to, label, icon }: any) => (
      <Link to={to} className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all group">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 text-[#D81814] flex items-center justify-center text-xl group-hover:bg-[#FF3A2F] group-hover:text-white transition-colors">
                  {icon}
              </div>
              <span className="font-bold text-gray-900">{label}</span>
          </div>
          <span className="text-gray-300 group-hover:text-[#FF3A2F]">→</span>
      </Link>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                {user.role === UserRole.ADMIN ? 'Admin Dashboard' : 
                 user.role === UserRole.LIBRARIAN ? 'Librarian Dashboard' : 
                 `Welcome, ${user.name}`}
            </h1>
            <p className="text-gray-500 font-medium">Overview of library activities.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isAdminOrLibrarian ? (
          <>
            <StatCard title="Total Books" value={stats.totalBooks} icon="📚" gradient="bg-blue-500" />
            <StatCard title="Total Members" value={stats.totalMembers} icon="👥" gradient="bg-purple-500" />
            <StatCard title="Active Loans" value={stats.activeLoans} icon="🔄" gradient="bg-green-500" />
            <StatCard title="Overdue Items" value={stats.overdueCount} icon="⚠️" gradient="bg-red-500" />
          </>
        ) : (
          <>
            <StatCard title="My Loans" value={stats.myActiveLoans} icon="📖" gradient="bg-blue-500" />
            <StatCard title="Overdue Items" value={stats.overdueCount} icon="⚠️" gradient="bg-red-500" />
             <div className="sm:col-span-2 brand-gradient rounded-[24px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                     <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
                </div>
                <h3 className="text-2xl font-display font-bold relative z-10 mb-2">Find Your Next Read</h3>
                <Link to="/books" className="inline-block w-fit bg-white text-[#D81814] px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 mt-4">
                    Explore Catalog
                </Link>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions for Admin/Librarian */}
      {isAdminOrLibrarian && (
          <div>
              <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <QuickLink to="/issue-book" label="Issue Book" icon="📤" />
                  <QuickLink to="/active-loans" label="Return Book" icon="📥" />
                  {user.role === UserRole.ADMIN && (
                      <QuickLink to="/members" label="Manage Members" icon="👥" />
                  )}
                  <QuickLink to="/manage-books" label="Manage Inventory" icon="📚" />
              </div>
          </div>
      )}

      {/* Recent Books Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-xl font-display font-bold text-gray-900">Recently Added</h3>
          <Link to="/books" className="text-sm font-bold text-[#D81814] hover:text-[#FF3A2F] flex items-center gap-1 transition-colors">
            View full catalog <span className="text-lg">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentBooks.map((book) => (
            <div key={book.id} className="group cursor-pointer">
              <div className="aspect-[2/3] w-full rounded-2xl bg-gray-200 overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-300 relative">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-bold">{book.category}</span>
                  </div>
              </div>
              <h4 className="font-display font-bold text-gray-900 truncate">{book.title}</h4>
              <p className="text-sm text-gray-500 truncate">{book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;