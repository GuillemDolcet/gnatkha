import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconCrown, IconTrash } from "@tabler/icons-react";
import { Pack, Member } from "@/types/pack";
import MemberSkeleton from "@/components/packs/MemberSkeleton";

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface PackSettingsModalProps {
    pack: Pack;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGetMembers: (packId: number) => Promise<Member[]>;
    onRemoveMember: (packId: number, userId: number) => Promise<ActionResult>;
    onTransferAdmin: (packId: number, userId: number) => Promise<ActionResult>;
    onDeletePack: (packId: number) => Promise<ActionResult>;
    currentUserId: number;
}

export default function PackSettingsModal({
                                              pack,
                                              open,
                                              onOpenChange,
                                              onGetMembers,
                                              onRemoveMember,
                                              onTransferAdmin,
                                              onDeletePack,
                                              currentUserId,
                                          }: PackSettingsModalProps) {
    const t = useTranslations('packs.settings');
    const tToast = useTranslations('packs.toast');
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'remove' | 'transfer' | 'delete';
        member?: Member;
    } | null>(null);

    const showErrorToast = useCallback((error?: ActionResult['error']) => {
        switch (error) {
            case 'forbidden':
                toast.error(tToast('error_forbidden'));
                break;
            case 'not_found':
                toast.error(tToast('error_not_found'));
                break;
            default:
                toast.error(tToast('error_unknown'));
        }
    }, [tToast]);

    const loadMembers = useCallback(async () => {
        if (!pack) return;
        setIsLoading(true);
        const data = await onGetMembers(pack.id);
        setMembers(data);
        setIsLoading(false);
    }, [pack, onGetMembers]);

    useEffect(() => {
        if (open && pack) {
            loadMembers();
        } else {
            setMembers([]);
        }
    }, [open, pack, loadMembers]);

    const handleRemoveMember = async () => {
        if (!pack || !confirmAction?.member) return;
        const result = await onRemoveMember(pack.id, confirmAction.member.id);
        if (result.success) {
            toast.success(tToast('member_removed'));
            setMembers(prev => prev.filter(m => m.id !== confirmAction.member!.id));
        } else {
            showErrorToast(result.error);
        }
        setConfirmAction(null);
    };

    const handleTransferAdmin = async () => {
        if (!pack || !confirmAction?.member) return;
        const result = await onTransferAdmin(pack.id, confirmAction.member.id);
        if (result.success) {
            toast.success(tToast('admin_transferred'));
            onOpenChange(false);
        } else {
            showErrorToast(result.error);
        }
        setConfirmAction(null);
    };

    const handleDeletePack = async () => {
        if (!pack) return;
        const result = await onDeletePack(pack.id);
        if (result.success) {
            toast.success(tToast('pack_deleted'));
            onOpenChange(false);
        } else {
            showErrorToast(result.error);
        }
        setConfirmAction(null);
    };

    const getConfirmDialogContent = () => {
        switch (confirmAction?.type) {
            case 'remove':
                return {
                    title: t('confirm.remove_title'),
                    description: t('confirm.remove_description', { name: confirmAction.member?.name ?? '' }),
                    action: handleRemoveMember,
                    actionLabel: t('confirm.remove_action'),
                };
            case 'transfer':
                return {
                    title: t('confirm.transfer_title'),
                    description: t('confirm.transfer_description', { name: confirmAction.member?.name ?? '' }),
                    action: handleTransferAdmin,
                    actionLabel: t('confirm.transfer_action'),
                };
            case 'delete':
                return {
                    title: t('confirm.delete_title'),
                    description: t('confirm.delete_description'),
                    action: handleDeletePack,
                    actionLabel: t('confirm.delete_action'),
                };
            default:
                return null;
        }
    };

    const confirmContent = getConfirmDialogContent();

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('title', { name: pack.name })}</DialogTitle>
                        <DialogDescription>
                            {t('description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <h3 className="font-semibold mb-3">{t('members_title')}</h3>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {isLoading ? (
                                <>
                                    <MemberSkeleton />
                                    <MemberSkeleton />
                                </>
                            ) : (
                                members.map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium flex items-center gap-1">
                                                    {member.name}
                                                    {member.is_admin && (
                                                        <IconCrown className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>

                                        {member.id !== currentUserId && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                                                    onClick={() => setConfirmAction({ type: 'transfer', member })}
                                                >
                                                    <IconCrown className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer text-destructive border-destructive hover:bg-destructive/10"
                                                    onClick={() => setConfirmAction({ type: 'remove', member })}
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Button
                            variant="destructive"
                            className="w-full cursor-pointer"
                            onClick={() => setConfirmAction({ type: 'delete' })}
                        >
                            {t('delete_pack')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmContent?.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmContent?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            {t('confirm.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmContent?.action}
                        >
                            {confirmContent?.actionLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}