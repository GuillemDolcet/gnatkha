import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { IconPencil, IconTrash, IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { Reminder } from "@/types/task";
import TaskTypeIcon from "./TaskTypeIcon";

interface ReminderCardProps {
    reminder: Reminder;
    showAnimal?: boolean;
    onEdit: (reminder: Reminder) => void;
    onDelete: (reminderId: number) => Promise<{ success: boolean }>;
    onToggle: (reminderId: number) => Promise<{ success: boolean }>;
}

export default function ReminderCard({
                                         reminder,
                                         showAnimal = false,
                                         onEdit,
                                         onDelete,
                                         onToggle
                                     }: ReminderCardProps) {
    const t = useTranslations('tasks');
    const tToast = useTranslations('tasks.toast');

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleDelete = async () => {
        const result = await onDelete(reminder.id);
        if (result.success) {
            toast.success(tToast('reminder_deleted'));
        } else {
            toast.error(tToast('error_unknown'));
        }
        setDeleteOpen(false);
    };

    const handleToggle = async () => {
        setIsToggling(true);
        const result = await onToggle(reminder.id);
        if (result.success) {
            toast.success(tToast('reminder_toggled'));
        } else {
            toast.error(tToast('error_unknown'));
        }
        setIsToggling(false);
    };

    const formatNextOccurrence = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();

        // Comparar solo fechas (sin hora)
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowOnly = new Date(todayOnly);
        tomorrowOnly.setDate(tomorrowOnly.getDate() + 1);

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (dateOnly.getTime() === todayOnly.getTime()) {
            return `${t('logs.today')} ${timeStr}`;
        }
        if (dateOnly.getTime() === tomorrowOnly.getTime()) {
            return `${t('reminders.tomorrow')} ${timeStr}`;
        }
        return `${date.toLocaleDateString()} ${timeStr}`;
    };

    const getFrequencyBadge = () => {
        switch (reminder.frequency) {
            case 'daily':
                return t('frequency.daily');
            case 'weekly':
                return `${t(`days.${reminder.day_of_week}`)}`;
            case 'monthly':
                return `${t('frequency.monthly')}`;
            case 'once':
                return t('frequency.once');
            default:
                return '';
        }
    };

    return (
        <>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${!reminder.is_active ? 'opacity-50 bg-muted/30' : 'bg-card'}`}>
                <div
                    className="p-2 rounded-full shrink-0"
                    style={{ backgroundColor: `${reminder.task_type.color}20` }}
                >
                    <TaskTypeIcon
                        taskKey={reminder.task_type.key}
                        className="w-5 h-5"
                        style={{ color: reminder.task_type.color }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{reminder.title}</span>
                        {showAnimal && reminder.animal && (
                            <span className="text-xs text-muted-foreground">· {reminder.animal.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {getFrequencyBadge()}
                        </Badge>
                        <span>{reminder.time_of_day}</span>
                        {reminder.is_active && reminder.next_occurrence && (
                            <>
                                <span>·</span>
                                <span className="text-primary">{formatNextOccurrence(reminder.next_occurrence)}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8"
                        onClick={handleToggle}
                        disabled={isToggling}
                        title={reminder.is_active ? t('reminders.pause') : t('reminders.activate')}
                    >
                        {reminder.is_active ? (
                            <IconPlayerPause className="w-4 h-4" />
                        ) : (
                            <IconPlayerPlay className="w-4 h-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8"
                        onClick={() => onEdit(reminder)}
                        title={t('edit.button')}
                    >
                        <IconPencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteOpen(true)}
                        title={t('delete_reminder.confirm')}
                    >
                        <IconTrash className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete_reminder.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete_reminder.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            {t('delete_reminder.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            {t('delete_reminder.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}