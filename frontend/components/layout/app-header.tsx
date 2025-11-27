import * as React from "react";
import {Sidebar, SidebarTrigger} from "@/components/ui/sidebar";
import {User} from "@/types/auth";
import {NavUser} from "@/components/layout/nav-user";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import Logo from "@/components/ui/logo";
import {useIsMobile} from "@/hooks/use-mobile";

type SiteHeaderProps = React.ComponentProps<typeof Sidebar> & {
    user: User | null;
    logout: () => void;
};

export function AppHeader({ user, logout }: SiteHeaderProps) {
    const isMobile = useIsMobile();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`
                sticky top-0 z-50
                flex h-(--header-height) shrink-0 items-center gap-2 
                transition-all duration-200 ease-in-out 
                group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) 
                pt-4 pb-4 bg-background
                ${isScrolled ? 'border-b' : ''}
            `}
        >
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <Logo width={30} height={32}/>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    { isMobile && <SidebarTrigger className="border bg-white cursor-pointer" /> }
                    <LocaleSwitcher />
                    <ThemeSwitcher />
                    <NavUser user={user} logout={logout}/>
                </div>
            </div>
        </header>
    )
}