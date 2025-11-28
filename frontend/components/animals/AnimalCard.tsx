import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Animal } from "@/types/animal";
import { ErrorMessageType } from "@/types/common";
import { useAnimalTypes } from "@/hooks/animalTypes";
import AnimalFormModal from "@/components/animals/AnimalFormModal";

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface AnimalCardProps {
    animal: Animal;
    isAdmin: boolean;
    onUpdate: (animalId: number, data: {
        name: string;
        animal_type_id: number;
        breed?: string;
        image?: File;
        setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
    }) => Promise<ActionResult>;
    onDelete: (animalId: number) => Promise<ActionResult>;
}

export default function AnimalCard({ animal, isAdmin, onUpdate, onDelete }: AnimalCardProps) {
    const t = useTranslations('animals');
    const tTypes = useTranslations('animals.types');
    const tToast = useTranslations('animals.toast');
    const { animalTypes } = useAnimalTypes();

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const showErrorToast = (error?: ActionResult['error']) => {
        switch (error) {
            case 'forbidden':
                toast.error(tToast('error_forbidden'));
                break;
            case 'not_found':
                toast.error(tToast('error_not_found'));
                break;
            default:
                toast.error(tToast('error_unknown'));
        }
    };

    const handleDelete = async () => {
        const result = await onDelete(animal.id);
        if (result.success) {
            toast.success(tToast('animal_deleted'));
        } else {
            showErrorToast(result.error);
        }
        setDeleteOpen(false);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditOpen(true);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteOpen(true);
    };

    const handleSubmit = async (data: Parameters<typeof onUpdate>[1], animalId?: number) => {
        if (!animalId) return { success: false, error: 'unknown' as const };
        return onUpdate(animalId, data);
    };

    return (
        <>
            <Link href={`/dashboard/animals/${animal.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-lg p-0 cursor-pointer">
                    <div className="aspect-square relative bg-muted">
                        {animal.image_url ? (
                            <img
                                src={animal.image_url}
                                alt={animal.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center text-5xl">
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

                        {/* Botones flotantes */}
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="cursor-pointer h-7 w-7 p-0 rounded-full shadow-md"
                                onClick={handleEditClick}
                            >
                                <IconPencil className="w-3 h-3" />
                            </Button>
                            {isAdmin && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="cursor-pointer h-7 w-7 p-0 rounded-full shadow-md text-destructive hover:text-destructive"
                                    onClick={handleDeleteClick}
                                >
                                    <IconTrash className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="px-2 py-3 text-center">
                        <h3 className="font-semibold text-sm truncate">{animal.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                            {tTypes(animal.type.key)}{animal.breed && ` · ${animal.breed}`}
                        </p>
                    </div>
                </Card>
            </Link>

            <AnimalFormModal
                open={editOpen}
                onOpenChange={setEditOpen}
                animalTypes={animalTypes}
                animal={animal}
                onSubmit={handleSubmit}
            />

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
        </>
    );
}