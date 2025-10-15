import React, { useState } from 'react';
import type { User } from '../types';

interface ProfileSettingsProps {
    user: User;
    onDeleteAccount: (userId: number) => void;
    onUpdateProfile: (userId: number, updatedData: Partial<Omit<User, 'id' | 'role'>> & { clubName?: string }) => string | null;
    clubName?: string; // Optional club name for presidents
    supervisorName?: string;
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


const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onDeleteAccount, onUpdateProfile, clubName, supervisorName }) => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        confirmPassword: '',
        clubName: clubName || '',
    });
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '',
            confirmPassword: '',
            clubName: clubName || '',
        });
        setError('');
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setError('');
    };

    const handleSaveClick = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
            return;
        }

        const { confirmPassword, ...updatePayload } = formData;
        
        if (!updatePayload.password.trim()) {
            delete (updatePayload as Partial<typeof updatePayload>).password;
        }
        
        onUpdateProfile(user.id, updatePayload);
        setIsEditing(false);
        setError('');
    };
    
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
                    {isEditing ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="profileName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
                                    <input type="text" id="profileName" name="name" value={formData.name} onChange={handleInputChange} className="w-full form-input" required />
                                </div>
                                <div>
                                    <label htmlFor="profileUsername" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
                                    <input type="text" id="profileUsername" name="username" value={formData.username} onChange={handleInputChange} className="w-full form-input" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="profileEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                                <input type="email" id="profileEmail" name="email" value={formData.email} onChange={handleInputChange} className="w-full form-input" required />
                            </div>
                            {user.role === 'PRESIDENT' && (
                                <div>
                                    <label htmlFor="profileClubName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم النادي</label>
                                    <input type="text" id="profileClubName" name="clubName" value={formData.clubName} onChange={handleInputChange} className="w-full form-input" required />
                                </div>
                            )}
                            <p className="text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">لتغيير كلمة المرور، أدخل كلمة مرور جديدة أدناه. اترك الحقول فارغة للحفاظ على كلمة المرور الحالية.</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="profilePassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور الجديدة</label>
                                    <input type="password" id="profilePassword" name="password" value={formData.password} onChange={handleInputChange} className="w-full form-input" />
                                </div>
                                <div>
                                    <label htmlFor="profileConfirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">تأكيد كلمة المرور الجديدة</label>
                                    <input type="password" id="profileConfirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full form-input" />
                                </div>
                            </div>
                            {error && <p className="text-sm text-rose-500">{error}</p>}
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={handleCancelClick} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">إلغاء</button>
                                <button onClick={handleSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700">حفظ التغييرات</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                             <div className="space-y-1">
                                <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">اسم المستخدم: {user.username}</p>
                                {user.role === 'PRESIDENT' && clubName && <p className="text-sm text-slate-500 dark:text-slate-400">النادي: {clubName}</p>}
                                {user.role === 'PRESIDENT' && supervisorName && <p className="text-sm text-slate-500 dark:text-slate-400">المشرف: {supervisorName}</p>}
                            </div>
                            <div className="flex gap-2 mt-4 sm:mt-0 flex-shrink-0">
                                <button 
                                    onClick={handleEditClick}
                                    className="px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-colors"
                                >
                                    تعديل
                                </button>
                                <button 
                                    onClick={handleDeleteClick}
                                    className="px-4 py-2 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/60 transition-all flex items-center gap-2"
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                    حذف الحساب
                                </button>
                            </div>
                        </div>
                    )}
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
            <style>{`.form-input { all: unset; box-sizing: border-box; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 1px solid; } .dark .form-input { border-color: #4b5563; background-color: #374151; } .form-input { border-color: #d1d5db; background-color: #ffffff; } .form-input:focus { outline: 2px solid #0ea5e9; outline-offset: 2px; }`}</style>

        </>
    );
};

export default ProfileSettings;
