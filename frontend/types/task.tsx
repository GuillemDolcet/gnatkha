import { Animal } from './animal';
import { User } from './auth';

export interface TaskType {
    id: number;
    key: string;
    icon: string;
    color: string;
}

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface Reminder {
    id: number;
    animal_id: number;
    animal?: Animal;
    task_type: TaskType;
    creator?: User;
    title: string;
    description?: string | null;
    frequency: ReminderFrequency;
    day_of_week?: number | null; // 0-6 (Sunday-Saturday)
    day_of_month?: number | null; // 1-31
    time_of_day: string; // HH:mm
    specific_date?: string | null; // YYYY-MM-DD
    is_active: boolean;
    next_occurrence?: string | null; // ISO date
    created_at: string;
    updated_at: string;
}

export interface TaskLog {
    id: number;
    animal_id: number;
    animal?: Animal;
    task_type: TaskType;
    user?: User;
    reminder_id?: number | null;
    title: string;
    notes?: string | null;
    completed_at: string; // ISO date
    created_at: string;
    updated_at: string;
}

export interface CreateReminderData {
    animal_id: number;
    task_type_id: number;
    title: string;
    description?: string;
    frequency: ReminderFrequency;
    day_of_week?: number;
    day_of_month?: number;
    time_of_day: string;
    specific_date?: string;
}

export interface UpdateReminderData {
    task_type_id: number;
    title: string;
    description?: string;
    frequency: ReminderFrequency;
    day_of_week?: number;
    day_of_month?: number;
    time_of_day: string;
    specific_date?: string;
    is_active?: boolean;
}

export interface CreateTaskLogData {
    animal_id: number;
    task_type_id: number;
    reminder_id?: number;
    title: string;
    notes?: string;
    completed_at?: string;
}

export interface UpdateTaskLogData {
    task_type_id: number;
    title: string;
    notes?: string;
    completed_at?: string;
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}