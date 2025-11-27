'use client';

import React from 'react';
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

type StatusType = {
    success: boolean;
    code: string;
    message?: string;
};

interface StatusProps {
    status: StatusType | null;
}

export default function Status({ status }: StatusProps) {
    const translations = useTranslations('status');

    if (!status) return null;

    return (
        <div className="grid gap-3">
            <Alert variant={status.success ? 'success' : 'error'}>
                {status.success ? <CheckCircle2Icon /> : <CircleAlert />}
                <AlertTitle>{translations(status.code)}</AlertTitle>
            </Alert>
        </div>
    );
}