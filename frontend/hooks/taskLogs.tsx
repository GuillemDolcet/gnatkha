import { useState, useCallback } from 'react';
import axios from '@/lib/axios';
import { ErrorResponse } from '@/types/common';
import { TaskLog, CreateTaskLogData, UpdateTaskLogData } from '@/types/task';

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const useTaskLogs = () => {
    const [logs, setLogs] = useState<TaskLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [pagination, setPagination] = useState<PaginatedResponse<TaskLog>['meta'] | null>(null);

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

    const fetchForAnimal = useCallback(async (animalId: number, page: number = 1) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/animals/${animalId}/logs?page=${page}`);
            const response = res.data as PaginatedResponse<TaskLog>;
            setLogs(response.data);
            setPagination(response.meta);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRecentForAnimal = useCallback(async (animalId: number, limit: number = 10) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/animals/${animalId}/logs/recent?limit=${limit}`);
            setLogs(res.data.data as TaskLog[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchForPack = useCallback(async (packId: number, page: number = 1) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/packs/${packId}/logs?page=${page}`);
            const response = res.data as PaginatedResponse<TaskLog>;
            setLogs(response.data);
            setPagination(response.meta);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchToday = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/logs/today');
            setLogs(res.data.data as TaskLog[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createLog = async (
        data: CreateTaskLogData,
        setErrors?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    ): Promise<ActionResult & { log?: TaskLog }> => {
        setErrors?.({});
        try {
            const response = await axios.post('/api/logs', data);
            const newLog = response.data.data as TaskLog;
            setLogs(prev => [newLog, ...prev]);
            return { success: true, log: newLog };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors?.(error.response.data.errors ?? {});
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const updateLog = async (
        logId: number,
        data: UpdateTaskLogData,
        setErrors?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    ): Promise<ActionResult> => {
        setErrors?.({});
        try {
            const response = await axios.put(`/api/logs/${logId}`, data);
            const updatedLog = response.data.data as TaskLog;
            setLogs(prev => prev.map(l => l.id === logId ? updatedLog : l));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors?.(error.response.data.errors ?? {});
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const deleteLog = async (logId: number): Promise<ActionResult> => {
        try {
            await axios.delete(`/api/logs/${logId}`);
            setLogs(prev => prev.filter(l => l.id !== logId));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    return {
        logs,
        isLoading,
        error,
        pagination,
        fetchForAnimal,
        fetchRecentForAnimal,
        fetchForPack,
        fetchToday,
        createLog,
        updateLog,
        deleteLog,
    };
};