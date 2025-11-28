import { useState, useRef, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconPhoto, IconCheck } from "@tabler/icons-react";
import { Animal, AnimalType, AnimalSex } from "@/types/animal";
import { Pack } from "@/types/pack";
import { ErrorMessageType } from "@/types/common";

interface ActionResult {
    success: boolean;
    error?: 'forbidden' | 'not_found' | 'unknown';
}

interface AnimalFormData {
    name: string;
    animal_type_id: number;
    pack_id?: number;
    breed?: string;
    birth_date?: string;
    sex?: AnimalSex;
    weight?: number;
    chip_number?: string;
    notes?: string;
    image?: File;
    default_image_id?: number;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, ErrorMessageType[]>>>;
}

interface AnimalFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    animalTypes: AnimalType[];
    packs?: Pack[];
    animal?: Animal | null;
    defaultPackId?: number | null;
    onSubmit: (data: AnimalFormData, animalId?: number) => Promise<ActionResult>;
}

export default function AnimalFormModal({
                                            open,
                                            onOpenChange,
                                            animalTypes,
                                            packs,
                                            animal,
                                            defaultPackId,
                                            onSubmit,
                                        }: AnimalFormModalProps) {
    const t = useTranslations('animals');
    const tSex = useTranslations('animals.sex');
    const tTypes = useTranslations('animals.types');
    const tToast = useTranslations('animals.toast');

    const isEditing = !!animal;

    const [name, setName] = useState('');
    const [animalTypeId, setAnimalTypeId] = useState<string>('');
    const [packId, setPackId] = useState<string>('');
    const [breed, setBreed] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [sex, setSex] = useState<string>('unknown');
    const [weight, setWeight] = useState('');
    const [chipNumber, setChipNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedDefaultImageId, setSelectedDefaultImageId] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, ErrorMessageType[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inicializar/resetear formulario cuando se abre o cambia el animal
    useEffect(() => {
        if (open) {
            if (animal) {
                // Modo edición
                setName(animal.name);
                setAnimalTypeId(animal.type.id.toString());
                setPackId(animal.pack_id.toString());
                setBreed(animal.breed || '');
                setBirthDate(animal.birth_date || '');
                setSex(animal.sex || 'unknown');
                setWeight(animal.weight?.toString() || '');
                setChipNumber(animal.chip_number || '');
                setNotes(animal.notes || '');
                setImage(null);
                setImagePreview(animal.image_url || null);
                setSelectedDefaultImageId(animal.default_image_id || null);
            } else {
                // Modo creación
                setName('');
                setAnimalTypeId('');
                setPackId(defaultPackId?.toString() ?? '');
                setBreed('');
                setBirthDate('');
                setSex('unknown');
                setWeight('');
                setChipNumber('');
                setNotes('');
                setImage(null);
                setImagePreview(null);
                setSelectedDefaultImageId(null);
            }
            setErrors({});
        }
    }, [open, animal, defaultPackId]);

    const selectedType = useMemo(() => {
        return animalTypes.find(t => t.id.toString() === animalTypeId);
    }, [animalTypes, animalTypeId]);

    const defaultImages = selectedType?.default_images ?? [];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setSelectedDefaultImageId(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectDefaultImage = (imageId: number, imageUrl: string) => {
        setSelectedDefaultImageId(imageId);
        setImage(null);
        setImagePreview(imageUrl);
    };

    const handleTypeChange = (value: string) => {
        setAnimalTypeId(value);
        setSelectedDefaultImageId(null);
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isPackRequired = !isEditing && packs && packs.length > 0;
        if (!name.trim() || !animalTypeId || (isPackRequired && !packId)) return;

        setIsSubmitting(true);

        const data: AnimalFormData = {
            name: name.trim(),
            animal_type_id: parseInt(animalTypeId),
            breed: breed.trim() || undefined,
            birth_date: birthDate || undefined,
            sex: sex as AnimalSex,
            weight: weight ? parseFloat(weight) : undefined,
            chip_number: chipNumber.trim() || undefined,
            notes: notes.trim() || undefined,
            image: image || undefined,
            default_image_id: selectedDefaultImageId || undefined,
            setErrors,
        };

        // Solo incluir pack_id en creación
        if (!isEditing && packId) {
            data.pack_id = parseInt(packId);
        }

        const result = await onSubmit(data, animal?.id);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? tToast('animal_updated') : tToast('animal_created'));
            onOpenChange(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
    };

    const isFormValid = () => {
        if (!name.trim() || !animalTypeId) return false;
        if (!isEditing && packs && packs.length > 0 && !packId) return false;
        return true;
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? t('edit.title') : t('create.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? t('edit.description') : t('create.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="w-full">
                            <Label htmlFor="animal-name">{t('create.name_label')}</Label>
                            <Input
                                id="animal-name"
                                type="text"
                                name="name"
                                value={name}
                                set={setName}
                                setErrors={setErrors}
                                errors={errors?.name}
                                placeholder={t('create.name_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className={`grid gap-4 grid-cols-1 ${!isEditing && packs ? 'md:grid-cols-2' : ''}`}>
                            <div className="w-full">
                                <Label htmlFor="animal-type">{t('create.type_label')}</Label>
                                <Select value={animalTypeId} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={t('create.type_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {animalTypes.map(type => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id.toString()}
                                                className="cursor-pointer"
                                            >
                                                {tTypes(type.key)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {!isEditing && packs && (
                                <div className="w-full">
                                    <Label htmlFor="animal-pack">{t('create.pack_label')}</Label>
                                    <Select value={packId} onValueChange={setPackId}>
                                        <SelectTrigger className="mt-1 w-full cursor-pointer">
                                            <SelectValue placeholder={t('create.pack_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packs.map(pack => (
                                                <SelectItem
                                                    key={pack.id}
                                                    value={pack.id.toString()}
                                                    className="cursor-pointer"
                                                >
                                                    {pack.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="w-full">
                            <Label htmlFor="animal-breed">{t('create.breed_label')}</Label>
                            <Input
                                id="animal-breed"
                                type="text"
                                name="breed"
                                value={breed}
                                set={setBreed}
                                setErrors={setErrors}
                                errors={errors?.breed}
                                placeholder={t('create.breed_placeholder')}
                                className="mt-1 w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="animal-birth-date">{t('create.birth_date_label')}</Label>
                                <Input
                                    id="animal-birth-date"
                                    type="date"
                                    name="birth_date"
                                    value={birthDate}
                                    set={setBirthDate}
                                    setErrors={setErrors}
                                    errors={errors?.birth_date}
                                    className="mt-1 w-full"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="w-full">
                                <Label htmlFor="animal-sex">{t('create.sex_label')}</Label>
                                <Select value={sex} onValueChange={setSex}>
                                    <SelectTrigger className="mt-1 w-full cursor-pointer">
                                        <SelectValue placeholder={t('create.sex_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male" className="cursor-pointer">{tSex('male')}</SelectItem>
                                        <SelectItem value="female" className="cursor-pointer">{tSex('female')}</SelectItem>
                                        <SelectItem value="unknown" className="cursor-pointer">{tSex('unknown')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <Label htmlFor="animal-weight">{t('create.weight_label')}</Label>
                                <Input
                                    id="animal-weight"
                                    type="number"
                                    name="weight"
                                    value={weight}
                                    set={setWeight}
                                    setErrors={setErrors}
                                    errors={errors?.weight}
                                    placeholder={t('create.weight_placeholder')}
                                    className="mt-1 w-full"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="w-full">
                                <Label htmlFor="animal-chip">{t('create.chip_label')}</Label>
                                <Input
                                    id="animal-chip"
                                    type="text"
                                    name="chip_number"
                                    value={chipNumber}
                                    set={setChipNumber}
                                    setErrors={setErrors}
                                    errors={errors?.chip_number}
                                    placeholder={t('create.chip_placeholder')}
                                    className="mt-1 w-full"
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="animal-notes">{t('create.notes_label')}</Label>
                            <Textarea
                                id="animal-notes"
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('create.notes_placeholder')}
                                className="mt-1 w-full min-h-[80px]"
                            />
                        </div>

                        <div className="w-full">
                            <Label>{t('create.image_label')}</Label>

                            {defaultImages.length > 0 && (
                                <div className="mt-2 mb-3">
                                    <p className="text-sm text-muted-foreground mb-2">{t('create.default_images')}</p>
                                    <div className="grid grid-cols-5 gap-2">
                                        {defaultImages.map(img => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() => handleSelectDefaultImage(img.id, img.image_url)}
                                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                                    selectedDefaultImageId === img.id
                                                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                        : 'border-transparent hover:border-muted-foreground/50'
                                                }`}
                                            >
                                                <img
                                                    src={img.image_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                                {selectedDefaultImageId === img.id && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                        <IconCheck className="w-6 h-6 text-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors w-full"
                            >
                                {imagePreview && !selectedDefaultImageId ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-32 mx-auto rounded"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <IconPhoto className="w-8 h-8 mb-2" />
                                        <span className="text-sm">{t('create.image_placeholder')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleOpenChange(false)}
                        >
                            {t('create.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isFormValid() || isSubmitting}
                            className="cursor-pointer"
                        >
                            {isSubmitting
                                ? (isEditing ? t('edit.submitting') : t('create.submitting'))
                                : (isEditing ? t('edit.submit') : t('create.submit'))
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}