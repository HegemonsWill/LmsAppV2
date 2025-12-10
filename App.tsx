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
import Settings from './pages/Settings';
import TwoFactorSetup from './pages/TwoFactorSetup';
import IssueBook from './pages/IssueBook';
import ActiveLoans from './pages/ActiveLoans';
import MembersList from './pages/MembersList';
import BookRequests from './pages/BookRequests';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

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
    const checkAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">Loading...</div>;

  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              !user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />
            } />
            
            <Route path="/setup-2fa" element={
               user ? (
                 <TwoFactorSetup user={user} onUpdateUser={handleUserUpdate} />
               ) : (
                 <Navigate to="/login" replace />
               )
            } />

            <Route path="*" element={
              !user ? (
                <Navigate to="/login" replace />
              ) : (
                <Layout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute user={user}>
                        <Dashboard user={user} />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/books" element={
                      <ProtectedRoute user={user}>
                        <BookList user={user} />
                      </ProtectedRoute>
                    } />

                    <Route path="/issue-book" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                        <IssueBook />
                      </ProtectedRoute>
                    } />

                    <Route path="/active-loans" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                        <ActiveLoans />
                      </ProtectedRoute>
                    } />

                    <Route path="/requests" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                        <BookRequests />
                      </ProtectedRoute>
                    } />

                    <Route path="/manage-books" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                        <ManageBooks />
                      </ProtectedRoute>
                    } />

                    <Route path="/members" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
                        <MembersList />
                      </ProtectedRoute>
                    } />

                    <Route path="/my-books" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.USER]}>
                        <MyBooks user={user} />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute user={user}>
                        <Settings user={user} onUpdateUser={handleUserUpdate} />
                      </ProtectedRoute>
                    } />

                     <Route path="/reservations" element={
                      <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]}>
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded">Feature coming soon: Reservation Management Interface</div>
                      </ProtectedRoute>
                    } />
                    
                  </Routes>
                </Layout>
              )
            } />
          </Routes>
        </Router>
      </NotificationProvider>
    </ToastProvider>
  );
};

export default App;