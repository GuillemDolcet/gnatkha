import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";

export default function GoogleLogin() {
    const translations = useTranslations("auth");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loginWithGoogle = () => {
        setLoading(true);

        const rootUrl = "https://accounts.google.com/o/oauth2/auth";

        const state = Math.random().toString(36).substring(2, 15);

        const options = {
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
            response_type: "code",
            scope: process.env.NEXT_PUBLIC_GOOGLE_SCOPE || "openid email profile",
            access_type: "offline",
            prompt: "consent",
            state: state,
        };

        const authUrl = `${rootUrl}?${new URLSearchParams(options).toString()}`;

        const popup = window.open(
            authUrl,
            'google-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'auth-success') {
                popup?.close();
                setLoading(false);

                router.push('/dashboard');
            } else if (event.data.type === 'auth-error') {
                popup?.close();
                setLoading(false);

                alert('Error on login with Google: ' + event.data.error);
            }

            window.removeEventListener('message', handleMessage);
        };

        window.addEventListener('message', handleMessage);

        const checkClosed = setInterval(() => {
            try {
                if (popup?.closed) {
                    setLoading(false);
                    window.removeEventListener('message', handleMessage);
                    clearInterval(checkClosed);
                }
            } catch (error) {

            }
        }, 1000);

        setTimeout(() => {
            if (popup && !popup.closed) {
                popup.close();
                setLoading(false);
                window.removeEventListener('message', handleMessage);
                clearInterval(checkClosed);
            }
        }, 300000);
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={loginWithGoogle}
            disabled={loading}
            isLoading={loading}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                />
            </svg>
            {translations("login_google")}
        </Button>
    );
}