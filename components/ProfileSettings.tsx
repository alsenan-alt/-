import React, { useState } from 'react';
import type { User } from '../types';

interface ProfileSettingsProps {
    user: User;
    onDeleteAccount: (userId: number) => void;
    clubName?: string; // Optional club name for presidents
}

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-0 text-start">
              <h3 className="text-lg leading-6 font-bold text-slate-900 dark:text-slate-100" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
};


const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onDeleteAccount, clubName }) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    const handleDeleteClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        onDeleteAccount(user.id);
        setIsConfirmModalOpen(false);
    };

    const getConfirmationMessage = () => {
        if (user.role === 'SUPERVISOR') {
            return (
                <p>
                    سيتم حذف حسابك بشكل دائم. ستفقد الوصول إلى لوحة التحكم وجميع بيانات الأندية التي تشرف عليها. <strong>لا يمكن التراجع عن هذا الإجراء.</strong>
                </p>
            );
        }
        if (user.role === 'PRESIDENT') {
            return (
                 <p>
                    سيتم حذف حسابك بشكل دائم. سيبقى نادي <strong>"{clubName || 'ناديك'}"</strong> موجودًا ولكن بدون رئيس معين حتى يتم تعيين رئيس جديد من قبل المشرف. <strong>لا يمكن التراجع عن هذا الإجراء.</strong>
                </p>
            );
        }
        return <p>هل أنت متأكد من رغبتك في حذف حسابك؟</p>
    };

    return (
        <>
            <div className="mt-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">إعدادات الحساب</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        <button 
                            onClick={handleDeleteClick}
                            className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all flex items-center gap-2"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                            حذف الحساب
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد حذف الحساب"
            >
                {getConfirmationMessage()}
            </ConfirmationModal>
        </>
    );
};

export default ProfileSettings;