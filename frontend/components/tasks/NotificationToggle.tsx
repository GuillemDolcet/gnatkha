'use client';

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconBell, IconBellOff, IconBellRinging } from "@tabler/icons-react";
import { usePushNotifications } from "@/hooks/pushNotifications";

export default function NotificationToggle() {
    const t = useTranslations('tasks.notifications');
    const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

    const handleToggle = async () => {
        if (isSubscribed) {
            const success = await unsubscribe();
            if (success) {
                toast.success(t('disabled'));
            }
        } else {
            const success = await subscribe();
            if (success) {
                toast.success(t('enabled'));
            } else if (permission === 'denied') {
                toast.error(t('permission_denied'));
            }
        }
    };

    if (!isSupported) {
        return (
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                        <IconBellOff className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{t('title')}</p>
                        <p className="text-sm text-muted-foreground">{t('not_supported')}</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isSubscribed ? 'bg-primary/10' : 'bg-muted'}`}>
                    {isSubscribed ? (
                        <IconBellRinging className="w-5 h-5 text-primary" />
                    ) : (
                        <IconBell className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{t('title')}</p>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button
                    variant={isSubscribed ? "outline" : "default"}
                    size="sm"
                    className="cursor-pointer"
                    onClick={handleToggle}
                    disabled={isLoading || permission === 'denied'}
                >
                    {isLoading ? '...' : isSubscribed ? t('disable') : t('enable')}
                </Button>
            </div>
        </Card>
    );
}