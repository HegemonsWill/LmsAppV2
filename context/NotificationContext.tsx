import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { bookRequestService } from '../services/api';
import { BookRequest, RequestStatus } from '../types';

interface NotificationContextType {
  pendingCount: number;
  recentRequests: BookRequest[];
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [recentRequests, setRecentRequests] = useState<BookRequest[]>([]);

  const refreshNotifications = async () => {
    try {
      const allRequests = await bookRequestService.getAll();
      const pending = allRequests.filter(r => r.status === RequestStatus.PENDING);
      setPendingCount(pending.length);
      setRecentRequests(pending.slice(0, 5));
    } catch (e) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    refreshNotifications();
    // Simulate real-time subscription with polling
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ pendingCount, recentRequests, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};