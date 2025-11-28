'use client';

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React, { useState } from 'react';

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ErrorMessageType {
    code?: string;
    message?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    type: "text" | "password" | "email" | "date" | "number";
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
    const hasErrors = errors && errors.length > 0;

    const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        set(event.target.value);

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (newErrors[name]) {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    function getErrorMessageType(err: string | ErrorMessageType) {
        if (typeof err === "string") return err;

        if (typeof err === "object" && err.code) {
            if (translations.has(err.code)) {
                return translations(err.code);
            }
            return err.message ?? err.code;
        }

        return translations('unknown');
    }

    // ---------- DATE PICKER ----------
    if (type === "date") {
        return (
            <div className="w-full py-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={disabled}
                            className={cn(
                                "w-full justify-start text-left font-normal h-9 cursor-pointer",
                                !dateValue && "text-muted-foreground",
                                hasErrors &&
                                "border-destructive focus-visible:ring-destructive/40"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateValue ? format(dateValue, "dd-MM-yyyy") : "Seleccionar fecha"}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={dateValue}
                            onSelect={(day) => {
                                setDateValue(day ?? undefined);
                                set(day ? format(day, "dd-MM-yyyy") : "");

                                setErrors(prev => {
                                    const newErr = { ...prev };
                                    delete newErr[name];
                                    return newErr;
                                });
                            }}
                            disabled={disabled}
                        />
                    </PopoverContent>
                </Popover>

                {hasErrors && (
                    <div className="text-xs mt-1 mb-1 text-red-700">
                        {errors.map((err, i) => (
                            <div key={i}>{getErrorMessageType(err)}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    // ---------- FIN DATE PICKER ----------

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

            {hasErrors && (
                <div className="text-xs mb-1 text-red-700">
                    {errors.map((err, index) => (
                        <div key={index}>{getErrorMessageType(err)}</div>
                    ))}
                </div>
            )}
        </>
    );
}
