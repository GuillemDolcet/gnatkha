import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { TaskType, CreateTaskLogData } from "@/types/task";
import TaskTypeIcon from "./TaskTypeIcon";

interface QuickLogButtonProps {
    animalId: number;
    animalName: string;
    taskTypes: TaskType[];
    onLog: (data: CreateTaskLogData) => Promise<{ success: boolean }>;
}

export default function QuickLogButton({
                                           animalId,
                                           animalName,
                                           taskTypes,
                                           onLog
                                       }: QuickLogButtonProps) {
    const t = useTranslations('tasks');
    const tToast = useTranslations('tasks.toast');

    const [isLogging, setIsLogging] = useState<number | null>(null);

    const handleQuickLog = async (taskType: TaskType) => {
        setIsLogging(taskType.id);

        const result = await onLog({
            animal_id: animalId,
            task_type_id: taskType.id,
            title: t(`types.${taskType.key}`),
        });

        if (result.success) {
            toast.success(`${t(`types.${taskType.key}`)} - ${animalName}`, {
                description: t('quick_log.done'),
            });
        } else {
            toast.error(tToast('error_unknown'));
        }

        setIsLogging(null);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                    <IconPlus className="w-4 h-4 mr-1" />
                    {t('quick_log.title')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {taskTypes.map(type => (
                    <DropdownMenuItem
                        key={type.id}
                        className="cursor-pointer"
                        disabled={isLogging === type.id}
                        onClick={() => handleQuickLog(type)}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <TaskTypeIcon
                                taskKey={type.key}
                                className="w-4 h-4"
                            />
                            <span className="flex-1">{t(`types.${type.key}`)}</span>
                            {isLogging === type.id && (
                                <IconCheck className="w-4 h-4 animate-pulse" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}