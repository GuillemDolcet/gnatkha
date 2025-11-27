"use client";

import {
    IconLogout,
    IconUserCircle
} from "@tabler/icons-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {User} from "@/types/auth";
import {Button} from "@/components/ui/button";

type NavUserProps = {
    user: User | null;
    logout: () => void;
};

export function NavUser({user, logout}: NavUserProps) {
    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="border border-green-500 cursor-pointer">
                <Avatar>
                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                    <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={"bottom"}
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.avatar ?? undefined} alt={user.name}/>
                            <AvatarFallback>
                                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name}</span>
                            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <IconUserCircle/>
                        Account
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <div className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5">
                    <Button variant="outline" className="w-full text-red-700 cursor-pointer" onClick={logout}>
                        <IconLogout className="text-red-700"/>
                        Log out
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
