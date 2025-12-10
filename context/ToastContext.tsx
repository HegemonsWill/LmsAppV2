import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto transform transition-all duration-300 ease-in-out
              min-w-[300px] p-4 rounded-2xl shadow-xl flex items-center gap-3
              ${toast.type === 'success' ? 'bg-white text-green-700 border border-green-100' : ''}
              ${toast.type === 'error' ? 'bg-white text-red-600 border border-red-100' : ''}
              ${toast.type === 'info' ? 'bg-white text-gray-700 border border-gray-100' : ''}
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold
              ${toast.type === 'success' ? 'bg-green-100' : ''}
              ${toast.type === 'error' ? 'bg-red-100' : ''}
              ${toast.type === 'info' ? 'bg-gray-100' : ''}
            `}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '!'}
              {toast.type === 'info' && 'i'}
            </div>
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};