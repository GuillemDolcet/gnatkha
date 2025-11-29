import { useState, useCallback } from 'react';
import axios from '@/lib/axios';
import { ErrorResponse } from '@/types/common';
import { Reminder, CreateReminderData, UpdateReminderData } from '@/types/task';

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

export const useReminders = () => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const getErrorType = (status?: number): ActionResult['error'] => {
        switch (status) {
            case 403:
                return 'forbidden';
            case 404:
                return 'not_found';
            default:
                return 'unknown';
        }
    };

    const fetchForAnimal = useCallback(async (animalId: number) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/animals/${animalId}/reminders`);
            setReminders(res.data.data as Reminder[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchForPack = useCallback(async (packId: number) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/packs/${packId}/reminders`);
            setReminders(res.data.data as Reminder[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUpcoming = useCallback(async (days: number = 7) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/reminders/upcoming?days=${days}`);
            setReminders(res.data.data as Reminder[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createReminder = async (
        data: CreateReminderData,
        setErrors?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    ): Promise<ActionResult> => {
        setErrors?.({});
        try {
            const response = await axios.post('/api/reminders', data);
            const newReminder = response.data.data as Reminder;
            setReminders(prev => [...prev, newReminder].sort((a, b) =>
                new Date(a.next_occurrence || '').getTime() - new Date(b.next_occurrence || '').getTime()
            ));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors?.(error.response.data.errors ?? {});
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const updateReminder = async (
        reminderId: number,
        data: UpdateReminderData,
        setErrors?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    ): Promise<ActionResult> => {
        setErrors?.({});
        try {
            const response = await axios.put(`/api/reminders/${reminderId}`, data);
            const updatedReminder = response.data.data as Reminder;
            setReminders(prev => prev.map(r => r.id === reminderId ? updatedReminder : r));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors?.(error.response.data.errors ?? {});
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const deleteReminder = async (reminderId: number): Promise<ActionResult> => {
        try {
            await axios.delete(`/api/reminders/${reminderId}`);
            setReminders(prev => prev.filter(r => r.id !== reminderId));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const toggleReminder = async (reminderId: number): Promise<ActionResult> => {
        try {
            const response = await axios.post(`/api/reminders/${reminderId}/toggle`);
            const updatedReminder = response.data.data as Reminder;
            setReminders(prev => prev.map(r => r.id === reminderId ? updatedReminder : r));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    return {
        reminders,
        isLoading,
        error,
        fetchForAnimal,
        fetchForPack,
        fetchUpcoming,
        createReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
    };
};