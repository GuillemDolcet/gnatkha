import { ErrorMessageType } from '@/types/common';

export interface Pack {
    id: number;
    name: string;
    invitation_code: string;
    members_count?: number;
    is_admin?: boolean;
    members?: Member[];
    created_at: string;
    updated_at: string;
}

export interface Member {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
}

export interface CreatePackProps {
    name: string;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}

export interface JoinPackProps {
    invitation_code: string;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}