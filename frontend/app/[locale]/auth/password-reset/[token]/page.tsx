"use client";

import { useAuth } from "@/hooks/auth";
import PasswordResetForm from "@/components/forms/password-reset-form";

const PasswordReset = () => {
    const auth = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/dashboard",
    });

    return <PasswordResetForm auth={auth} />;
};

export default PasswordReset;
