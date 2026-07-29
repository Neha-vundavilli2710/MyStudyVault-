import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className="toast-slide-in flex items-center gap-2.5 bg-white border-l-4 rounded-lg shadow-lg px-4 py-3 text-sm cursor-pointer max-w-xs"
            style={{ borderColor: t.type === 'error' ? '#C7576B' : '#3F7D5C' }}
          >
            <span style={{ color: t.type === 'error' ? '#C7576B' : '#3F7D5C', fontSize: '16px' }}>
              {t.type === 'error' ? '\u26A0' : '\u2713'}
            </span>
            <span className="text-ink">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);