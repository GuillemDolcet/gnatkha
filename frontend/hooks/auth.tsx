import useSWR from 'swr';
import axios from '@/lib/axios';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import {ErrorResponse} from "@/types/common";
import {
    ForgotPasswordProps,
    LoginProps,
    RegisterProps,
    ResendEmailVerification,
    ResetPasswordProps,
    UseAuthOptions,
    User
} from "@/types/auth";

export const useAuth = ({ middleware, redirectIfAuthenticated }: UseAuthOptions = {}) => {
    const router = useRouter();
    const params = useParams<{ token?: string }>();

    const { data: user, error, mutate } = useSWR<User | null>(
        '/api/user',
        async (): Promise<User | null> => {
            try {
                const res = await axios.get('/api/user');
                return res.data as User;
            } catch (err: unknown) {
                const error = err as ErrorResponse;
                if (error.response?.status === 409) {
                    router.push('/dashboard');

                    return null;
                }
                throw error;
            }
        }
    );

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    const register = async ({ setErrors, setStatus, ...props }: RegisterProps) => {
        setErrors({});
        try {
            await csrf();
            await axios.post('/register', props);
            await mutate();
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status !== 422) {
                setStatus({
                    success: false,
                    code: error.response?.data?.code ?? 'server_error',
                });
            } else {
                setErrors(error.response.data.errors ?? {});
            }
        }
    };

    const login = async ({ setErrors, setStatus, ...props }: LoginProps) => {
        setErrors({});
        try {
            await csrf();
            await axios.post('/login', props);
            await mutate();
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status !== 422) {
                setStatus({
                    success: false,
                    code: error.response?.data?.code ?? 'server_error',
                });
            } else {
                setErrors(error.response.data.errors ?? {});
            }
        }
    };

    const forgotPassword = async ({ setErrors, email, setStatus, locale }: ForgotPasswordProps) => {
        setErrors({});
        try {
            await csrf();
            const response = await axios.post('/forgot-password', { email, locale });
            setStatus({
                success: true,
                code: response.data.code,
            });
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status !== 422) {
                setStatus({
                    success: false,
                    code: error.response?.data?.code ?? 'server_error',
                });
            } else {
                setErrors(error.response.data.errors ?? {});
            }
        }
    };

    const resetPassword = async ({ setErrors, setStatus, ...props }: ResetPasswordProps) => {
        setErrors({});
        try {
            await csrf();
            const response = await axios.post('/reset-password', { token: params.token, ...props });
            if (response.data?.code) {
                router.push('/auth/login?reset=' + btoa(response.data.code));
            }
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status !== 422) {
                setStatus({
                    success: false,
                    code: error.response?.data?.code ?? 'server_error',
                });
            } else {
                setErrors(error.response.data.errors ?? {});
            }
        }
    };

    const logout = async () => {
        if (!error) {
            await axios.post('/logout').then(() => mutate(undefined));
        }
        router.push('/auth/login');
    };

    const resendEmailVerification = async ({ setErrors, setStatus, ...props }: ResendEmailVerification) => {
        try {
            const response = await axios.post('/email/verification-notification', { ...props });

            setStatus({
                success: true,
                code: response.data.code,
            })
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            if (error.response?.status !== 422) {
                setStatus({
                    success: false,
                    code: error.response?.data?.code ?? 'server_error',
                });
            } else {
                setErrors(error.response.data.errors ?? {});
            }
        }
    };

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user) {
            router.push(redirectIfAuthenticated);
        }

        if (middleware === 'auth' && user && !user.email_verified_at) {
            router.push('/auth/verify-email');
        }

        if (
            window.location.pathname.includes('/auth/verify-email') &&
            user?.email_verified_at &&
            redirectIfAuthenticated
        ) {
            router.push(redirectIfAuthenticated);
        }

        if (middleware === 'auth' && error) {
            logout();
        }
    }, [user, error, middleware, redirectIfAuthenticated, router]);

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    };
};