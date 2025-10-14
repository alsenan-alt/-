import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import { INITIAL_EVENT_TYPES } from './constants';
import type { Club, Supervisor, User, Event } from './types';

// Custom hook to manage state in localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}


const App: React.FC = () => {
    const [users, setUsers] = useLocalStorage<User[]>('student_clubs_users', []);
    const [rawClubs, setRawClubs] = useLocalStorage<Club[]>('student_clubs_clubs', []);
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('student_clubs_currentUser', null);
    const [eventTypes, setEventTypes] = useLocalStorage<string[]>('student_clubs_eventTypes', INITIAL_EVENT_TYPES);

    // Rehydrate dates from strings to Date objects after loading from localStorage
    const clubs: Club[] = useMemo(() => {
        return rawClubs.map(club => ({
            ...club,
            events: club.events.map((event: any) => ({
                ...event,
                date: new Date(event.date),
            }))
        }));
    }, [rawClubs]);
    
    const setClubs = setRawClubs;

    const handleLogin = (username: string, password: string): string | null => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser(user);
            return null;
        }
        return 'اسم المستخدم أو كلمة المرور غير صحيحة.';
    };

    const handleRegister = (userData: Omit<User, 'id'> & { clubName?: string, supervisorId?: number }): string | null => {
        if (users.some(u => u.username === userData.username || u.email === userData.email)) {
            return 'اسم المستخدم أو البريد الإلكتروني مسجل بالفعل.';
        }

        const newUser: User = {
            ...userData,
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        };
        
        if (newUser.role === 'PRESIDENT') {
            if (!userData.clubName || userData.supervisorId === undefined) {
                return 'بيانات النادي غير مكتملة.';
            }
            const newClub: Club = {
                id: rawClubs.length > 0 ? Math.max(...rawClubs.map(c => c.id)) + 1 : 1,
                name: userData.clubName,
                president: newUser.name,
                supervisorId: userData.supervisorId,
                events: [],
            };
            setClubs(prev => [...prev, newClub]);
            newUser.clubId = newClub.id;
        }

        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        return null;
    };
    
    const handleForgotPassword = (email: string): string | null => {
        const user = users.find(u => u.email === email);
        if (user) {
            // In a real app, this would trigger an email.
            // For this demo, we use an alert to show it's working and what the password is.
            alert(`محاكاة إرسال البريد الإلكتروني:\n\nتم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}.\nلأغراض العرض التوضيحي، كلمة المرور الحالية هي: "${user.password}"`);
            return null; // indicates success
        }
        return 'لم يتم العثور على حساب بهذا البريد الإلكتروني.';
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleDeleteAccount = (userId: number) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        // If the user is a president, update their club to have a vacant president
        if (userToDelete.role === 'PRESIDENT' && userToDelete.clubId) {
            setClubs(prevClubs => prevClubs.map(club => {
                if (club.id === userToDelete.clubId) {
                    return { ...club, president: 'رئيس شاغر' };
                }
                return club;
            }));
        }

        // Remove the user
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

        // Log out the current user
        setCurrentUser(null);
    };

    const handleUpdateEvent = (clubId: number, eventToUpdate: Event) => {
         setClubs(prevClubs => prevClubs.map(club => {
            if (club.id === clubId) {
                const eventExists = club.events.some(e => e.id === eventToUpdate.id);
                let updatedEvents;
                if(eventExists) {
                    updatedEvents = club.events.map(e => e.id === eventToUpdate.id ? eventToUpdate : e);
                } else {
                    updatedEvents = [...club.events, eventToUpdate];
                }
                return { ...club, events: updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) };
            }
            return club;
        }));
    };

    const handleDeleteEvent = (clubId: number, eventId: string) => {
        setClubs(prevClubs => prevClubs.map(club => {
            if (club.id === clubId) {
                return { ...club, events: club.events.filter(e => e.id !== eventId) };
            }
            return club;
        }));
    };

    const handleAddEventType = (newType: string) => {
        if (newType && !eventTypes.includes(newType)) {
            setEventTypes(prev => [...prev, newType]);
        }
    };

    const handleUpdateEventType = (oldType: string, newType: string) => {
        setEventTypes(prev => prev.map(t => t === oldType ? newType : t));
        setClubs(prevClubs => prevClubs.map(club => ({
            ...club,
            events: club.events.map(event => event.category === oldType ? { ...event, category: newType } : event)
        })));
    };

    const handleDeleteEventType = (typeToDelete: string) => {
        setEventTypes(prev => prev.filter(t => t !== typeToDelete));
        setClubs(prevClubs => prevClubs.map(club => ({
            ...club,
            events: club.events.map(event => event.category === typeToDelete ? { ...event, category: '' } : event)
        })));
    };

    const supervisors: Supervisor[] = users
        .filter(user => user.role === 'SUPERVISOR')
        .map(({ id, name }) => ({ id, name }));

    return (
        <div className="min-h-screen">
            <Header user={currentUser} onLogout={handleLogout} />
            <main className="p-4 sm:p-6 lg:p-8">
                {!currentUser ? (
                    <LoginPage 
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        onForgotPassword={handleForgotPassword}
                        supervisors={supervisors}
                    />
                ) : (
                    <Dashboard
                        user={currentUser}
                        allClubs={clubs}
                        supervisors={supervisors}
                        onUpdateEvent={handleUpdateEvent}
                        onDeleteEvent={handleDeleteEvent}
                        onDeleteAccount={handleDeleteAccount}
                        eventTypes={eventTypes}
                        onAddEventType={handleAddEventType}
                        onUpdateEventType={handleUpdateEventType}
                        onDeleteEventType={handleDeleteEventType}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
