import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { authService } from './services/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import ManageBooks from './pages/ManageBooks';
import MyBooks from './pages/MyBooks';

// Protected Route Wrapper
type ProtectedRouteProps = {
  user: User | null;
  allowedRoles?: UserRole[];
};

const ProtectedRoute = ({ 
  user, 
  allowedRoles, 
  children 
}: React.PropsWithChildren<ProtectedRouteProps>) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="*" element={
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user!} />
                </ProtectedRoute>
              } />
              
              {/* Book Catalog (Accessible to all authenticated) */}
              <Route path="/books" element={
                <ProtectedRoute user={user}>
                  <BookList user={user!} />
                </ProtectedRoute>
              } />

              {/* Admin/Librarian Routes */}
              <Route path="/manage-books" element={
                <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                  <ManageBooks />
                </ProtectedRoute>
              } />

              {/* User Routes */}
              <Route path="/my-books" element={
                <ProtectedRoute user={user} allowedRoles={[UserRole.USER]}>
                  <MyBooks user={user!} />
                </ProtectedRoute>
              } />
              
               <Route path="/reservations" element={
                <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded">Feature coming soon: Reservation Management Interface</div>
                </ProtectedRoute>
              } />

               <Route path="/active-loans" element={
                <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                  <div className="p-4 bg-blue-50 text-blue-800 rounded">Feature coming soon: Global Active Loan Monitoring</div>
                </ProtectedRoute>
              } />
              
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;