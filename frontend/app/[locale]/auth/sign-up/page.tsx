"use client";

import { useAuth } from "@/hooks/auth";
import SignUpForm from "@/components/forms/sign-up-form";

const SignUp = () => {
    const auth = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/dashboard",
    });

    return <SignUpForm auth={auth} />;
};

export default SignUp;
