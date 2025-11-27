"use client";

import { useAuth } from "@/hooks/auth";
import React, {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {useLocale, useTranslations} from "next-intl";
import Status from "@/components/ui/status";
import {ErrorMessageType, StatusType} from "@/types/common";
import {useSearchParams} from "next/navigation";

const Page = () => {
    const { logout, resendEmailVerification } = useAuth({
        middleware: "auth",
        redirectIfAuthenticated: "/dashboard",
    });
    const searchParams = useSearchParams();
    const translations = useTranslations("auth");
    const locale = useLocale();
    const [status, setStatus] = useState<StatusType | null>(null);
    const [, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (!errorParam) return;

        setStatus({
            success: false,
            code: atob(errorParam)
        });

        const url = new URL(window.location.href);
        url.searchParams.delete('reset');
        window.history.replaceState({}, '', url.toString());

    }, []);

    const submitResendEmailVerification= async () => {
        setErrors({});
        setStatus(null);
        setLoading(true);

        try {
            resendEmailVerification({
                setStatus,
                setErrors,
                locale
            });
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        {translations("verify_email")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <Status status={status} />
                        <div className="grid gap-3">
                            <div>{translations("thanks_for_signing_up")}</div>
                            <div>{translations("before_getting_started_verify_email")}</div>
                            <div>{translations("didnt_receive_email")}</div>
                        </div>
                        <div className="flex justify-between">
                            <Button
                                onClick={() => submitResendEmailVerification()}
                                className="cursor-pointer"
                                isLoading={loading}
                            >
                                {translations("resend_verification_email")}
                            </Button>
                            <button
                                onClick={logout}
                                className="underline text-sm cursor-pointer"
                            >
                                {translations("logout")}
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default Page;
