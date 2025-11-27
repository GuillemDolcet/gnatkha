import { PropsWithChildren } from 'react';
import Link from "next/link";
import Logo from "@/components/ui/logo";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Boilerplate Guillem Dolcet',
}

const Layout = ({ children }: PropsWithChildren) => {
    return (
        <>
            <div className="relative min-h-screen">
                <div className="absolute top-0 right-0 p-3 flex gap-2">
                    <LocaleSwitcher/>
                    <ThemeSwitcher />
                </div>
                <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
                    <div className="flex w-full max-w-sm flex-col gap-6">
                        <Link href="/auth/login" className="flex items-center self-center font-medium">
                            <Logo />
                        </Link>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Layout