import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
import { IconPencil, IconTrash, IconClock, IconUser } from "@tabler/icons-react";
import { TaskLog } from "@/types/task";
import TaskTypeIcon from "./TaskTypeIcon";

interface TaskLogCardProps {
    log: TaskLog;
    showAnimal?: boolean;
    onEdit?: (log: TaskLog) => void;
    onDelete?: (logId: number) => Promise<{ success: boolean }>;
    canEdit?: boolean;
}

export default function TaskLogCard({
                                        log,
                                        showAnimal = false,
                                        onEdit,
                                        onDelete,
                                        canEdit = true,
                                    }: TaskLogCardProps) {
    const t = useTranslations('tasks');
    const tToast = useTranslations('tasks.toast');

    const [deleteOpen, setDeleteOpen] = useState(false);

    const handleDelete = async () => {
        if (!onDelete) return;
        const result = await onDelete(log.id);
        if (result.success) {
            toast.success(tToast('log_deleted'));
        } else {
            toast.error(tToast('error_unknown'));
        }
        setDeleteOpen(false);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();

        if (isToday) {
            return t('logs.today') + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (isYesterday) {
            return 'Ayer ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Card className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className="p-2 rounded-full shrink-0"
                        style={{ backgroundColor: `${log.task_type.color}20` }}
                    >
                        <TaskTypeIcon
                            taskKey={log.task_type.key}
                            className="w-5 h-5"
                            style={{ color: log.task_type.color }}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">{log.title}</h3>
                            {canEdit && (onEdit || onDelete) && (
                                <div className="flex gap-1 shrink-0">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer h-7 w-7 p-0"
                                            onClick={() => onEdit(log)}
                                        >
                                            <IconPencil className="w-4 h-4" />
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer h-7 w-7 p-0 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteOpen(true)}
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {showAnimal && log.animal && (
                            <p className="text-sm text-muted-foreground">{log.animal.name}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                                <IconClock className="w-4 h-4" />
                                <span>{formatDate(log.completed_at)}</span>
                            </div>
                            {log.user && (
                                <div className="flex items-center gap-1">
                                    <IconUser className="w-4 h-4" />
                                    <span>{log.user.name}</span>
                                </div>
                            )}
                        </div>

                        {log.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {log.notes}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete_log.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete_log.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            {t('delete_log.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            {t('delete_log.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}