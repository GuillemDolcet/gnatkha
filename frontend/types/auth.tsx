import {useAuth} from "@/hooks/auth";
import {ErrorMessageType, StatusType} from "@/types/common";

type SetErrors = React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;

type SetStatus = React.Dispatch<React.SetStateAction<StatusType | null>>;

export interface AuthFormProps {
    className?: string;
    auth: ReturnType<typeof useAuth>;
}

export interface LoginProps {
    email: string;
    password: string;
    remember: boolean;
    setErrors: SetErrors;
    setStatus: SetStatus;
}

export interface RegisterProps {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    locale: string;
    setErrors: SetErrors;
    setStatus: SetStatus;
}

export interface ForgotPasswordProps {
    email: string;
    locale: string;
    setErrors: SetErrors;
    setStatus: SetStatus;
}

export interface ResendEmailVerification {
    locale: string;
    setErrors: SetErrors;
    setStatus: SetStatus;
}

export interface ResetPasswordProps {
    token?: string;
    email: string;
    password: string;
    password_confirmation: string;
    setErrors: SetErrors;
    setStatus: SetStatus;
}

export interface UseAuthOptions {
    middleware?: 'auth' | 'guest';
    redirectIfAuthenticated?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    avatar: string | null;
}