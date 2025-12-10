import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { pendingCount, recentRequests } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequestClick = () => {
    setIsOpen(false);
    navigate('/requests');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full brand-gradient text-[10px] font-bold text-white shadow-md">
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Book Requests</span>
             {pendingCount > 0 && <span className="text-xs font-bold text-[#D81814]">{pendingCount} Pending</span>}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
             {recentRequests.length === 0 ? (
                 <div className="p-8 text-center text-gray-400 text-sm">No pending requests</div>
             ) : (
                 recentRequests.map(req => (
                     <div 
                        key={req.id} 
                        onClick={handleRequestClick}
                        className="p-4 border-b border-gray-50 hover:bg-red-50/30 cursor-pointer transition-colors flex gap-3"
                     >
                        <img src={req.bookCoverUrl} className="w-10 h-14 object-cover rounded shadow-sm bg-gray-200" alt="" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{req.bookTitle}</p>
                            <p className="text-xs text-gray-500 truncate">By {req.userName}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(req.requestedAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                 ))
             )}
          </div>
          <div className="p-3 bg-gray-50 text-center">
             <button onClick={handleRequestClick} className="text-xs font-bold text-[#D81814] hover:underline">
                 View All Requests
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;