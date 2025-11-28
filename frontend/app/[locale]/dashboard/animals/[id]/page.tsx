'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    IconPaw,
    IconUsers,
} from "@tabler/icons-react";
import { Animal } from "@/types/animal";
import { useAnimals } from "@/hooks/animals";
import { useAnimalTypes } from "@/hooks/animalTypes";
import { usePacks } from "@/hooks/packs";
import AnimalFormModal from "@/components/animals/AnimalFormModal";

export default function AnimalDetailPage() {
    const t = useTranslations('animals');
    const tTypes = useTranslations('animals.types');
    const tToast = useTranslations('animals.toast');
    const params = useParams();
    const router = useRouter();
    const animalId = parseInt(params.id as string);

    const { packs } = usePacks();
    const { animalTypes } = useAnimalTypes();
    const { fetchAnimal, updateAnimal, deleteAnimal } = useAnimals();

    const [animal, setAnimal] = useState<Animal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        const loadAnimal = async () => {
            setIsLoading(true);
            const data = await fetchAnimal(animalId);
            setAnimal(data);
            setIsLoading(false);
        };
        loadAnimal();
    }, [animalId, fetchAnimal]);

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
                return <IconGenderMale className="w-5 h-5 text-blue-500" />;
            case 'female':
                return <IconGenderFemale className="w-5 h-5 text-pink-500" />;
            default:
                return <IconQuestionMark className="w-5 h-5 text-muted-foreground" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-6">
                <div className="px-4 lg:px-6 pt-4">
                    <Skeleton className="h-8 w-32 mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Skeleton className="aspect-square rounded-lg" />
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-6 w-32" />
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                                <Skeleton className="h-20" />
                            </div>
                        </div>
                    </div>
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
        <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-6">
            <div className="px-4 lg:px-6 pt-4">
                <Link
                    href={animal.pack ? `/dashboard/animals?pack=${animal.pack_id}` : '/dashboard/animals'}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <IconArrowLeft className="w-4 h-4 mr-1" />
                    {t('detail.back')}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Imagen */}
                    <Card className="overflow-hidden p-0 aspect-square">
                        {animal.image_url ? (
                            <img
                                src={animal.image_url}
                                alt={animal.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-8xl bg-muted">
                                {animal.type.key === 'dog' && '🐕'}
                                {animal.type.key === 'cat' && '🐱'}
                                {animal.type.key === 'bird' && '🐦'}
                                {animal.type.key === 'fish' && '🐟'}
                                {animal.type.key === 'rabbit' && '🐰'}
                                {animal.type.key === 'hamster' && '🐹'}
                                {animal.type.key === 'guinea_pig' && '🐹'}
                                {animal.type.key === 'turtle' && '🐢'}
                                {animal.type.key === 'snake' && '🐍'}
                                {animal.type.key === 'lizard' && '🦎'}
                                {animal.type.key === 'ferret' && '🦦'}
                                {animal.type.key === 'horse' && '🐴'}
                                {animal.type.key === 'other' && '🐾'}
                            </div>
                        )}
                    </Card>

                    {/* Info principal */}
                    <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-extrabold">{animal.name}</h1>
                                <p className="text-lg text-muted-foreground">
                                    {tTypes(animal.type.key)}
                                    {animal.breed && ` · ${animal.breed}`}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => setEditOpen(true)}
                                >
                                    <IconPencil className="w-4 h-4 mr-2" />
                                    {t('edit.button')}
                                </Button>
                                {isAdmin && (
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer text-destructive border-destructive hover:bg-destructive/10"
                                        onClick={() => setDeleteOpen(true)}
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Detalles */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {animal.birth_date && (
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <IconCalendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('detail.age')}</p>
                                            <p className="font-semibold">{formatAge(animal.birth_date)}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        {getSexIcon(animal.sex)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('detail.sex')}</p>
                                        <p className="font-semibold">{t(`sex.${animal.sex}`)}</p>
                                    </div>
                                </div>
                            </Card>

                            {animal.weight && (
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <IconScale className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('detail.weight')}</p>
                                            <p className="font-semibold">{animal.weight} kg</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {animal.chip_number && (
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <IconId className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('detail.chip')}</p>
                                            <p className="font-semibold font-mono text-sm">{animal.chip_number}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {animal.pack && (
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <IconUsers className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('detail.pack')}</p>
                                            <p className="font-semibold">{animal.pack.name}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Notas */}
                        {animal.notes && (
                            <Card className="p-4 mt-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <IconNotes className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground mb-1">{t('detail.notes')}</p>
                                        <p className="whitespace-pre-wrap">{animal.notes}</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {animal && (
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