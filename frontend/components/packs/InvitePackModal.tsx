import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IconCopy, IconCheck } from "@tabler/icons-react";

interface InvitePackModalProps {
    invitationCode: string;
    packName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function InvitePackModal({
                                            invitationCode,
                                            packName,
                                            open,
                                            onOpenChange,
                                        }: InvitePackModalProps) {
    const t = useTranslations('packs.invite');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(invitationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description', { name: packName })}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-stretch gap-2">
                        <div className="flex-1 bg-muted rounded-lg p-4 flex items-center justify-center">
                            <span className="text-2xl font-mono font-bold tracking-widest">
                                {invitationCode}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            className="cursor-pointer px-6 h-auto"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <IconCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <IconCopy className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <div className="h-6 mt-2">
                        {copied && (
                            <p className="text-sm text-green-600 dark:text-green-400 text-center">
                                {t('copied')}
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                    {t('instructions')}
                </p>
            </DialogContent>
        </Dialog>
    );
}