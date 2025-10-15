import React, { useState, useMemo } from 'react';
import type { Club, Event, Supervisor, User, EventType } from '../types';
import { ARABIC_MONTHS } from '../constants';
import { generateReminder } from '../services/geminiService';
import EventModal from './EventModal';
import NotificationModal from './NotificationModal';
import EventTypeManager from './EventTypeManager';
import ProfileSettings from './ProfileSettings';

interface DashboardProps {
    user: User;
    allClubs: Club[];
    supervisors: Supervisor[];
    onUpdateEvent: (clubId: number, event: Event) => void;
    onDeleteEvent: (clubId: number, eventId: string) => void;
    onDeleteAccount: (userId: number) => void;
    onUpdateProfile: (userId: number, updatedData: Partial<Omit<User, 'id' | 'role'>> & { clubName?: string }) => string | null;
    eventTypes: string[];
    onAddEventType: (newType: string) => void;
    onUpdateEventType: (oldType: string, newType: string) => void;
    onDeleteEventType: (typeToDelete: string) => void;
}

const SupervisorDashboard: React.FC<Omit<DashboardProps, 'onUpdateEvent' | 'onDeleteEvent'>> = ({ 
    user, 
    allClubs, 
    onDeleteAccount,
    onUpdateProfile,
    eventTypes, 
    onAddEventType,
    onUpdateEventType,
    onDeleteEventType,
}) => {
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [notificationClub, setNotificationClub] = useState<Club | null>(null);
    const [alertThreshold, setAlertThreshold] = useState<number>(2);

    const supervisedClubs = useMemo(() => {
        return allClubs.filter(club => club.supervisorId === user.id);
    }, [allClubs, user.id]);

    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const eventsByClubAndMonth = useMemo(() => {
        const map = new Map<string, Event[]>();
        supervisedClubs.forEach(club => {
            for (let i = 0; i < 12; i++) {
                const key = `${club.id}-${i}`;
                const monthlyEvents = club.events.filter(event => 
                    event.date.getMonth() === i && event.date.getFullYear() === currentYear
                );
                map.set(key, monthlyEvents);
            }
        });
        return map;
    }, [supervisedClubs, currentYear]);

     const annualStats = useMemo(() => {
        return supervisedClubs.map(club => {
            const counts = eventTypes.reduce((acc, type) => {
                acc[type] = 0;
                return acc;
            }, {} as Record<EventType, number>);

            const eventsThisYear = club.events.filter(event => event.date.getFullYear() === currentYear);

            eventsThisYear.forEach(event => {
                const category = event.category;
                if (category && counts.hasOwnProperty(category)) {
                    counts[category]++;
                }
            });

            return {
                clubId: club.id,
                clubName: club.name,
                counts,
                totalEvents: eventsThisYear.length,
            };
        });
    }, [supervisedClubs, currentYear, eventTypes]);


    const handleCellClick = (club: Club, monthIndex: number) => {
        setSelectedClub(club);
        setSelectedMonth(monthIndex);
        setIsEventModalOpen(true);
    };
    
    const handleGenerateNotification = async (club: Club) => {
        setNotificationClub(club);
        setIsNotificationModalOpen(true);
        setIsGenerating(true);
        setGeneratedMessage('');
        const message = await generateReminder(club.name, ARABIC_MONTHS[currentMonthIndex]);
        setGeneratedMessage(message);
        setIsGenerating(false);
    };

    const getActivityColor = (count: number): string => {
        if (count === 0) return 'bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-800/60';
        if (count >= 1 && count <= 2) return 'bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/60';
        return 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/60';
    };

    const handleExportCsv = () => {
        const headers = ['النادي', 'إجمالي الفعاليات', ...eventTypes];
        
        const rows = annualStats.map(stat => {
            // Escape quotes in club name
            const clubName = `"${stat.clubName.replace(/"/g, '""')}"`;
            const rowData = [
                clubName,
                stat.totalEvents,
                ...eventTypes.map(type => stat.counts[type] || 0)
            ];
            return rowData.join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        // Create Blob with BOM for UTF-8 support in Excel
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `statistics-${currentYear}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };


    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">الأندية تحت إشرافك</h2>
            
            <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
                <label htmlFor="alert-threshold" className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    الحد الأدنى للفعاليات الشهرية للتنبيه:
                </label>
                <input
                    type="number"
                    id="alert-threshold"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value) >= 1 ? Number(e.target.value) : 1)}
                    min="1"
                    className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-describedby="alert-threshold-description"
                />
                 <p id="alert-threshold-description" className="text-sm text-slate-500 dark:text-slate-400">
                    سيظهر زر التنبيه للأندية التي لديها أقل من هذا العدد في الشهر الحالي.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse text-sm text-center">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-start sticky start-0 bg-slate-50 dark:bg-slate-700/50">النادي</th>
                            {ARABIC_MONTHS.map((month, index) => (
                                <th key={month} className={`p-3 font-semibold text-slate-700 dark:text-slate-300 ${index === currentMonthIndex ? 'text-sky-600 dark:text-sky-400' : ''}`}>{month}</th>
                            ))}
                            <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">المجموع</th>
                            <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {supervisedClubs.map(club => {
                            const eventsInCurrentMonth = (eventsByClubAndMonth.get(`${club.id}-${currentMonthIndex}`) || []).length;
                            return (
                                <tr key={club.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100 text-start sticky start-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 whitespace-nowrap">{club.name}</td>
                                    {ARABIC_MONTHS.map((_, monthIndex) => {
                                        const events = eventsByClubAndMonth.get(`${club.id}-${monthIndex}`) || [];
                                        return (
                                            <td key={monthIndex}
                                                className={`p-3 tabular-nums font-mono transition-colors duration-200 cursor-pointer ${getActivityColor(events.length)}`}
                                                onClick={() => handleCellClick(club, monthIndex)}
                                            >
                                                {events.length}
                                            </td>
                                        );
                                    })}
                                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 tabular-nums text-lg">
                                        {club.events.filter(e => e.date.getFullYear() === currentYear).length}
                                    </td>
                                    <td className="p-3">
                                        {eventsInCurrentMonth < alertThreshold && (
                                            <button 
                                                onClick={() => handleGenerateNotification(club)}
                                                className="px-3 py-1 text-xs font-medium text-white bg-amber-500 rounded-full hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all disabled:opacity-50"
                                                disabled={isGenerating && notificationClub?.id === club.id}
                                            >
                                                {isGenerating && notificationClub?.id === club.id ? '...' : 'إرسال تنبيه'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <EventTypeManager 
                eventTypes={eventTypes}
                onAdd={onAddEventType}
                onUpdate={onUpdateEventType}
                onDelete={onDeleteEventType}
            />

            <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">الإحصائيات السنوية للفعاليات</h3>
                    <button
                        onClick={handleExportCsv}
                        className="px-4 py-2 text-sm font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all flex items-center gap-2"
                        aria-label="تصدير الإحصائيات السنوية كملف CSV"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                        تصدير CSV
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse text-sm text-center">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-3 font-semibold text-slate-700 dark:text-slate-300 text-start sticky start-0 bg-slate-50 dark:bg-slate-700/50">النادي</th>
                                <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">إجمالي الفعاليات</th>
                                {eventTypes.map(type => <th key={type} className="p-3 font-semibold text-slate-700 dark:text-slate-300">{type}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {annualStats.map(summary => (
                                <tr key={summary.clubId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100 text-start sticky start-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 whitespace-nowrap">{summary.clubName}</td>
                                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 tabular-nums text-lg">{summary.totalEvents}</td>
                                    {eventTypes.map(type => (
                                        <td key={type} className="p-3 tabular-nums font-mono">{summary.counts[type] || 0}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProfileSettings user={user} onDeleteAccount={onDeleteAccount} onUpdateProfile={onUpdateProfile} />

            {isEventModalOpen && selectedClub && selectedMonth !== null && (
                <EventModal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    club={selectedClub}
                    monthName={ARABIC_MONTHS[selectedMonth]}
                    events={eventsByClubAndMonth.get(`${selectedClub.id}-${selectedMonth}`) || []}
                    userRole="SUPERVISOR"
                    eventTypes={eventTypes}
                />
            )}
            {isNotificationModalOpen && notificationClub && (
                 <NotificationModal
                    isOpen={isNotificationModalOpen}
                    onClose={() => setIsNotificationModalOpen(false)}
                    clubName={notificationClub.name}
                    presidentName={notificationClub.president}
                    isLoading={isGenerating}
                    message={generatedMessage}
                 />
            )}
        </>
    );
};


const PresidentDashboard: React.FC<DashboardProps> = ({ user, allClubs, supervisors, onUpdateEvent, onDeleteEvent, onDeleteAccount, onUpdateProfile, eventTypes }) => {
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const myClub = useMemo(() => {
        return allClubs.find(club => club.id === user.clubId);
    }, [allClubs, user.clubId]);

    const supervisor = useMemo(() => {
        return supervisors.find(s => s.id === myClub?.supervisorId);
    }, [supervisors, myClub]);
    
    const currentYear = new Date().getFullYear();

    const eventsByMonth = useMemo(() => {
        const map = new Map<number, Event[]>();
        if (myClub) {
            for (let i = 0; i < 12; i++) {
                const monthlyEvents = myClub.events.filter(event => event.date.getMonth() === i && event.date.getFullYear() === currentYear);
                map.set(i, monthlyEvents);
            }
        }
        return map;
    }, [myClub, currentYear]);

    const upcomingEvents = useMemo(() => {
        if (!myClub) return [];
        const today = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(today.getDate() + 14);
        today.setHours(0, 0, 0, 0);

        return myClub.events
            .filter(event => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today && eventDate <= twoWeeksFromNow;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [myClub]);

    const handleCellClick = (monthIndex: number) => {
        setSelectedMonth(monthIndex);
        setIsEventModalOpen(true);
    };

    const getActivityColor = (count: number): string => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/60';
        if (count >= 1 && count <= 2) return 'bg-sky-100 dark:bg-sky-900/50 hover:bg-sky-200 dark:hover:bg-sky-800/60';
        return 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/60';
    };

    if (!myClub) {
        return <div className="text-center p-10">لم يتم العثور على بيانات النادي.</div>;
    }
    
    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{myClub.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">المشرف المسؤول: {supervisor?.name || 'غير محدد'}</p>
            </div>
            
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">الخطة الزمنية للفعاليات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {ARABIC_MONTHS.map((month, index) => {
                    const events = eventsByMonth.get(index) || [];
                    return (
                        <div key={index} 
                             className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${getActivityColor(events.length)}`}
                             onClick={() => handleCellClick(index)}
                        >
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{month}</h4>
                            <p className="text-2xl font-mono mt-2 text-slate-600 dark:text-slate-300">{events.length}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">فعالية</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">فعاليات قادمة (آخر أسبوعين)</h3>
                {upcomingEvents.length > 0 ? (
                    <ul className="space-y-3">
                        {upcomingEvents.map(event => (
                            <li key={event.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{event.name}</span>
                                <span className="text-sm text-sky-600 dark:text-sky-400 font-semibold">
                                    {event.date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">لا توجد فعاليات قادمة في الأسبوعين المقبلين.</p>
                )}
            </div>

            <ProfileSettings 
                user={user} 
                onDeleteAccount={onDeleteAccount}
                onUpdateProfile={onUpdateProfile}
                clubName={myClub.name}
                supervisorName={supervisor?.name}
            />

            {isEventModalOpen && selectedMonth !== null && (
                <EventModal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    club={myClub}
                    monthName={ARABIC_MONTHS[selectedMonth]}
                    monthIndex={selectedMonth}
                    year={currentYear}
                    events={eventsByMonth.get(selectedMonth) || []}
                    onUpdateEvent={onUpdateEvent}
                    onDeleteEvent={onDeleteEvent}
                    userRole="PRESIDENT"
                    eventTypes={eventTypes}
                />
            )}
        </>
    );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
    if (props.user.role === 'SUPERVISOR') {
        return <SupervisorDashboard {...props} />;
    }
    if (props.user.role === 'PRESIDENT') {
        return <PresidentDashboard {...props} />;
    }
    return null;
};

export default Dashboard;