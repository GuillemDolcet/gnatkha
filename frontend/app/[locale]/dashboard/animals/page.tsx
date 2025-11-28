'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import AnimalCard from "@/components/animals/AnimalCard";
import AnimalCardSkeleton from "@/components/animals/AnimalCardSkeleton";
import CreateAnimalModal from "@/components/animals/CreateAnimalModal";
import { useAnimals } from "@/hooks/animals";
import { useAnimalTypes } from "@/hooks/animalTypes";
import { usePacks } from "@/hooks/packs";
import { useAuth } from "@/hooks/auth";

export default function AnimalsPage() {
    const t = useTranslations('animals');
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const packIdParam = searchParams.get('pack');

    const { packs, isLoading: packsLoading } = usePacks();
    const { animalTypes, isLoading: typesLoading } = useAnimalTypes();
    const {
        animals,
        animalsByPack,
        isLoading: animalsLoading,
        fetchAnimalsForPack,
        fetchAllAnimals,
        createAnimal,
        updateAnimal,
        deleteAnimal
    } = useAnimals();

    const [createOpen, setCreateOpen] = useState(false);
    const [defaultPackId, setDefaultPackId] = useState<number | null>(null);

    // Determinar si estamos filtrando por un pack específico
    const filteredPackId = packIdParam ? parseInt(packIdParam) : null;

    // Cargar animales según el modo
    useEffect(() => {
        if (packs.length === 0) return;

        if (filteredPackId) {
            fetchAnimalsForPack(filteredPackId);
        } else {
            fetchAllAnimals(packs);
        }
    }, [packs, filteredPackId, fetchAnimalsForPack, fetchAllAnimals]);

    const filteredPack = useMemo(() => {
        if (!filteredPackId) return null;
        return packs.find(p => p.id === filteredPackId);
    }, [packs, filteredPackId]);

    const isLoading = packsLoading || typesLoading || animalsLoading;

    const handleOpenCreate = (packId?: number) => {
        setDefaultPackId(packId ?? null);
        setCreateOpen(true);
    };

    const isAdminOfPack = (packId: number) => {
        const pack = packs.find(p => p.id === packId);
        return pack?.is_admin ?? false;
    };

    return (
        <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 lg:px-6 pt-4">
                <div>
                    <h1 className="text-3xl font-extrabold">
                        {filteredPack ? filteredPack.name : t('title')}
                    </h1>
                    {filteredPack && (
                        <p className="text-muted-foreground">{t('pack_pets')}</p>
                    )}
                </div>

                <Button
                    onClick={() => handleOpenCreate(filteredPackId ?? undefined)}
                    className="cursor-pointer"
                    disabled={packs.length === 0}
                >
                    <IconPlus className="w-4 h-4 mr-2" />
                    {t('add_button')}
                </Button>
            </div>

            <div className="px-4 lg:px-6">
                {isLoading ? (
                    <div className="space-y-8">
                        <div>
                            <div className="h-6 w-32 bg-muted rounded mb-4" />
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
                                <AnimalCardSkeleton />
                                <AnimalCardSkeleton />
                                <AnimalCardSkeleton />
                                <AnimalCardSkeleton />
                            </div>
                        </div>
                    </div>
                ) : packs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('no_packs')}</p>
                    </div>
                ) : filteredPackId ? (
                    // Vista filtrada por pack
                    animals.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t('empty')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
                            {animals.map(animal => (
                                <AnimalCard
                                    key={animal.id}
                                    animal={animal}
                                    isAdmin={isAdminOfPack(animal.pack_id)}
                                    onUpdate={updateAnimal}
                                    onDelete={deleteAnimal}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    // Vista de todas las manadas
                    animalsByPack.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t('empty_all')}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {animalsByPack.map(({ pack, animals: packAnimals }) => (
                                <div key={pack.id}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold">{pack.name}</h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer"
                                            onClick={() => handleOpenCreate(pack.id)}
                                        >
                                            <IconPlus className="w-4 h-4 mr-1" />
                                            {t('add_to_pack')}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
                                        {packAnimals.map(animal => (
                                            <AnimalCard
                                                key={animal.id}
                                                animal={animal}
                                                isAdmin={pack.is_admin ?? false}
                                                onUpdate={updateAnimal}
                                                onDelete={deleteAnimal}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <CreateAnimalModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                packs={packs}
                animalTypes={animalTypes}
                onCreate={createAnimal}
                defaultPackId={defaultPackId}
            />
        </div>
    );
}