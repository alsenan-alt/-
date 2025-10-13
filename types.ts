export type EventType = string;

export type EventStatus = 'مخططة' | 'جارية' | 'مكتملة' | 'ملغاة';
export const EVENT_STATUSES: readonly EventStatus[] = ['مخططة', 'جارية', 'مكتملة', 'ملغاة'];


export interface Event {
  id: string;
  name: string;
  date: Date;
  description: string;
  summary: string;
  attendees: number;
  category: EventType;
  status: EventStatus;
}

export interface Club {
  id: number;
  name:string;
  president: string;
  supervisorId: number;
  events: Event[];
}

export interface Supervisor {
    id: number;
    name: string;
}

export type UserRole = 'SUPERVISOR' | 'PRESIDENT';

export interface User {
    id: number;
    name: string; // Full name
    username: string;
    email: string;
    password: string;
    role: UserRole;
    clubId?: number; // Only for presidents
}
