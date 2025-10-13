import React, { useState } from 'react';
import type { Supervisor } from '../types';

interface AddClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClub: (name: string, president: string, supervisorId: number) => void;
  supervisors: Supervisor[];
}

const AddClubModal: React.FC<AddClubModalProps> = ({ isOpen, onClose, onAddClub, supervisors }) => {
  const [name, setName] = useState('');
  const [president, setPresident] = useState('');
  const [supervisorId, setSupervisorId] = useState<number | ''>(supervisors[0]?.id || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !president.trim() || !supervisorId) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    setError('');
    onAddClub(name, president, supervisorId);
    setName('');
    setPresident('');
    setSupervisorId(supervisors[0]?.id || '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">تسجيل نادي جديد</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="clubName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم النادي</label>
              <input
                type="text"
                id="clubName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label htmlFor="presidentName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم رئيس النادي</label>
              <input
                type="text"
                id="presidentName"
                value={president}
                onChange={(e) => setPresident(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label htmlFor="supervisor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المشرف المسؤول</label>
              <select
                id="supervisor"
                value={supervisorId}
                onChange={(e) => setSupervisorId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              >
                {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              إلغاء
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
              تسجيل النادي
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClubModal;
