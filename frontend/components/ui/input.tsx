'use client';

import {cn} from "@/lib/utils";
import {useTranslations} from "next-intl";
import React from 'react';

interface ErrorMessageType {
    code?: string;
    message?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    type: "text" | "password" | "email";
    errors?: ErrorMessageType[];
    name: string;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
    set: React.Dispatch<React.SetStateAction<string>>;
}

export default function Input({
                                  disabled = false,
                                  className,
                                  errors,
                                  set,
                                  setErrors,
                                  name,
                                  type,
                                  ...props
                              }: InputProps) {
    const translations = useTranslations('errors');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        set(event.target.value);

        setErrors((prevErrors) => {
            const newErrors = {...prevErrors};
            if (newErrors[name]) {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    function getErrorMessageType(err: string | ErrorMessageType) {
        if (typeof err === "string") {
            return err;
        }

        if (typeof err === "object" && err.code) {
            if (translations.has(err.code)) {
                return translations(err.code);
            }

            return err.message ?? err.code;
        }

        return translations('unknown');
    }

    const hasErrors = errors && errors.length > 0;

    return (
        <>
            <input
                type={type}
                disabled={disabled}
                data-slot="input"
                className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    className
                )}
                onChange={handleChange}
                name={name}
                aria-invalid={hasErrors}
                {...props}
            />
            {
                hasErrors && (
                    <div className="text-xs mb-1 text-red-700">
                        {errors.map((err, index) => (
                            <div key={index}>
                                {getErrorMessageType(err)}
                            </div>
                        ))}
                    </div>
                )
            }
        </>
    );
}