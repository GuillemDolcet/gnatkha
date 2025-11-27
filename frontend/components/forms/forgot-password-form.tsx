"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {useLocale, useTranslations} from "next-intl";
import { useState } from "react";
import React from "react";
import Status from "@/components/ui/status";
import {ErrorMessageType, StatusType} from "@/types/common";
import {AuthFormProps} from "@/types/auth";

export default function ForgotPasswordForm({
                                               className,
                                               auth,
                                               ...props
                                           }: AuthFormProps) {
    const translations = useTranslations('auth');
    const locale = useLocale();

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [status, setStatus] = useState<StatusType | null>(null);
    const [loading, setLoading] = useState(false);

    const { forgotPassword } = auth;

    const submitForm = async (event: React.FormEvent) => {
        event.preventDefault();

        setErrors({});
        setStatus(null);

        const newErrors: Record<string, ErrorMessageType[]> = {};
        if (!email.trim()) {
            newErrors.email = [{ code: "email_required" }];
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = [{ code: "email_invalid" }];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);

            await forgotPassword({
                email,
                locale,
                setErrors,
                setStatus,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={submitForm}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        {translations("reset_password")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <Status status={status} />
                        <div className="grid gap-3">
                            <Label htmlFor="email">{translations("email")}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={translations("placeholder_email")}
                                value={email}
                                errors={errors.email}
                                set={setEmail}
                                setErrors={setErrors}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full cursor-pointer" isLoading={loading}>
                            {translations("send_reset_link")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
