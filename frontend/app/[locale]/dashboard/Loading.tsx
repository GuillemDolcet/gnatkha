import {Spinner} from "@/components/ui/spinner";

const Loading = () => {
    return (
        <div className="relative min-h-screen">
            <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
                <Spinner />
            </div>
        </div>
    )
}

export default Loading