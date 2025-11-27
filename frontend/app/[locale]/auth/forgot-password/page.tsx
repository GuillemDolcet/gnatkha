"use client";

import { useAuth } from "@/hooks/auth";
import ForgotPasswordForm from "@/components/forms/forgot-password-form";

const ForgotPassword = () => {
    const auth = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/dashboard",
    });

    return <ForgotPasswordForm auth={auth} />;
};

export default ForgotPassword;
