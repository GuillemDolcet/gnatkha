import { Skeleton } from "@/components/ui/skeleton";

export default function MemberSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    );
}