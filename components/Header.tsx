import React, { useRef } from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    onImportData: (file: File) => void;
    onExportData: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onImportData, onExportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
      // Reset file input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            لوحة متابعة أداء الأندية الطلابية
          </h1>
        </div>
        {user && (
            <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                    أهلاً بك، {user.name}
                </span>

                {user.role === 'SUPERVISOR' && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/json"
                      className="hidden"
                      aria-hidden="true"
                    />
                    <button
                      onClick={handleImportClick}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all flex items-center gap-2"
                      title="استيراد البيانات من ملف"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h10a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                      <span className="hidden sm:inline">استيراد</span>
                    </button>
                     <button
                      onClick={onExportData}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all flex items-center gap-2"
                      title="تصدير البيانات الحالية إلى ملف"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                       <span className="hidden sm:inline">تصدير</span>
                    </button>
                  </>
                )}

                <button
                    onClick={onLogout}
                    className="px-3 py-2 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all"
                >
                    تسجيل الخروج
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;