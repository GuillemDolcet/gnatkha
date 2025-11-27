"use client";

import LoginForm from "@/components/forms/login-form";
import { useAuth } from "@/hooks/auth";

const Login = () => {
    const auth = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/dashboard",
    });

    return <LoginForm auth={auth} />;
};

export default Login;
