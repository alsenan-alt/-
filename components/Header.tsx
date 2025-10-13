import React from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
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
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    أهلاً بك، {user.name}
                </span>
                <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all"
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
