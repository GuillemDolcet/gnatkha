import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { TaskType } from '@/types/task';

export const useTaskTypes = () => {
    const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTaskTypes = async () => {
            try {
                const res = await axios.get('/api/task-types');
                setTaskTypes(res.data.data as TaskType[]);
                setError(null);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTaskTypes();
    }, []);

    return { taskTypes, isLoading, error };
};