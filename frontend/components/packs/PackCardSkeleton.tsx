import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PackCardSkeleton() {
    return (
        <Card className="flex flex-col p-6">
            <div className="flex-1">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex items-center mt-4 border-t pt-4">
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
                <Skeleton className="h-10 flex-1 min-w-[80px]" />
                <Skeleton className="h-10 flex-1 min-w-[80px]" />
                <Skeleton className="h-10 flex-1 min-w-[80px]" />
            </div>
        </Card>
    );
}