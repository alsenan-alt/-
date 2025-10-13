import React, { useState, useEffect } from 'react';
import type { Club, Event, UserRole, EventType, EventStatus } from '../types';
import { EVENT_STATUSES } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club;
  monthName: string;
  events: Event[];
  userRole: UserRole;
  eventTypes: string[];
  onUpdateEvent?: (clubId: number, event: Event) => void;
  onDeleteEvent?: (clubId: number, eventId: string) => void;
}

const EventForm: React.FC<{
  clubId: number;
  monthName: string;
  onUpdateEvent: NonNullable<EventModalProps['onUpdateEvent']>;
  onDeleteEvent: NonNullable<EventModalProps['onDeleteEvent']>;
  onCancel: () => void;
  existingEvent: Event | null;
  eventTypes: string[];
}> = ({ clubId, monthName, onUpdateEvent, onDeleteEvent, onCancel, existingEvent, eventTypes }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [attendees, setAttendees] = useState<number | ''>('');
    const [category, setCategory] = useState<EventType | ''>('');
    const [status, setStatus] = useState<EventStatus>('مخططة');
    const [error, setError] = useState('');
    
    useEffect(() => {
        if(existingEvent) {
            setName(existingEvent.name);
            setDate(existingEvent.date.toISOString().split('T')[0]);
            setDescription(existingEvent.description);
            setSummary(existingEvent.summary);
            setAttendees(existingEvent.attendees);
            setCategory(existingEvent.category || '');
            setStatus(existingEvent.status || 'مخططة');
        } else {
            setName('');
            setDate('');
            setDescription('');
            setSummary('');
            setAttendees('');
            setCategory('');
            setStatus('مخططة');
        }
    }, [existingEvent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim() || !date || attendees === '' || !category || !status) {
            setError('يرجى إكمال جميع الحقول الإلزامية، بما في ذلك نوع الفعالية والحالة.');
            return;
        }
        setError('');
        const eventData: Event = {
            id: existingEvent?.id || crypto.randomUUID(),
            name,
            date: new Date(date),
            description,
            summary,
            attendees: Number(attendees),
            category,
            status,
        };
        onUpdateEvent(clubId, eventData);
        onCancel();
    };

    const handleDelete = () => {
        if (!existingEvent) return;

        const isConfirmed = window.confirm("هل أنت متأكد من رغبتك في حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.");
        if (isConfirmed) {
            const isSure = window.confirm("تأكيد نهائي: سيتم حذف الفعالية بشكل دائم. هل تريد المتابعة؟");
            if (isSure) {
                onDeleteEvent(clubId, existingEvent.id);
                onCancel(); 
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg mt-4 animate-fade-in">
            <h3 className="font-bold mb-3 text-slate-800 dark:text-slate-200">{existingEvent ? 'تعديل فعالية' : `إضافة فعالية جديدة لشهر ${monthName}`}</h3>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="eventName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم الفعالية</label>
                    <input type="text" id="eventName" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                        <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">تاريخ الفعالية</label>
                        <input type="date" id="eventDate" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="eventAttendees" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">عدد الحضور</label>
                        <input type="number" id="eventAttendees" value={attendees} onChange={e => setAttendees(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                    </div>
                    <div className="sm:col-span-1">
                         <label htmlFor="eventStatus" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">حالة الفعالية</label>
                         <select
                            id="eventStatus"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as EventStatus)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            required
                        >
                            {EVENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع الفعالية</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 p-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg">
                        {eventTypes.map(type => (
                            <label key={type} className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                                <input
                                    type="radio"
                                    name="eventType"
                                    value={type}
                                    checked={category === type}
                                    onChange={(e) => setCategory(e.target.value as EventType)}
                                    className="h-4 w-4 border-slate-400 text-sky-600 focus:ring-sky-500"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="eventDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
                    <textarea id="eventDescription" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                </div>
                 <div>
                    <label htmlFor="eventSummary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ملخص ما بعد الفعالية</label>
                    <textarea id="eventSummary" value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                </div>
                {error && <p className="text-sm text-rose-500">{error}</p>}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                     {existingEvent && (
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-700 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                        >
                            حذف الفعالية
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700">{existingEvent ? 'حفظ التعديلات' : 'حفظ الفعالية'}</button>
                </div>
            </div>
        </form>
    );
}

const getStatusColor = (status: EventStatus) => {
    switch (status) {
        case 'مخططة': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-200';
        case 'جارية': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200';
        case 'مكتملة': return 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200';
        case 'ملغاة': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200';
        default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/70 dark:text-slate-200';
    }
};

const EventItem: React.FC<{event: Event, onEdit: (event: Event) => void, userRole: UserRole}> = ({ event, onEdit, userRole }) => {
    return (
        <li className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{event.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                    </span>
                    {userRole === 'PRESIDENT' && (
                        <button onClick={() => onEdit(event)} className="text-xs px-3 py-1 bg-slate-200 dark:bg-slate-600 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500">تعديل</button>
                    )}
                </div>
            </div>
             {event.category && (
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-200 rounded-full">
                        {event.category}
                    </span>
                </div>
            )}
            {event.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 border-r-2 border-sky-500 pr-3">{event.description}</p>}
            {event.summary && <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600"><strong className="font-semibold">ملخص:</strong> {event.summary}</p>}
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium"><strong>عدد الحضور:</strong> {event.attendees}</p>
        </li>
    );
};


const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, club, monthName, events, onUpdateEvent, onDeleteEvent, userRole, eventTypes }) => {
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  if (!isOpen) return null;
  
  const handleClose = () => {
    setView('LIST');
    setSelectedEvent(null);
    onClose();
  }

  const handleEditEvent = (event: Event) => {
      setSelectedEvent(event);
      setView('FORM');
  }

  const handleAddNew = () => {
      setSelectedEvent(null);
      setView('FORM');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">فعاليات شهر {monthName}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{club.name}</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {view === 'FORM' && onUpdateEvent && onDeleteEvent ? (
             <EventForm 
                clubId={club.id} 
                monthName={monthName} 
                onUpdateEvent={onUpdateEvent} 
                onDeleteEvent={onDeleteEvent}
                onCancel={() => setView('LIST')}
                existingEvent={selectedEvent}
                eventTypes={eventTypes}
            />
          ) : (
            <>
              {events.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">لا توجد فعاليات مجدولة لهذا الشهر.</p>
                </div>
              )}
              {events.length > 0 && (
                <ul className="space-y-4">
                  {events.map(event => (
                    <EventItem key={event.id} event={event} onEdit={handleEditEvent} userRole={userRole} />
                  ))}
                </ul>
              )}
              {userRole === 'PRESIDENT' && (
                <div className="mt-6">
                    <button 
                        onClick={handleAddNew}
                        className="w-full px-5 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all flex items-center justify-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        إضافة فعالية جديدة
                    </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default EventModal;