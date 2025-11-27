import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { IconDoorExit, IconLink, IconSettings, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import PackSettingsModal from "@/components/packs/PackSettingsModal";
import InvitePackModal from "@/components/packs/InvitePackModal";
import { Pack, Member } from "@/types/pack";

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface PackCardProps {
    pack: Pack;
    currentUserId: number;
    onLeave: (packId: number) => Promise<ActionResult>;
    onDelete: (packId: number) => Promise<ActionResult>;
    onGetMembers: (packId: number) => Promise<Member[]>;
    onRemoveMember: (packId: number, userId: number) => Promise<ActionResult>;
    onTransferAdmin: (packId: number, userId: number) => Promise<ActionResult>;
}

export default function PackCard({
                                     pack,
                                     currentUserId,
                                     onLeave,
                                     onDelete,
                                     onGetMembers,
                                     onRemoveMember,
                                     onTransferAdmin,
                                 }: PackCardProps) {
    const t = useTranslations('packs');
    const tToast = useTranslations('packs.toast');

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

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

    const handleLeaveConfirm = useCallback(async () => {
        const result = await onLeave(pack.id);
        if (result.success) {
            toast.success(tToast('pack_left'));
        } else {
            showErrorToast(result.error);
        }
        setLeaveConfirmOpen(false);
    }, [pack.id, onLeave, tToast, showErrorToast]);

    return (
        <>
            <Card className="flex flex-col p-6 transition-all hover:shadow-lg">
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold">{pack.name}</h3>
                            <p className={`text-sm font-medium ${
                                pack.is_admin ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                            }`}>
                                {pack.is_admin ? t('role.admin') : t('role.member')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center mt-4 border-t pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <IconUser className="w-4 h-4" />
                            <span>{t('members_count', { count: pack.members_count ?? 0 })}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {pack.is_admin ? (
                        <>
                            <Button
                                variant="outline"
                                className="flex-1 min-w-fit cursor-pointer text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950"
                                onClick={() => setSettingsOpen(true)}
                            >
                                <IconSettings className="w-4 h-4 mr-2" />
                                {t('actions.settings')}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 min-w-fit cursor-pointer text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                                onClick={() => setInviteOpen(true)}
                            >
                                <IconLink className="w-4 h-4 mr-2" />
                                {t('actions.invite')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            className="flex-1 min-w-fit cursor-pointer text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => setLeaveConfirmOpen(true)}
                        >
                            <IconDoorExit className="w-4 h-4 mr-2" />
                            {t('actions.leave')}
                        </Button>
                    )}
                </div>
            </Card>

            {pack.is_admin && (
                <>
                    <PackSettingsModal
                        pack={pack}
                        open={settingsOpen}
                        onOpenChange={setSettingsOpen}
                        onGetMembers={onGetMembers}
                        onRemoveMember={onRemoveMember}
                        onTransferAdmin={onTransferAdmin}
                        onDeletePack={onDelete}
                        currentUserId={currentUserId}
                    />
                    <InvitePackModal
                        invitationCode={pack.invitation_code}
                        packName={pack.name}
                        open={inviteOpen}
                        onOpenChange={setInviteOpen}
                    />
                </>
            )}

            {!pack.is_admin && (
                <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('leave.confirm_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('leave.confirm_description', { name: pack.name })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">
                                {t('leave.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={handleLeaveConfirm}
                            >
                                {t('leave.confirm_action')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}