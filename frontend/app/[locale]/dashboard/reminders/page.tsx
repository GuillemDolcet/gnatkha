'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus, IconBell, IconHistory, IconCalendarEvent } from "@tabler/icons-react";
import { Reminder, TaskLog } from "@/types/task";
import { Animal } from "@/types/animal";
import { useAnimals } from "@/hooks/animals";
import { useTaskTypes } from "@/hooks/taskTypes";
import { useReminders } from "@/hooks/reminders";
import { useTaskLogs } from "@/hooks/taskLogs";
import ReminderCard from "@/components/tasks/ReminderCard";
import ReminderFormModal from "@/components/tasks/ReminderFormModal";
import TaskLogCard from "@/components/tasks/TaskLogCard";
import TaskLogFormModal from "@/components/tasks/TaskLogFormModal";
import NotificationToggle from "@/components/tasks/NotificationToggle";

export default function RemindersPage() {
    const t = useTranslations('tasks');

    const { taskTypes } = useTaskTypes();
    const { animals, fetchAnimals } = useAnimals();
    const {
        reminders,
        isLoading: remindersLoading,
        fetchUpcoming,
        createReminder,
        updateReminder,
        deleteReminder,
        toggleReminder
    } = useReminders();
    const {
        logs,
        isLoading: logsLoading,
        fetchToday,
        createLog,
        updateLog,
        deleteLog
    } = useTaskLogs();

    const [reminderFormOpen, setReminderFormOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [logFormOpen, setLogFormOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TaskLog | null>(null);

    useEffect(() => {
        fetchAnimals();
        fetchUpcoming(7);
        fetchToday();
    }, [fetchAnimals, fetchUpcoming, fetchToday]);

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setReminderFormOpen(true);
    };

    const handleReminderSubmit = async (data: any, reminderId?: number) => {
        if (reminderId) {
            return updateReminder(reminderId, data);
        }
        const result = await createReminder(data);
        if (result.success) {
            fetchUpcoming(7);
        }
        return result;
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
            fetchToday();
        }
        return result;
    };

    const isLoading = remindersLoading || logsLoading;

    return (
        <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-6">
            <div className="px-4 lg:px-6 pt-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                </div>

                {/* Toggle de notificaciones */}
                <div className="mb-6">
                    <NotificationToggle />
                </div>

                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="w-full md:w-auto">
                        <TabsTrigger value="upcoming" className="cursor-pointer flex-1 md:flex-none">
                            <IconCalendarEvent className="w-4 h-4 mr-2" />
                            {t('reminders.upcoming')}
                        </TabsTrigger>
                        <TabsTrigger value="today" className="cursor-pointer flex-1 md:flex-none">
                            <IconHistory className="w-4 h-4 mr-2" />
                            {t('logs.today')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{t('reminders.upcoming')}</h2>
                            <Button
                                className="cursor-pointer"
                                onClick={() => {
                                    setEditingReminder(null);
                                    setReminderFormOpen(true);
                                }}
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                {t('reminders.add')}
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-32" />
                                ))}
                            </div>
                        ) : reminders.length === 0 ? (
                            <Card className="p-8 text-center">
                                <IconBell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">{t('reminders.none_upcoming')}</p>
                                <Button
                                    className="cursor-pointer mt-4"
                                    onClick={() => {
                                        setEditingReminder(null);
                                        setReminderFormOpen(true);
                                    }}
                                >
                                    <IconPlus className="w-4 h-4 mr-2" />
                                    {t('reminders.add')}
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {reminders.map(reminder => (
                                    <ReminderCard
                                        key={reminder.id}
                                        reminder={reminder}
                                        showAnimal={true}
                                        onEdit={handleEditReminder}
                                        onDelete={async (id) => {
                                            const result = await deleteReminder(id);
                                            if (result.success) fetchUpcoming(7);
                                            return result;
                                        }}
                                        onToggle={async (id) => {
                                            const result = await toggleReminder(id);
                                            if (result.success) fetchUpcoming(7);
                                            return result;
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="today" className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{t('logs.today')}</h2>
                            <Button
                                className="cursor-pointer"
                                onClick={() => {
                                    setEditingLog(null);
                                    setLogFormOpen(true);
                                }}
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                {t('logs.add')}
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24" />
                                ))}
                            </div>
                        ) : logs.length === 0 ? (
                            <Card className="p-8 text-center">
                                <IconHistory className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">{t('logs.empty')}</p>
                                <Button
                                    className="cursor-pointer mt-4"
                                    onClick={() => {
                                        setEditingLog(null);
                                        setLogFormOpen(true);
                                    }}
                                >
                                    <IconPlus className="w-4 h-4 mr-2" />
                                    {t('logs.add')}
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {logs.map(log => (
                                    <TaskLogCard
                                        key={log.id}
                                        log={log}
                                        showAnimal={true}
                                        onEdit={handleEditLog}
                                        onDelete={async (id) => {
                                            const result = await deleteLog(id);
                                            if (result.success) fetchToday();
                                            return result;
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <ReminderFormModal
                open={reminderFormOpen}
                onOpenChange={(open) => {
                    setReminderFormOpen(open);
                    if (!open) setEditingReminder(null);
                }}
                taskTypes={taskTypes}
                animals={animals}
                reminder={editingReminder}
                onSubmit={handleReminderSubmit}
            />

            <TaskLogFormModal
                open={logFormOpen}
                onOpenChange={(open) => {
                    setLogFormOpen(open);
                    if (!open) setEditingLog(null);
                }}
                taskTypes={taskTypes}
                animals={animals}
                log={editingLog}
                onSubmit={handleLogSubmit}
            />
        </div>
    );
}