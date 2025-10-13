
import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  presidentName: string;
  isLoading: boolean;
  message: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, clubName, presidentName, isLoading, message }) => {
  
  if (!isOpen) return null;

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`تذكير بخصوص فعاليات نادي ${clubName}`);
    const body = encodeURIComponent(message);
    // Note: The 'to' field is left empty as we don't store president emails.
    // The user's default email client will open, allowing them to enter the recipient's address.
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">إنشاء تنبيه لنادي "{clubName}"</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
                <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-slate-600 dark:text-slate-400">...جاري إنشاء مسودة التنبيه باستخدام الذكاء الاصطناعي</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                تم إنشاء المسودة التالية لإرسالها إلى رئيس النادي ({presidentName}).
              </p>
              <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {message}
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSendEmail}
                  className="px-5 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  إرسال بريد إلكتروني
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;