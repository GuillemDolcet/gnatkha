"use client";

import { ReactNode } from "react";
import {AppSidebar} from "@/components/layout/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppHeader} from "@/components/layout/app-header";
import {useAuth} from "@/hooks/auth";
import Loading from "@/app/[locale]/dashboard/Loading";

type AppLayoutProps = {
    children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
    const { user, logout } = useAuth({ middleware: "auth" });

    if (!user || !user.email_verified_at) {
        return <Loading />;
    }

    return (
        <div className="page border-primary">
            <div className="min-h-screen">
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <AppHeader user={user} logout={logout}/>
                        <div className="flex flex-1 flex-col">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
};

export default AppLayout;