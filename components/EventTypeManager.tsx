import React, { useState } from 'react';

interface EventTypeManagerProps {
    eventTypes: string[];
    onAdd: (newType: string) => void;
    onUpdate: (oldType: string, newType: string) => void;
    onDelete: (typeToDelete: string) => void;
}

const EventTypeManager: React.FC<EventTypeManagerProps> = ({ eventTypes, onAdd, onUpdate, onDelete }) => {
    const [newType, setNewType] = useState('');
    const [editingType, setEditingType] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        const trimmedType = newType.trim();
        if (!trimmedType) {
             setError('اسم النوع لا يمكن أن يكون فارغًا.');
             return;
        }
        if (eventTypes.includes(trimmedType)) {
            setError('هذا النوع موجود بالفعل.');
            return;
        }
        setError('');
        onAdd(trimmedType);
        setNewType('');
    };
    
    const handleStartEdit = (type: string) => {
        setEditingType(type);
        setEditingValue(type);
        setError('');
    };
    
    const handleCancelEdit = () => {
        setEditingType(null);
        setEditingValue('');
        setError('');
    };
    
    const handleSaveEdit = () => {
        const trimmedValue = editingValue.trim();
        if (!editingType) return;
        if (!trimmedValue) {
             setError('اسم النوع لا يمكن أن يكون فارغًا.');
             return;
        }
        if (trimmedValue !== editingType && eventTypes.includes(trimmedValue)) {
            setError('هذا النوع موجود بالفعل.');
            return;
        }
        setError('');
        onUpdate(editingType, trimmedValue);
        handleCancelEdit();
    };

    const handleDelete = (type: string) => {
        if (window.confirm(`هل أنت متأكد من حذف النوع "${type}"؟ سيتم إزالته من جميع الفعاليات الحالية.`)) {
            if (window.confirm(`تأكيد نهائي: هل تريد حقًا حذف "${type}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                onDelete(type);
            }
        }
    }

    return (
         <div className="mt-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">إدارة أنواع الفعاليات</h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex gap-2 mb-6 items-start">
                    <div className="flex-grow">
                        <input
                            type="text"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            placeholder="أضف نوع فعالية جديد"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            aria-label="اسم نوع الفعالية الجديد"
                        />
                         {error && !editingType && <p className="text-sm text-rose-500 mt-1">{error}</p>}
                    </div>
                    <button onClick={handleAdd} className="px-5 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all">إضافة</button>
                </div>

                <ul className="space-y-2">
                    {eventTypes.map(type => (
                        <li key={type} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            {editingType === type ? (
                                <div className="flex-grow">
                                    <input 
                                        type="text"
                                        value={editingValue}
                                        onChange={e => setEditingValue(e.target.value)}
                                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        aria-label={`تعديل اسم النوع: ${type}`}
                                    />
                                     {error && editingType === type && <p className="text-sm text-rose-500 mt-1">{error}</p>}
                                </div>
                            ) : (
                                <span className="text-slate-700 dark:text-slate-300">{type}</span>
                            )}
                            <div className="flex gap-2 rtl:mr-2 ltr:ml-2 flex-shrink-0">
                                {editingType === type ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">حفظ</button>
                                        <button onClick={handleCancelEdit} className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">إلغاء</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleStartEdit(type)} className="px-3 py-1 text-xs font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600">تعديل</button>
                                        <button onClick={() => handleDelete(type)} className="px-3 py-1 text-xs font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600">حذف</button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default EventTypeManager;