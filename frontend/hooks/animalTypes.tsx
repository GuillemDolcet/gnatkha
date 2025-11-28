import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import { AnimalType } from '@/types/animal';

export const useAnimalTypes = () => {
    const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAnimalTypes = useCallback(async () => {
        try {
            const res = await axios.get('/api/animal-types');
            setAnimalTypes(res.data.data as AnimalType[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnimalTypes();
    }, [fetchAnimalTypes]);

    return {
        animalTypes,
        error,
        isLoading,
        refetch: fetchAnimalTypes,
    };
};