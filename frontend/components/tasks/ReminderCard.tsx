import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { IconPencil, IconTrash, IconClock, IconCalendar } from "@tabler/icons-react";
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
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 0) return t('reminders.next') + ': ' + t('logs.today');
        if (diffHours < 24) return t('reminders.next') + ': ' + t('logs.today') + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return t('reminders.next') + ': Mañana ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return t('reminders.next') + ': ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getFrequencyText = () => {
        switch (reminder.frequency) {
            case 'daily':
                return `${t('frequency.daily')} - ${reminder.time_of_day}`;
            case 'weekly':
                return `${t('frequency.weekly')} - ${t(`days.${reminder.day_of_week}`)} ${reminder.time_of_day}`;
            case 'monthly':
                return `${t('frequency.monthly')} - ${t('form.day_of_month_label')} ${reminder.day_of_month}, ${reminder.time_of_day}`;
            case 'once':
                return `${t('frequency.once')} - ${reminder.specific_date} ${reminder.time_of_day}`;
            default:
                return '';
        }
    };

    return (
        <>
            <Card className={`p-4 ${!reminder.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-3">
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
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">{reminder.title}</h3>
                            <Switch
                                checked={reminder.is_active}
                                onCheckedChange={handleToggle}
                                disabled={isToggling}
                                className="shrink-0"
                            />
                        </div>

                        {showAnimal && reminder.animal && (
                            <p className="text-sm text-muted-foreground">{reminder.animal.name}</p>
                        )}

                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <IconClock className="w-4 h-4" />
                            <span>{getFrequencyText()}</span>
                        </div>

                        {reminder.is_active && reminder.next_occurrence && (
                            <div className="flex items-center gap-1 text-sm text-primary mt-1">
                                <IconCalendar className="w-4 h-4" />
                                <span>{formatNextOccurrence(reminder.next_occurrence)}</span>
                            </div>
                        )}

                        {reminder.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {reminder.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onEdit(reminder)}
                    >
                        <IconPencil className="w-4 h-4 mr-1" />
                        {t('form.save')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <IconTrash className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

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