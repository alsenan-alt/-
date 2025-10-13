import React, { useState } from 'react';
import type { Supervisor, User } from '../types';

interface LoginPageProps {
    onLogin: (username: string, password: string) => string | null;
    onRegister: (userData: Omit<User, 'id'> & { clubName?: string, supervisorId?: number }) => string | null;
    onForgotPassword: (email: string) => string | null;
    supervisors: Supervisor[];
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-full py-3 text-center font-bold transition-all duration-300 ${active ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
    >
        {children}
    </button>
);

const AuthForm: React.FC<LoginPageProps & { role: 'SUPERVISOR' | 'PRESIDENT'}> = ({ onLogin, onRegister, onForgotPassword, supervisors, role }) => {
    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
    
    // Form fields
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clubName, setClubName] = useState('');
    const [supervisorId, setSupervisorId] = useState<number | ''>(supervisors[0]?.id || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearFormState = () => {
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setClubName('');
        setSupervisorId(supervisors[0]?.id || '');
        setError('');
        setSuccess('');
    };

    const handleViewChange = (newView: 'login' | 'register' | 'forgot') => {
        setView(newView);
        clearFormState();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (view === 'login') {
            if (!username || !password) {
                setError('يرجى إدخال اسم المستخدم وكلمة المرور.');
                return;
            }
            const loginError = onLogin(username, password);
            if (loginError) {
                setError(loginError);
            }
        } else if (view === 'register') {
            if (role === 'PRESIDENT' && (!clubName || !supervisorId)) {
                setError('يرجى إكمال جميع بيانات النادي.');
                return;
            }
             if (!name || !username || !email || !password) {
                setError('يرجى ملء جميع الحقول.');
                return;
            }
            const registerError = onRegister({ name, username, email, password, role, clubName, supervisorId: Number(supervisorId) });
            if (registerError) {
                setError(registerError);
            }
        } else if (view === 'forgot') {
            if (!email) {
                setError('يرجى إدخال بريدك الإلكتروني.');
                return;
            }
            const forgotError = onForgotPassword(email);
            if (forgotError) {
                setError(forgotError);
            } else {
                setSuccess('تم إرسال تعليمات استعادة كلمة المرور بنجاح.');
            }
        }
    };

    const getButtonText = () => {
        if (view === 'login') return 'تسجيل الدخول';
        if (view === 'register') return 'إنشاء حساب';
        return 'إرسال رابط الاستعادة';
    };

    return (
         <div className="bg-white dark:bg-slate-800 p-8 rounded-b-xl shadow-lg flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'forgot' ? (
                     <div>
                        <h3 className="text-xl font-bold mb-2 text-center text-slate-800 dark:text-slate-200">استعادة كلمة المرور</h3>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">أدخل بريدك الإلكتروني المسجل.</p>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full input-field" />
                    </div>
                ) : (
                    <>
                        {view === 'register' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required={view === 'register'} className="w-full input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required={view === 'register'} className="w-full input-field" />
                                </div>
                            </>
                        )}
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
                           <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full input-field" />
                       </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور</label>
                           <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full input-field" />
                       </div>
                       {view === 'register' && role === 'PRESIDENT' && (
                           <>
                                <div>
                                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم النادي</label>
                                   <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} required className="w-full input-field" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المشرف المسؤول</label>
                                   <select value={supervisorId} onChange={e => setSupervisorId(Number(e.target.value))} required className="w-full input-field">
                                       {supervisors.length > 0 ? (
                                           supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                       ) : (
                                           <option disabled>لا يوجد مشرفون مسجلون بعد</option>
                                       )}
                                   </select>
                               </div>
                           </>
                       )}
                    </>
                )}
                 
                 {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
                 {success && <p className="text-sm text-green-600 mt-2">{success}</p>}

                <button type="submit" className="w-full mt-6 px-5 py-3 text-base font-medium text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all">
                    {getButtonText()}
                </button>
            </form>
            <div className="mt-6 text-center space-y-2">
                {view === 'login' && (
                    <button onClick={() => handleViewChange('register')} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
                        لا تملك حسابًا؟ أنشئ حسابًا جديدًا
                    </button>
                )}
                {view === 'register' && (
                    <button onClick={() => handleViewChange('login')} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
                        لديك حساب بالفعل؟ سجل الدخول
                    </button>
                )}
                {view !== 'forgot' ? (
                     <button onClick={() => handleViewChange('forgot')} className="block w-full text-sm text-slate-500 dark:text-slate-400 hover:underline mt-2">
                        نسيت كلمة المرور؟
                    </button>
                ) : (
                     <button onClick={() => handleViewChange('login')} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
                        العودة إلى تسجيل الدخول
                    </button>
                )}
            </div>
         </div>
    );
}


const LoginPage: React.FC<LoginPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'supervisor' | 'president'>('supervisor');

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="flex">
                <TabButton active={activeTab === 'supervisor'} onClick={() => setActiveTab('supervisor')}>
                    المشرفين
                </TabButton>
                <TabButton active={activeTab === 'president'} onClick={() => setActiveTab('president')}>
                    رؤساء الأندية
                </TabButton>
            </div>
            
            <style>{`.input-field { all: unset; box-sizing: border-box; width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid; } .dark .input-field { border-color: #4b5563; background-color: #374151; } .input-field { border-color: #d1d5db; background-color: #ffffff; } .input-field:focus { outline: 2px solid #0ea5e9; outline-offset: 2px; }`}</style>
            
            {activeTab === 'supervisor' && <AuthForm {...props} role="SUPERVISOR" />}
            {activeTab === 'president' && <AuthForm {...props} role="PRESIDENT" />}
        </div>
    );
};

export default LoginPage;