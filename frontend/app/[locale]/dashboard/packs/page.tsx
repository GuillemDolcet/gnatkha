'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import PackCard from "@/components/packs/PackCard";
import PackCardSkeleton from "@/components/packs/PackCardSkeleton";
import JoinPackCard from "@/components/packs/JoinPackCard";
import CreatePackCard from "@/components/packs/CreatePackCard";
import { usePacks } from "@/hooks/packs";
import { useAuth } from "@/hooks/auth";
import { ErrorMessageType } from '@/types/common';

export default function Page() {
    const t = useTranslations('packs');
    const { user } = useAuth();
    const {
        packs,
        isLoading,
        createPack,
        joinPack,
        leavePack,
        deletePack,
        getMembers,
        removeMember,
        transferAdmin,
    } = usePacks();

    const [createErrors, setCreateErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [joinErrors, setJoinErrors] = useState<Record<string, ErrorMessageType[]>>({});

    const handleCreate = useCallback(async (name: string) => {
        return await createPack({
            name,
            setErrors: setCreateErrors,
        });
    }, [createPack]);

    const handleJoin = useCallback(async (code: string) => {
        return await joinPack({
            invitation_code: code,
            setErrors: setJoinErrors,
        });
    }, [joinPack]);

    return (
        <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-6">
            <h1 className="text-3xl font-extrabold px-4 lg:px-6 pt-4">
                {t('title')}
            </h1>

            <div className="flex flex-col md:flex-row gap-4 px-4 lg:px-6 py-2">
                <CreatePackCard
                    onCreate={handleCreate}
                    errors={createErrors}
                    setErrors={setCreateErrors}
                />
                <JoinPackCard
                    onJoin={handleJoin}
                    errors={joinErrors}
                    setErrors={setJoinErrors}
                />
            </div>

            <div className="px-4 lg:px-6">
                <h2 className="text-2xl font-bold mb-6">{t('your_packs')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        <>
                            <PackCardSkeleton />
                            <div className="hidden md:block"><PackCardSkeleton /></div>
                            <div className="hidden lg:block"><PackCardSkeleton /></div>
                            <div className="hidden xl:block"><PackCardSkeleton /></div>
                        </>
                    ) : packs?.length ? (
                        packs.map(pack => (
                            <PackCard
                                key={pack.id}
                                pack={pack}
                                currentUserId={user?.id ?? 0}
                                onLeave={leavePack}
                                onDelete={deletePack}
                                onGetMembers={getMembers}
                                onRemoveMember={removeMember}
                                onTransferAdmin={transferAdmin}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full">
                            {t('empty')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}