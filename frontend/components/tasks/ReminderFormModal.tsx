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
import { Reminder, TaskType, CreateReminderData, UpdateReminderData, ReminderFrequency } from "@/types/task";
import { Animal } from "@/types/animal";
import { ErrorMessageType } from "@/types/common";
import TaskTypeIcon from "./TaskTypeIcon";

interface ReminderFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskTypes: TaskType[];
    animals: Animal[];
    reminder?: Reminder | null;
    defaultAnimalId?: number | null;
    onSubmit: (data: CreateReminderData | UpdateReminderData, reminderId?: number) => Promise<{ success: boolean }>;
}

export default function ReminderFormModal({
                                              open,
                                              onOpenChange,
                                              taskTypes,
                                              animals,
                                              reminder,
                                              defaultAnimalId,
                                              onSubmit,
                                          }: ReminderFormModalProps) {
    const t = useTranslations('tasks');
    const tToast = useTranslations('tasks.toast');

    const isEditing = !!reminder;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [animalId, setAnimalId] = useState<string>('');
    const [taskTypeId, setTaskTypeId] = useState<string>('');
    const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
    const [timeOfDay, setTimeOfDay] = useState('09:00');
    const [dayOfWeek, setDayOfWeek] = useState<string>('1');
    const [dayOfMonth, setDayOfMonth] = useState<string>('1');
    const [specificDate, setSpecificDate] = useState('');
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (reminder) {
                setTitle(reminder.title);
                setDescription(reminder.description || '');
                setAnimalId(reminder.animal_id.toString());
                setTaskTypeId(reminder.task_type.id.toString());
                setFrequency(reminder.frequency);
                setTimeOfDay(reminder.time_of_day);
                setDayOfWeek(reminder.day_of_week?.toString() || '1');
                setDayOfMonth(reminder.day_of_month?.toString() || '1');
                setSpecificDate(reminder.specific_date || '');
            } else {
                setTitle('');
                setDescription('');
                setAnimalId(defaultAnimalId?.toString() || '');
                setTaskTypeId('');
                setFrequency('daily');
                setTimeOfDay('09:00');
                setDayOfWeek('1');
                setDayOfMonth('1');
                setSpecificDate('');
            }
            setErrors({});
        }
    }, [open, reminder, defaultAnimalId]);

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
            description: description.trim() || undefined,
            frequency,
            time_of_day: timeOfDay,
            day_of_week: frequency === 'weekly' ? parseInt(dayOfWeek) : undefined,
            day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth) : undefined,
            specific_date: frequency === 'once' ? specificDate : undefined,
        };

        let result;
        if (isEditing) {
            result = await onSubmit(baseData as UpdateReminderData, reminder.id);
        } else {
            result = await onSubmit({
                ...baseData,
                animal_id: parseInt(animalId),
            } as CreateReminderData);
        }

        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? tToast('reminder_updated') : tToast('reminder_created'));
            onOpenChange(false);
        }
    };

    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? t('edit_reminder.title') : t('create_reminder.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? t('edit_reminder.description') : t('create_reminder.description')}
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
                            <Label htmlFor="reminder-title">{t('form.title_label')}</Label>
                            <Input
                                id="reminder-title"
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
                            <Label>{t('form.frequency_label')}</Label>
                            <Select value={frequency} onValueChange={(v) => setFrequency(v as ReminderFrequency)}>
                                <SelectTrigger className="mt-1 w-full cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily" className="cursor-pointer">{t('frequency.daily')}</SelectItem>
                                    <SelectItem value="weekly" className="cursor-pointer">{t('frequency.weekly')}</SelectItem>
                                    <SelectItem value="monthly" className="cursor-pointer">{t('frequency.monthly')}</SelectItem>
                                    <SelectItem value="once" className="cursor-pointer">{t('frequency.once')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="reminder-time">{t('form.time_label')}</Label>
                                <Input
                                    id="reminder-time"
                                    type="time"
                                    name="time_of_day"
                                    value={timeOfDay}
                                    set={setTimeOfDay}
                                    setErrors={setErrors}
                                    errors={errors?.time_of_day}
                                    className="mt-1 w-full"
                                />
                            </div>

                            {frequency === 'weekly' && (
                                <div className="w-full">
                                    <Label>{t('form.day_of_week_label')}</Label>
                                    <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                        <SelectTrigger className="mt-1 w-full cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {daysOfWeek.map(day => (
                                                <SelectItem
                                                    key={day}
                                                    value={day.toString()}
                                                    className="cursor-pointer"
                                                >
                                                    {t(`days.${day}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {frequency === 'monthly' && (
                                <div className="w-full">
                                    <Label>{t('form.day_of_month_label')}</Label>
                                    <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                                        <SelectTrigger className="mt-1 w-full cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {daysOfMonth.map(day => (
                                                <SelectItem
                                                    key={day}
                                                    value={day.toString()}
                                                    className="cursor-pointer"
                                                >
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {frequency === 'once' && (
                                <div className="w-full">
                                    <Label htmlFor="reminder-date">{t('form.date_label')}</Label>
                                    <Input
                                        id="reminder-date"
                                        type="date"
                                        name="specific_date"
                                        value={specificDate}
                                        set={setSpecificDate}
                                        setErrors={setErrors}
                                        errors={errors?.specific_date}
                                        className="mt-1 w-full"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            <Label htmlFor="reminder-description">{t('form.description_label')}</Label>
                            <Textarea
                                id="reminder-description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('form.description_placeholder')}
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