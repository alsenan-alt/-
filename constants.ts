import type { Supervisor, EventType } from './types';

export const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export const INITIAL_EVENT_TYPES: EventType[] = [
  "مشاريع طلابية", 
  "فعاليات ومسابقات", 
  "لقاءات",
  "زيارة",
];

export const SUPERVISORS: Supervisor[] = [
    // Data is now managed dynamically via registration
];
