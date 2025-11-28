import { useState, useCallback } from 'react';
import axios from '@/lib/axios';
import { ErrorResponse } from '@/types/common';
import { Animal, CreateAnimalProps, UpdateAnimalProps } from '@/types/animal';
import { Pack } from '@/types/pack';

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface AnimalsByPack {
    pack: Pack;
    animals: Animal[];
}

export const useAnimals = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [animalsByPack, setAnimalsByPack] = useState<AnimalsByPack[]>([]);
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

    const fetchAnimalsForPack = useCallback(async (packId: number) => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/packs/${packId}/animals`);
            setAnimals(res.data.data as Animal[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAnimal = useCallback(async (animalId: number): Promise<Animal | null> => {
        try {
            const res = await axios.get(`/api/animals/${animalId}`);
            return res.data.data as Animal;
        } catch (err) {
            setError(err as Error);
            return null;
        }
    }, []);

    const fetchAllAnimals = useCallback(async (packs: Pack[]) => {
        setIsLoading(true);
        try {
            const results: AnimalsByPack[] = [];

            for (const pack of packs) {
                const res = await axios.get(`/api/packs/${pack.id}/animals`);
                const packAnimals = res.data.data as Animal[];
                if (packAnimals.length > 0) {
                    results.push({
                        pack,
                        animals: packAnimals,
                    });
                }
            }

            setAnimalsByPack(results);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createAnimal = async ({ setErrors, image, ...props }: CreateAnimalProps): Promise<ActionResult> => {
        setErrors({});
        try {
            const formData = new FormData();
            formData.append('name', props.name);
            formData.append('animal_type_id', props.animal_type_id.toString());
            formData.append('pack_id', props.pack_id.toString());
            if (props.breed) {
                formData.append('breed', props.breed);
            }
            if (props.birth_date) {
                formData.append('birth_date', props.birth_date);
            }
            if (props.sex) {
                formData.append('sex', props.sex);
            }
            if (props.weight !== undefined && props.weight !== null) {
                formData.append('weight', props.weight.toString());
            }
            if (props.chip_number) {
                formData.append('chip_number', props.chip_number);
            }
            if (props.notes) {
                formData.append('notes', props.notes);
            }
            if (image) {
                formData.append('image', image);
            }
            if (props.default_image_id) {
                formData.append('default_image_id', props.default_image_id.toString());
            }

            const response = await axios.post('/api/animals', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const newAnimal = response.data.data as Animal;
            setAnimals(prev => [...prev, newAnimal]);

            // También actualizar animalsByPack
            setAnimalsByPack(prev => {
                const packIndex = prev.findIndex(p => p.pack.id === props.pack_id);
                if (packIndex >= 0) {
                    const updated = [...prev];
                    updated[packIndex] = {
                        ...updated[packIndex],
                        animals: [...updated[packIndex].animals, newAnimal],
                    };
                    return updated;
                }
                return prev;
            });

            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const updateAnimal = async (
        animalId: number,
        { setErrors, image, ...props }: UpdateAnimalProps
    ): Promise<ActionResult> => {
        setErrors({});
        try {
            const formData = new FormData();
            formData.append('name', props.name);
            formData.append('animal_type_id', props.animal_type_id.toString());
            if (props.breed) {
                formData.append('breed', props.breed);
            }
            if (props.birth_date) {
                formData.append('birth_date', props.birth_date);
            }
            if (props.sex) {
                formData.append('sex', props.sex);
            }
            if (props.weight !== undefined && props.weight !== null) {
                formData.append('weight', props.weight.toString());
            }
            if (props.chip_number) {
                formData.append('chip_number', props.chip_number);
            }
            if (props.notes) {
                formData.append('notes', props.notes);
            }
            if (image) {
                formData.append('image', image);
            }
            if (props.default_image_id) {
                formData.append('default_image_id', props.default_image_id.toString());
            }

            const response = await axios.post(`/api/animals/${animalId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedAnimal = response.data.data as Animal;
            setAnimals(prev => prev.map(a => a.id === animalId ? updatedAnimal : a));

            // También actualizar animalsByPack
            setAnimalsByPack(prev => prev.map(group => ({
                ...group,
                animals: group.animals.map(a => a.id === animalId ? updatedAnimal : a),
            })));

            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const deleteAnimal = async (animalId: number): Promise<ActionResult> => {
        try {
            await axios.delete(`/api/animals/${animalId}`);
            setAnimals(prev => prev.filter(a => a.id !== animalId));

            // También actualizar animalsByPack
            setAnimalsByPack(prev => prev.map(group => ({
                ...group,
                animals: group.animals.filter(a => a.id !== animalId),
            })).filter(group => group.animals.length > 0));

            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    return {
        animals,
        animalsByPack,
        error,
        isLoading,
        fetchAnimalsForPack,
        fetchAnimal,
        fetchAllAnimals,
        createAnimal,
        updateAnimal,
        deleteAnimal,
    };
};