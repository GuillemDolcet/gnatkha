import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import { ErrorResponse } from '@/types/common';
import { Pack, Member, CreatePackProps, JoinPackProps } from '@/types/pack';

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

export const usePacks = () => {
    const [packs, setPacks] = useState<Pack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPacks = useCallback(async () => {
        try {
            const res = await axios.get('/api/packs');
            setPacks(res.data.data as Pack[]);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPacks();
    }, [fetchPacks]);

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

    const createPack = async ({ setErrors, ...props }: CreatePackProps): Promise<ActionResult> => {
        setErrors({});
        try {
            const response = await axios.post('/api/packs', props);
            const newPack = response.data.data as Pack;
            setPacks(prev => [...prev, newPack]);
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else if (error.response?.data?.code) {
                setErrors({
                    name: [{
                        code: error.response.data.code,
                        message: error.response.data.message
                    }]
                });
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const joinPack = async ({ setErrors, ...props }: JoinPackProps): Promise<ActionResult> => {
        setErrors({});
        try {
            const response = await axios.post('/api/packs/join', props);
            const pack = response.data.data as Pack;
            setPacks(prev => [...prev, pack]);
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {});
            } else if (error.response?.data?.code) {
                setErrors({
                    invitation_code: [{
                        code: error.response.data.code,
                        message: error.response.data.message
                    }]
                });
            }
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const leavePack = async (packId: number): Promise<ActionResult> => {
        try {
            await axios.post(`/api/packs/${packId}/leave`);
            setPacks(prev => prev.filter(p => p.id !== packId));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const deletePack = async (packId: number): Promise<ActionResult> => {
        try {
            await axios.delete(`/api/packs/${packId}`);
            setPacks(prev => prev.filter(p => p.id !== packId));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const getMembers = async (packId: number): Promise<Member[]> => {
        try {
            const response = await axios.get(`/api/packs/${packId}/members`);
            return response.data.data as Member[];
        } catch {
            return [];
        }
    };

    const removeMember = async (packId: number, userId: number): Promise<ActionResult> => {
        try {
            await axios.delete(`/api/packs/${packId}/members/${userId}`);
            setPacks(prev => prev.map(p => {
                if (p.id === packId) {
                    return {
                        ...p,
                        members_count: (p.members_count ?? 1) - 1,
                    };
                }
                return p;
            }));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    const transferAdmin = async (packId: number, userId: number): Promise<ActionResult> => {
        try {
            await axios.post(`/api/packs/${packId}/members/${userId}/transfer-admin`);
            setPacks(prev => prev.map(p => {
                if (p.id === packId) {
                    return {
                        ...p,
                        is_admin: false,
                    };
                }
                return p;
            }));
            return { success: true };
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            return { success: false, error: getErrorType(error.response?.status) };
        }
    };

    return {
        packs,
        error,
        isLoading,
        refetch: fetchPacks,
        createPack,
        joinPack,
        leavePack,
        deletePack,
        getMembers,
        removeMember,
        transferAdmin,
    };
};