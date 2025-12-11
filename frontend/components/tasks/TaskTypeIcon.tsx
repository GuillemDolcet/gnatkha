import {
    IconBowlFilled,
    IconWalk,
    IconStethoscope,
    IconVaccine,
    IconPill,
    IconScissors,
    IconTarget,
    IconBallFootball,
    IconDroplet,
    IconScale,
    IconDots,
} from "@tabler/icons-react";

interface TaskTypeIconProps {
    taskKey: string;
    className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    feed: IconBowlFilled,
    walk: IconWalk,
    vet: IconStethoscope,
    vaccine: IconVaccine,
    medication: IconPill,
    grooming: IconScissors,
    training: IconTarget,
    play: IconBallFootball,
    bath: IconDroplet,
    weight: IconScale,
    other: IconDots,
};

export default function TaskTypeIcon({ taskKey, className = "w-5 h-5" }: TaskTypeIconProps) {
    const Icon = iconMap[taskKey] || IconDots;
    return <Icon className={className} />;
}