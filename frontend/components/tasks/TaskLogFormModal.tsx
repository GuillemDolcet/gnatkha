import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TaskLog, TaskType, CreateTaskLogData, UpdateTaskLogData } from "@/types/task";
import { Animal } from "@/types/animal";
import { ErrorMessageType } from "@/types/common";
import TaskTypeIcon from "./TaskTypeIcon";

interface TaskLogFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskTypes: TaskType[];
    animals: Animal[];
    log?: TaskLog | null;
    defaultAnimalId?: number | null;
    defaultTaskTypeId?: number | null;
    defaultReminderId?: number | null;
    onSubmit: (data: CreateTaskLogData | UpdateTaskLogData, logId?: number) => Promise<{ success: boolean }>;
}

export default function TaskLogFormModal({
                                             open,
                                             onOpenChange,
                                             taskTypes,
                                             animals,
                                             log,
                                             defaultAnimalId,
                                             defaultTaskTypeId,
                                             defaultReminderId,
                                             onSubmit,
                                         }: TaskLogFormModalProps) {
    const t = useTranslations('tasks');
    const tToast = useTranslations('tasks.toast');

    const isEditing = !!log;

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [animalId, setAnimalId] = useState<string>('');
    const [taskTypeId, setTaskTypeId] = useState<string>('');
    const [completedAt, setCompletedAt] = useState('');
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (log) {
                setTitle(log.title);
                setNotes(log.notes || '');
                setAnimalId(log.animal_id.toString());
                setTaskTypeId(log.task_type.id.toString());
                setCompletedAt(new Date(log.completed_at).toISOString().slice(0, 16));
            } else {
                setTitle('');
                setNotes('');
                setAnimalId(defaultAnimalId?.toString() || '');
                setTaskTypeId(defaultTaskTypeId?.toString() || '');
                setCompletedAt(new Date().toISOString().slice(0, 16));
            }
            setErrors({});
        }
    }, [open, log, defaultAnimalId, defaultTaskTypeId]);

    const selectedTaskType = useMemo(() => {
        return taskTypes.find(t => t.id.toString() === taskTypeId);
    }, [taskTypes, taskTypeId]);

    // Auto-fill title when task type changes
    useEffect(() => {
        if (selectedTaskType && !title && !isEditing) {
            setTitle(t(`types.${selectedTaskType.key}`));
        }
    }, [selectedTaskType, title, isEditing, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !taskTypeId || (!isEditing && !animalId)) return;

        setIsSubmitting(true);

        const baseData = {
            task_type_id: parseInt(taskTypeId),
            title: title.trim(),
            notes: notes.trim() || undefined,
            completed_at: completedAt || undefined,
        };

        let result;
        if (isEditing) {
            result = await onSubmit(baseData as UpdateTaskLogData, log.id);
        } else {
            result = await onSubmit({
                ...baseData,
                animal_id: parseInt(animalId),
                reminder_id: defaultReminderId || undefined,
            } as CreateTaskLogData);
        }

        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? tToast('log_updated') : tToast('log_created'));
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? t('edit_log.title') : t('create_log.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? t('edit_log.description') : t('create_log.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {!isEditing && (
                            <div className="w-full">
                                <Label>{t('form.animal_label')}</Label>
                                <Select value={animalId} onValueChange={setAnimalId}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={t('form.animal_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {animals.map(animal => (
                                            <SelectItem
                                                key={animal.id}
                                                value={animal.id.toString()}
                                                className="cursor-pointer"
                                            >
                                                {animal.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="w-full">
                            <Label>{t('form.type_label')}</Label>
                            <Select value={taskTypeId} onValueChange={setTaskTypeId}>
                                <SelectTrigger className="mt-1 w-full cursor-pointer">
                                    <SelectValue placeholder={t('form.type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {taskTypes.map(type => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <TaskTypeIcon taskKey={type.key} className="w-4 h-4" />
                                                {t(`types.${type.key}`)}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="log-title">{t('form.title_label')}</Label>
                            <Input
                                id="log-title"
                                type="text"
                                name="title"
                                value={title}
                                set={setTitle}
                                setErrors={setErrors}
                                errors={errors?.title}
                                placeholder={t('form.title_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="log-completed-at">{t('logs.completed_at')}</Label>
                            <Input
                                id="log-completed-at"
                                type="datetime-local"
                                name="completed_at"
                                value={completedAt}
                                set={setCompletedAt}
                                setErrors={setErrors}
                                errors={errors?.completed_at}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="log-notes">{t('form.notes_label')}</Label>
                            <Textarea
                                id="log-notes"
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('form.notes_placeholder')}
                                className="mt-1 w-full min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('form.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || !taskTypeId || (!isEditing && !animalId) || isSubmitting}
                            className="cursor-pointer"
                        >
                            {isSubmitting
                                ? (isEditing ? t('form.saving') : t('form.creating'))
                                : (isEditing ? t('form.save') : t('form.create'))
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}