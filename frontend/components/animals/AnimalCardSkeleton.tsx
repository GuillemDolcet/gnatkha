import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnimalCardSkeleton() {
    return (
        <Card className="overflow-hidden p-0">
            <div className="aspect-square">
                <Skeleton className="w-full h-full rounded-none" />
            </div>
            <div className="px-2 py-3 space-y-1">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
        </Card>
    );
}