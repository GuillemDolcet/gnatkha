'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    IconArrowLeft,
    IconPencil,
    IconTrash,
    IconCalendar,
    IconScale,
    IconId,
    IconGenderMale,
    IconGenderFemale,
    IconQuestionMark,
    IconNotes,
    IconUsers,
    IconPlus,
    IconBell,
    IconHistory,
} from "@tabler/icons-react";
import { Animal } from "@/types/animal";
import { Reminder, TaskLog } from "@/types/task";
import { useAnimals } from "@/hooks/animals";
import { useAnimalTypes } from "@/hooks/animalTypes";
import { useTaskTypes } from "@/hooks/taskTypes";
import { useReminders } from "@/hooks/reminders";
import { useTaskLogs } from "@/hooks/taskLogs";
import AnimalFormModal from "@/components/animals/AnimalFormModal";
import ReminderCard from "@/components/tasks/ReminderCard";
import ReminderFormModal from "@/components/tasks/ReminderFormModal";
import TaskLogCard from "@/components/tasks/TaskLogCard";
import TaskLogFormModal from "@/components/tasks/TaskLogFormModal";
import QuickLogButton from "@/components/tasks/QuickLogButton";

export default function AnimalDetailPage() {
    const t = useTranslations('animals');
    const tTasks = useTranslations('tasks');
    const tTypes = useTranslations('animals.types');
    const tToast = useTranslations('animals.toast');
    const params = useParams();
    const router = useRouter();
    const animalId = parseInt(params.id as string);

    const { animalTypes } = useAnimalTypes();
    const { taskTypes } = useTaskTypes();
    const { fetchAnimal, updateAnimal, deleteAnimal } = useAnimals();
    const {
        reminders,
        fetchForAnimal: fetchReminders,
        createReminder,
        updateReminder,
        deleteReminder,
        toggleReminder
    } = useReminders();
    const {
        logs,
        fetchRecentForAnimal: fetchLogs,
        createLog,
        updateLog,
        deleteLog
    } = useTaskLogs();

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [reminderFormOpen, setReminderFormOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [logFormOpen, setLogFormOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TaskLog | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchAnimal(animalId);
            setAnimal(data);
            setIsLoading(false);

            if (data) {
                fetchReminders(animalId);
                fetchLogs(animalId, 10);
            }
        };
        loadData();
    }, [animalId, fetchAnimal, fetchReminders, fetchLogs]);

    const isAdmin = animal?.pack?.is_admin ?? false;

    const handleUpdate = async (animalId: number, data: Parameters<typeof updateAnimal>[1]) => {
        const result = await updateAnimal(animalId, data);
        if (result.success) {
            const updated = await fetchAnimal(animalId);
            setAnimal(updated);
        }
        return result;
    };

    const handleDelete = async () => {
        const result = await deleteAnimal(animalId);
        if (result.success) {
            toast.success(tToast('animal_deleted'));
            router.push('/dashboard/animals');
        } else {
            toast.error(tToast('error_unknown'));
        }
        setDeleteOpen(false);
    };

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setReminderFormOpen(true);
    };

    const handleReminderSubmit = async (data: any, reminderId?: number) => {
        if (reminderId) {
            return updateReminder(reminderId, data);
        }
        return createReminder(data);
    };

    const handleEditLog = (log: TaskLog) => {
        setEditingLog(log);
        setLogFormOpen(true);
    };

    const handleLogSubmit = async (data: any, logId?: number) => {
        if (logId) {
            return updateLog(logId, data);
        }
        const result = await createLog(data);
        if (result.success) {
            fetchLogs(animalId, 10);
        }
        return result;
    };

    const handleQuickLog = async (data: any) => {
        const result = await createLog(data);
        if (result.success) {
            fetchLogs(animalId, 10);
        }
        return result;
    };

    const formatAge = (birthDate: string) => {
        const birth = new Date(birthDate);
        const now = new Date();
        const diffMs = now.getTime() - birth.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return t('detail.age_days', { days: diffDays });
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return t('detail.age_months', { months });
        } else {
            const years = Math.floor(diffDays / 365);
            const remainingMonths = Math.floor((diffDays % 365) / 30);
            if (remainingMonths > 0) {
                return t('detail.age_years_months', { years, months: remainingMonths });
            }
            return t('detail.age_years', { years });
        }
    };

    const getSexIcon = (sex: string) => {
        switch (sex) {
            case 'male':
                return <IconGenderMale className="w-4 h-4 text-blue-500" />;
            case 'female':
                return <IconGenderFemale className="w-4 h-4 text-pink-500" />;
            default:
                return <IconQuestionMark className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getAnimalEmoji = (typeKey: string) => {
        const emojis: Record<string, string> = {
            dog: '🐕', cat: '🐱', bird: '🐦', fish: '🐟', rabbit: '🐰',
            hamster: '🐹', guinea_pig: '🐹', turtle: '🐢', snake: '🐍',
            lizard: '🦎', ferret: '🦦', horse: '🐴', other: '🐾'
        };
        return emojis[typeKey] || '🐾';
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-6">
                <div className="px-4 lg:px-6 pt-4">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="flex items-start gap-4 mb-6">
                        <Skeleton className="w-24 h-24 rounded-xl" />
                        <div className="flex-1">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (!animal) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">{t('detail.not_found')}</p>
                <Link href="/dashboard/animals">
                    <Button variant="outline">
                        <IconArrowLeft className="w-4 h-4 mr-2" />
                        {t('detail.back')}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 pb-20 md:pb-6">
            <div className="px-4 lg:px-6 pt-4">
                {/* Header con back */}
                <Link
                    href={animal.pack ? `/dashboard/animals?pack=${animal.pack_id}` : '/dashboard/animals'}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <IconArrowLeft className="w-4 h-4 mr-1" />
                    {t('detail.back')}
                </Link>

                {/* Info principal compacta */}
                <div className="flex items-start gap-4 mb-6">
                    {/* Imagen pequeña */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                        {animal.image_url ? (
                            <img
                                src={animal.image_url}
                                alt={animal.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                {getAnimalEmoji(animal.type.key)}
                            </div>
                        )}
                    </div>

                    {/* Info y acciones */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h1 className="text-2xl font-bold truncate">{animal.name}</h1>
                                <p className="text-muted-foreground">
                                    {tTypes(animal.type.key)}
                                    {animal.breed && ` · ${animal.breed}`}
                                </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer"
                                    onClick={() => setEditOpen(true)}
                                >
                                    <IconPencil className="w-4 h-4" />
                                </Button>
                                {isAdmin && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="cursor-pointer text-destructive hover:text-destructive"
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Quick log button */}
                        <div className="mt-2">
                            <QuickLogButton
                                animalId={animal.id}
                                animalName={animal.name}
                                taskTypes={taskTypes}
                                onLog={handleQuickLog}
                            />
                        </div>
                    </div>
                </div>

                {/* Detalles en línea compacta */}
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                    {animal.birth_date && (
                        <div className="flex items-center gap-1.5">
                            <IconCalendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatAge(animal.birth_date)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        {getSexIcon(animal.sex)}
                        <span>{t(`sex.${animal.sex}`)}</span>
                    </div>
                    {animal.weight && (
                        <div className="flex items-center gap-1.5">
                            <IconScale className="w-4 h-4 text-muted-foreground" />
                            <span>{animal.weight} kg</span>
                        </div>
                    )}
                    {animal.chip_number && (
                        <div className="flex items-center gap-1.5">
                            <IconId className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-xs">{animal.chip_number}</span>
                        </div>
                    )}
                    {animal.pack && (
                        <div className="flex items-center gap-1.5">
                            <IconUsers className="w-4 h-4 text-muted-foreground" />
                            <span>{animal.pack.name}</span>
                        </div>
                    )}
                </div>

                {/* Notas */}
                {animal.notes && (
                    <Card className="p-3 mb-6">
                        <div className="flex items-start gap-2">
                            <IconNotes className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm whitespace-pre-wrap">{animal.notes}</p>
                        </div>
                    </Card>
                )}

                {/* Tabs para recordatorios y historial */}
                <Tabs defaultValue="reminders">
                    <TabsList>
                        <TabsTrigger value="reminders" className="cursor-pointer">
                            <IconBell className="w-4 h-4 mr-2" />
                            {tTasks('reminders.title')}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="cursor-pointer">
                            <IconHistory className="w-4 h-4 mr-2" />
                            {tTasks('logs.title')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reminders" className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">{tTasks('reminders.title')}</h2>
                            <Button
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => {
                                    setEditingReminder(null);
                                    setReminderFormOpen(true);
                                }}
                            >
                                <IconPlus className="w-4 h-4 mr-1" />
                                {tTasks('reminders.add')}
                            </Button>
                        </div>

                        {reminders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <IconBell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>{tTasks('reminders.empty')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {reminders.map(reminder => (
                                    <ReminderCard
                                        key={reminder.id}
                                        reminder={reminder}
                                        onEdit={handleEditReminder}
                                        onDelete={deleteReminder}
                                        onToggle={toggleReminder}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">{tTasks('logs.recent')}</h2>
                            <Button
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => {
                                    setEditingLog(null);
                                    setLogFormOpen(true);
                                }}
                            >
                                <IconPlus className="w-4 h-4 mr-1" />
                                {tTasks('logs.add')}
                            </Button>
                        </div>

                        {logs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <IconHistory className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>{tTasks('logs.empty')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {logs.map(log => (
                                    <TaskLogCard
                                        key={log.id}
                                        log={log}
                                        onEdit={handleEditLog}
                                        onDelete={deleteLog}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            {animal && (
                <>
                    <AnimalFormModal
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        animalTypes={animalTypes}
                        animal={animal}
                        onSubmit={async (data, animalId) => {
                            if (!animalId) return { success: false, error: 'unknown' as const };
                            return handleUpdate(animalId, data);
                        }}
                    />

                    <ReminderFormModal
                        open={reminderFormOpen}
                        onOpenChange={(open) => {
                            setReminderFormOpen(open);
                            if (!open) setEditingReminder(null);
                        }}
                        taskTypes={taskTypes}
                        animals={[animal]}
                        reminder={editingReminder}
                        defaultAnimalId={animal.id}
                        onSubmit={handleReminderSubmit}
                    />

                    <TaskLogFormModal
                        open={logFormOpen}
                        onOpenChange={(open) => {
                            setLogFormOpen(open);
                            if (!open) setEditingLog(null);
                        }}
                        taskTypes={taskTypes}
                        animals={[animal]}
                        log={editingLog}
                        defaultAnimalId={animal.id}
                        onSubmit={handleLogSubmit}
                    />
                </>
            )}

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete.description', { name: animal.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                            {t('delete.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            {t('delete.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}