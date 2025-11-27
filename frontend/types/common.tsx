export type ErrorMessageType = {
    code?: string;
    message?: string;
};

export type StatusType = {
    success: boolean;
    code: string;
    message?: string;
};

export interface ErrorResponse {
    response: {
        status: number;
        data: {
            code?: string;
            errors?: Record<string, ErrorMessageType[]>;
            message?: string;
        };
    };
}