'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import {useEffect, useState} from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation'
import Status from "@/components/ui/status";
import { StatusType, ErrorMessageType } from "@/types/common";
import {AuthFormProps} from "@/types/auth";

export default function PasswordResetForm({ auth, className, ...props }: AuthFormProps) {
    const translations = useTranslations('auth');
    const searchParams = useSearchParams()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [status, setStatus] = useState<StatusType | null>(null);
    const [loading, setLoading] = useState(false);

    const { resetPassword } = auth;

    useEffect(() => {
        setEmail(searchParams.get('email') as string ?? '');
    }, [searchParams]);

    const submitForm = async (event: React.FormEvent) => {
        event.preventDefault();

        setErrors({});
        setStatus(null);

        const newErrors: Record<string, ErrorMessageType[]> = {};

        if (!email.trim()) {
            newErrors.email = [{ code: 'required_email' }];
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = [{ code: 'invalid_email' }];
        }

        if (password.length < 8) {
            newErrors.password = [{ code: 'password_min_8' }];
        }

        if (password !== passwordConfirmation) {
            newErrors.password_confirmation = [{ code: 'password_confirmed' }];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);

            await resetPassword({
                email,
                password,
                password_confirmation: passwordConfirmation,
                setErrors,
                setStatus,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitForm} className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{translations('reset_password')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <Status status={status} />
                        <div className="grid gap-3">
                            <Label htmlFor="email">{translations('email')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={translations('placeholder_email')}
                                value={email}
                                errors={errors.email}
                                set={setEmail}
                                setErrors={setErrors}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <div className="flex items-center">
                                <Label htmlFor="password">{translations('password')}</Label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                placeholder={translations('placeholder_password')}
                                errors={errors.password}
                                set={setPassword}
                                setErrors={setErrors}
                                required
                            />
                        </div>
                        <div className="grid gap-3">
                            <div className="flex items-center">
                                <Label htmlFor="password">{translations('password_confirmation')}</Label>
                            </div>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                placeholder={translations('placeholder_confirm_password')}
                                value={passwordConfirmation}
                                errors={errors.password_confirmation}
                                set={setPasswordConfirmation}
                                setErrors={setErrors}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full cursor-pointer" isLoading={loading}>
                            {translations('reset_password')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}